import {
  CanActivate,
  ExecutionContext,
  Global,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Module,
  OnModuleDestroy,
  ServiceUnavailableException,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createHash } from 'node:crypto';
import IORedis from 'ioredis';

const RATE_LIMIT_KEY = 'app:rate-limit';
const RATE_LIMIT_SCRIPT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return { count, redis.call('TTL', KEYS[1]) }
`;

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly redis?: IORedis;
  private readonly localCounts = new Map<string, RateLimitState>();

  constructor(
    private readonly reflector: Reflector,
    config: ConfigService,
  ) {
    const redisUrl = config.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redis = new IORedis(redisUrl, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
      });
      this.redis.on('error', (error: Error) => {
        this.logger.error(`Redis rate-limit connection error: ${error.message}`);
      });
    } else if (!['development', 'test'].includes(config.get<string>('NODE_ENV') || process.env.NODE_ENV || '')) {
      throw new Error('REDIS_URL is required outside development and test environments');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!policy) return true;

    const request = context.switchToHttp().getRequest<{
      ip?: string;
      socket?: { remoteAddress?: string };
      method: string;
      route?: { path?: string };
      path?: string;
      user?: { sub?: string };
    }>();
    const response = context.switchToHttp().getResponse<{ setHeader(name: string, value: string): void }>();
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const route = `${request.method}:${request.route?.path || request.path || context.getHandler().name}`;
    const clientIdentity = request.user?.sub ? `user:${request.user.sub}` : `ip:${ip}`;
    const identity = createHash('sha256').update(clientIdentity).digest('hex');
    const key = `rate-limit:${identity}:${route}`;
    const now = Date.now();

    let count: number;
    let resetAt: number;
    if (this.redis) {
      try {
        const result = await this.redis.eval(RATE_LIMIT_SCRIPT, 1, key, policy.windowSeconds) as [number, number];
        count = Number(result[0]);
        resetAt = now + Math.max(1, Number(result[1])) * 1000;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Unable to enforce distributed rate limit: ${message}`);
        throw new ServiceUnavailableException('Request protection is temporarily unavailable');
      }
    } else {
      ({ count, resetAt } = this.consumeLocal(key, policy, now));
    }

    const remaining = Math.max(0, policy.limit - count);
    response.setHeader('X-RateLimit-Limit', String(policy.limit));
    response.setHeader('X-RateLimit-Remaining', String(remaining));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (count > policy.limit) {
      const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
      response.setHeader('Retry-After', String(retryAfter));
      throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private consumeLocal(key: string, policy: RateLimitOptions, now: number): RateLimitState {
    let current = this.localCounts.get(key);
    if (!current || current.resetAt <= now) {
      current = { count: 0, resetAt: now + policy.windowSeconds * 1000 };
    }
    current.count += 1;
    this.localCounts.set(key, current);

    if (this.localCounts.size > 5_000) {
      for (const [storedKey, state] of this.localCounts) {
        if (state.resetAt <= now) this.localCounts.delete(storedKey);
      }
      if (this.localCounts.size > 10_000) {
        throw new ServiceUnavailableException('Request protection capacity is temporarily exhausted');
      }
    }
    return current;
  }

  async onModuleDestroy() {
    await this.redis?.quit();
  }
}

@Global()
@Module({
  providers: [RateLimitGuard],
  exports: [RateLimitGuard],
})
export class RateLimitModule {}
