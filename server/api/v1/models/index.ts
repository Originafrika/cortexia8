/**
 * GET /v1/models — List all active models.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Query params:
 *   category: string (optional) — filter by "image", "video", "audio", "text", "music"
 *
 * Response:
 *   data: Array of model objects
 */

import { defineEventHandler, getHeader, getQuery, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../src/lib/utils/crypto";
import { checkRateLimit, getRemainingRequests, getResetTime, RATE_LIMITS } from "../../../src/lib/rate-limit";

export default defineEventHandler(async (event) => {
  try {
    // 1. Authenticate via Bearer API key
    const auth = getHeader(event, "authorization");
    if (!auth?.startsWith("Bearer cx_")) {
      setResponseStatus(event, 401);
      return { error: "Invalid API key format. Use: Authorization: Bearer cx_..." };
    }
    const token = auth.slice(7);
    const keyHash = await sha256Hex(token);

    const keyRows = (await sql`
      SELECT id, user_id FROM api_keys
      WHERE key_hash = ${keyHash} AND status = 'active'
      LIMIT 1
    `) as { id: number; user_id: number }[];

    if (keyRows.length === 0) {
      setResponseStatus(event, 401);
      return { error: "Invalid or inactive API key" };
    }

    const userId = keyRows[0].user_id;

    // Rate limit
    const rlKey = `api:models:${userId}`;
    if (!checkRateLimit(rlKey, RATE_LIMITS.general)) {
      setResponseStatus(event, 429);
      return { error: "Rate limit exceeded" };
    }

    // Set rate limit headers
    const remaining = getRemainingRequests(rlKey, RATE_LIMITS.general);
    const resetMs = getResetTime(rlKey);
    event.node.res.setHeader("X-RateLimit-Limit", String(RATE_LIMITS.general.limit));
    event.node.res.setHeader("X-RateLimit-Remaining", String(remaining));
    event.node.res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));

    // 2. Parse optional category filter
    const query = getQuery(event);
    const category = query.category as string | undefined;

    // Validate category if provided
    if (category && !["image", "video", "audio", "text", "music"].includes(category)) {
      setResponseStatus(event, 400);
      return { error: `Invalid category '${category}'. Valid: image, video, audio, text, music` };
    }

    // 3. Query models
    const rows = (await sql`
      SELECT slug, name, provider, category, cortexia_price_usd::text AS price_usd,
             supports_reference_upload, fidelity_status
      FROM models
      WHERE active = TRUE
        ${category ? sql`AND category = ${category}` : sql``}
      ORDER BY category, name
    `) as {
      slug: string;
      name: string;
      provider: string;
      category: string;
      price_usd: string;
      supports_reference_upload: boolean;
      fidelity_status: string;
    }[];

    // 4. Return response
    return {
      data: rows.map((r) => ({
        slug: r.slug,
        name: r.name,
        provider: r.provider,
        category: r.category,
        price_usd: Number(r.price_usd),
        supports_reference_upload: r.supports_reference_upload,
        fidelity_status: r.fidelity_status,
      })),
      total: rows.length,
    };
  } catch (err) {
    console.error("[api/v1/models]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
