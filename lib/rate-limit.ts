import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Public chat hits a paid LLM per request. Cap requests per client IP.
// Tunable here; sliding window so the budget refills gradually, not in bursts.
const LIMIT = 10;
const WINDOW = "1 d" as const;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
  // false when Upstash isn't configured: we fail open so local dev and tests
  // run without Redis. The provider spend cap is the backstop in that case.
  enforced: boolean;
}

// undefined = not yet resolved, null = disabled (no Upstash env present).
let limiter: Ratelimit | null | undefined;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      "[rate-limit] Upstash not configured; chat is unmetered (fail-open).",
    );
    limiter = null;
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
    analytics: false,
    prefix: "ratelimit:chat",
  });
  return limiter;
}

export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const l = getLimiter();
  if (!l) {
    return { success: true, remaining: LIMIT, limit: LIMIT, reset: 0, enforced: false };
  }
  const { success, remaining, limit, reset } = await l.limit(identifier);
  return { success, remaining, limit, reset, enforced: true };
}
