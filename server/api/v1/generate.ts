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

import { defineEventHandler, getHeader, readBody } from "h3";
import { sql } from "@/lib/db";
import { createTask } from "@/lib/kie-api/client";
import { getActiveModelBySlug } from "@/lib/api/shared";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default defineEventHandler(async (event) => {
  try {
    // 1. Authenticate via Bearer API key
    const auth = getHeader(event, "authorization");
    if (!auth?.startsWith("Bearer cx_")) {
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
      return { error: "Invalid or inactive API key" };
    }

    const userId = keyRows[0].user_id;

    // 2. Parse request body
    const body = await readBody(event);
    const { model: modelSlug, prompt, resolution } = body;

    if (!modelSlug || typeof modelSlug !== "string") {
      return { error: "model is required" };
    }
    if (!prompt || typeof prompt !== "string") {
      return { error: "prompt is required" };
    }

    // 3. Look up model
    const model = await getActiveModelBySlug(modelSlug);
    if (!model) {
      return { error: `Model '${modelSlug}' not found or inactive` };
    }

    // 4. Check credits
    const balanceRows = (await sql`
      SELECT credits_balance FROM users WHERE id = ${userId} LIMIT 1
    `) as { credits_balance: number }[];

    const balance = Number(balanceRows[0]?.credits_balance ?? 0);
    const cost = Number(model.cortexia_price_usd ?? 0);

    if (balance < cost) {
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
    };
  } catch (err) {
    console.error("[api/v1/generate]", err);
    return { error: "Internal server error" };
  }
});
