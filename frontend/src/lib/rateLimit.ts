import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis only if keys are available
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Map to store rate limiters by their configuration string to avoid recreating them
const limiters = new Map<string, Ratelimit>();

export async function checkRateLimit(
  ip: string,
  action: string,
  maxRequests: number = 5,
  windowMinutes: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    // If Redis is not configured, we gracefully fail open (allow request)
    // This ensures local development works even without Upstash keys
    if (!redis) {
      console.warn("Upstash Redis keys not found. Rate limiting is bypassed.");
      return { success: true };
    }

    const configKey = `${maxRequests}_${windowMinutes}m`;
    let ratelimit = limiters.get(configKey);
    
    if (!ratelimit) {
      ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowMinutes} m`),
        analytics: true,
        prefix: "@upstash/ratelimit",
      });
      limiters.set(configKey, ratelimit);
    }

    const identifier = `${ip}_${action}`;
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return { 
        success: false, 
        error: `Too many requests from this IP. Please try again in ${windowMinutes} minute(s).` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Rate Limit Error:", error);
    // On database/network error, fail open to not block legitimate users
    return { success: true };
  }
}
