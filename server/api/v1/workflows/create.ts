/**
 * POST /v1/workflows — Create a new workflow.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header.
 */

import { defineEventHandler, getHeader, readBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../../src/lib/utils/crypto";

type WorkflowStep = {
  model: string;
  prompt: string;
  resolution?: string;
};

export default defineEventHandler(async (event) => {
  try {
    const auth = getHeader(event, "authorization");
    if (!auth?.startsWith("Bearer cx_")) {
      setResponseStatus(event, 401);
      return { error: "Invalid API key format. Use: Authorization: Bearer cx_..." };
    }
    const keyHash = await sha256Hex(auth.slice(7));
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
    await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${keyRows[0].id}`.catch(
      () => undefined,
    );

    const body = (await readBody(event)) as { name?: unknown; steps?: unknown } | undefined;
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 200) : "";
    const steps = body?.steps as WorkflowStep[] | undefined;
    if (!name) {
      setResponseStatus(event, 400);
      return { error: "name is required" };
    }
    if (!Array.isArray(steps) || steps.length === 0 || steps.length > 50) {
      setResponseStatus(event, 400);
      return { error: "steps must contain between 1 and 50 items" };
    }
    for (const step of steps) {
      if (!step || typeof step.model !== "string" || !step.model.trim()) {
        setResponseStatus(event, 400);
        return { error: "Each step must have a model" };
      }
      if (typeof step.prompt !== "string" || !step.prompt.trim() || step.prompt.length > 10000) {
        setResponseStatus(event, 400);
        return { error: "Each step must have a non-empty prompt of at most 10000 characters" };
      }
      const modelRows = (await sql`
        SELECT slug FROM models WHERE slug = ${step.model.trim()} AND active = TRUE LIMIT 1
      `) as { slug: string }[];
      if (modelRows.length === 0) {
        setResponseStatus(event, 400);
        return { error: `Model '${step.model}' is not active` };
      }
    }

    const workflowRows = (await sql`
      INSERT INTO workflows (user_id, name, status)
      VALUES (${userId}, ${name}, 'draft')
      RETURNING id, created_at
    `) as { id: number; created_at: string }[];
    const workflow = workflowRows[0];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await sql`
        INSERT INTO workflow_nodes
          (workflow_id, type, model_slug, status, config, canvas_x, canvas_y)
        VALUES
          (${workflow.id}, 'model', ${step.model.trim()}, 'configured',
           ${JSON.stringify({ prompt: step.prompt, ...(step.resolution ? { resolution: step.resolution } : {}) })}::jsonb,
           ${String(i * 240)}, '0')
      `;
    }

    return {
      id: `wf_${workflow.id}`,
      object: "workflow",
      name,
      steps: steps.length,
      created_at: new Date(workflow.created_at).toISOString(),
    };
  } catch (err) {
    console.error("[api/v1/workflows/create]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
