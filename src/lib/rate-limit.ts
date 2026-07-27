/**
 * In-memory rate limiter for server functions.
 * Resets on server restart. For production, consider Redis-based limiter.
 */

const rateLimits = new Map<string, { count: number; resetAt: number }>();

export type RateLimitConfig = {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
};

/**
 * Check if a request is within the rate limit.
 * @param key - Unique identifier (e.g., IP address, user ID, endpoint)
 * @param config - Rate limit configuration
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start new window
    rateLimits.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.limit) {
    // Rate limited
    return false;
  }

  // Increment counter
  entry.count++;
  return true;
}

/**
 * Get remaining requests in the current window.
 */
export function getRemainingRequests(key: string, config: RateLimitConfig): number {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    return config.limit;
  }

  return Math.max(0, config.limit - entry.count);
}

/**
 * Get time until the current window resets (in milliseconds).
 */
export function getResetTime(key: string): number {
  const entry = rateLimits.get(key);
  if (!entry) return 0;
  return Math.max(0, entry.resetAt - Date.now());
}

/**
 * Clean up expired entries (call periodically to prevent memory leaks).
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetAt) {
      rateLimits.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

// ── Preset configurations ──────────────────────────────────────────────────

export const RATE_LIMITS = {
  /** Auth endpoints: 5 requests per minute */
  auth: { limit: 5, windowMs: 60 * 1000 },

  /** Generation endpoints: 30 requests per minute */
  generation: { limit: 30, windowMs: 60 * 1000 },

  /** Status polling: 100 requests per minute */
  statusPolling: { limit: 100, windowMs: 60 * 1000 },

  /** Payment verification: 10 requests per minute */
  payment: { limit: 10, windowMs: 60 * 1000 },

  /** Webhook handlers: 50 requests per minute per IP */
  webhook: { limit: 50, windowMs: 60 * 1000 },

  /** General API: 60 requests per minute */
  general: { limit: 60, windowMs: 60 * 1000 },
} as const;
