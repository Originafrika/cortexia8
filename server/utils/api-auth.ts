/**
 * Shared API authentication and rate limiting helper.
 */

import { H3Event, getHeader, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../src/lib/utils/crypto";
import { checkRateLimit, getRemainingRequests, getResetTime, RATE_LIMITS } from "../../src/lib/rate-limit";

export type ApiAuthResult =
  | { ok: true; userId: number }
  | { ok: false; error: string; status: number };

/**
 * Authenticate API request via Bearer API key and apply rate limiting.
 */
export async function authenticateApiRequest(
  event: H3Event,
  rateLimitKey?: string,
): Promise<ApiAuthResult> {
  // 1. Check Authorization header
  const auth = getHeader(event, "authorization");
  if (!auth?.startsWith("Bearer cx_")) {
    setResponseStatus(event, 401);
    return { ok: false, error: "Invalid API key format. Use: Authorization: Bearer cx_...", status: 401 };
  }

  const token = auth.slice(7);
  const keyHash = await sha256Hex(token);

  // 2. Look up API key
  const keyRows = (await sql`
    SELECT id, user_id FROM api_keys
    WHERE key_hash = ${keyHash} AND status = 'active'
    LIMIT 1
  `) as { id: number; user_id: number }[];

  if (keyRows.length === 0) {
    setResponseStatus(event, 401);
    return { ok: false, error: "Invalid or inactive API key", status: 401 };
  }

  const userId = keyRows[0].user_id;

  // 3. Rate limit
  const rlKey = rateLimitKey ?? `api:${userId}`;
  if (!checkRateLimit(rlKey, RATE_LIMITS.general)) {
    setResponseStatus(event, 429);
    return { ok: false, error: "Rate limit exceeded", status: 429 };
  }

  // 4. Set rate limit headers
  const remaining = getRemainingRequests(rlKey, RATE_LIMITS.general);
  const resetMs = getResetTime(rlKey);
  const resetSeconds = Math.ceil(resetMs / 1000);

  setResponseStatus(event, 200);
  event.node.res.setHeader("X-RateLimit-Limit", String(RATE_LIMITS.general.limit));
  event.node.res.setHeader("X-RateLimit-Remaining", String(remaining));
  event.node.res.setHeader("X-RateLimit-Reset", String(resetSeconds));

  return { ok: true, userId };
}
