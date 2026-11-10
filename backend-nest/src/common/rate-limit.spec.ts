import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit';

describe('RateLimitGuard', () => {
  const headers = new Map<string, string>();
  const handler = () => undefined;
  const request = { ip: '192.0.2.10', method: 'POST', route: { path: '/auth/login' } };
  const context = {
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({
        setHeader: (name: string, value: string) => headers.set(name, value),
      }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    headers.clear();
    request.ip = '192.0.2.10';
    request.route.path = '/auth/login';
  });

  it('allows requests under the route limit and returns rate headers', async () => {
    const reflector = { getAllAndOverride: () => ({ limit: 2, windowSeconds: 60 }) } as unknown as Reflector;
    const config = { get: (name: string) => name === 'NODE_ENV' ? 'development' : undefined } as unknown as ConfigService;
    const guard = new RateLimitGuard(reflector, config);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(headers.get('X-RateLimit-Limit')).toBe('2');
    expect(headers.get('X-RateLimit-Remaining')).toBe('0');
    await expect(guard.onModuleDestroy()).resolves.toBeUndefined();
  });

  it('rejects requests over the route limit', async () => {
    const reflector = { getAllAndOverride: () => ({ limit: 1, windowSeconds: 60 }) } as unknown as Reflector;
    const config = { get: (name: string) => name === 'NODE_ENV' ? 'development' : undefined } as unknown as ConfigService;
    const guard = new RateLimitGuard(reflector, config);

    await guard.canActivate(context);
    await expect(guard.canActivate(context)).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
    expect(headers.has('Retry-After')).toBe(true);
    await expect(guard.onModuleDestroy()).resolves.toBeUndefined();
  });

  it('isolates counters by route and client IP', async () => {
    const reflector = { getAllAndOverride: () => ({ limit: 1, windowSeconds: 60 }) } as unknown as Reflector;
    const config = { get: (name: string) => name === 'NODE_ENV' ? 'development' : undefined } as unknown as ConfigService;
    const guard = new RateLimitGuard(reflector, config);

    await guard.canActivate(context);
    request.route.path = '/auth/register';
    await expect(guard.canActivate(context)).resolves.toBe(true);
    request.route.path = '/auth/login';
    request.ip = '192.0.2.11';
    await expect(guard.canActivate(context)).resolves.toBe(true);
    await expect(guard.onModuleDestroy()).resolves.toBeUndefined();
  });

  it('requires Redis outside development and test rather than silently using per-process limits', () => {
    const reflector = {} as Reflector;
    const config = { get: (name: string) => name === 'NODE_ENV' ? 'staging' : undefined } as unknown as ConfigService;
    expect(() => new RateLimitGuard(reflector, config)).toThrow('REDIS_URL is required outside development and test environments');
  });
});
