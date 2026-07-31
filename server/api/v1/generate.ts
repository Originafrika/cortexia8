/**
 * POST /v1/generate — Start a media generation task.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Request body:
 *   model: string (required) — model slug (e.g., "seedream-5-pro")
 *   prompt: string (required) — text prompt
 *   resolution: string (optional) — e.g., "1K", "2K"
 *
 * Response:
 *   id: string — generation ID
 *   object: "generation"
 *   status: "processing"
 *   model: string — model slug
 */

import { defineEventHandler, getHeader, readBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { createTask } from "@/lib/kie-api/client";
import { getActiveModelBySlug } from "@/lib/api/shared";
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
    const rlKey = `api:generate:${userId}`;
    if (!checkRateLimit(rlKey, RATE_LIMITS.generation)) {
      setResponseStatus(event, 429);
      return { error: "Rate limit exceeded" };
    }

    // Set rate limit headers
    const remaining = getRemainingRequests(rlKey, RATE_LIMITS.generation);
    const resetMs = getResetTime(rlKey);
    event.node.res.setHeader("X-RateLimit-Limit", String(RATE_LIMITS.generation.limit));
    event.node.res.setHeader("X-RateLimit-Remaining", String(remaining));
    event.node.res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));

    // 2. Parse request body
    const body = await readBody(event);
    const { model: modelSlug, prompt, resolution } = body;

    if (!modelSlug || typeof modelSlug !== "string") {
      setResponseStatus(event, 400);
      return { error: "model is required" };
    }
    if (!prompt || typeof prompt !== "string") {
      setResponseStatus(event, 400);
      return { error: "prompt is required" };
    }
    if (prompt.length > 10000) {
      setResponseStatus(event, 400);
      return { error: "prompt too long (max 10000 characters)" };
    }

    // 3. Look up model
    const model = await getActiveModelBySlug(modelSlug);
    if (!model) {
      setResponseStatus(event, 404);
      return { error: `Model '${modelSlug}' not found or inactive` };
    }

    // 4. Check credits
    const balanceRows = (await sql`
      SELECT credits_balance FROM users WHERE id = ${userId} LIMIT 1
    `) as { credits_balance: number }[];

    const balance = Number(balanceRows[0]?.credits_balance ?? 0);
    const cost = Number(model.cortexia_price_usd ?? 0);

    if (balance < cost) {
      setResponseStatus(event, 402);
      return { error: "Insufficient credits", balance, required: cost };
    }

    // 5. Create task via kie.ai
    const input: Record<string, unknown> = { prompt };
    if (resolution) input.resolution = resolution;

    const taskResult = await createTask({
      modelSlug: model.slug,
      input,
      userId,
      workflowId: null,
    });

    // 6. Return response
    return {
      id: `gen_${taskResult.runId}`,
      object: "generation",
      status: "processing",
      model: modelSlug,
      created_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[api/v1/generate]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
