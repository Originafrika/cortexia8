/**
 * POST /v1/workflows/run — Run a workflow.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header.
 */

import { defineEventHandler, getHeader, readBody, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { createTask, buildCallbackUrl } from "@/lib/kie-api/client";
import { ensureSufficientCredits, recordTransaction, refundGeneration } from "@/lib/credits";
import { sha256Hex } from "../../../../src/lib/utils/crypto";
import {
  normalizeApiKeyPermissions,
  scopeAllowsCategory,
} from "../../../../src/lib/api-key-policy";

type WorkflowInput = Record<string, string>;

type NodeRow = {
  id: number;
  model_slug: string;
  config: Record<string, unknown>;
};

type ModelRow = {
  slug: string;
  name: string;
  category: string;
  fidelity_status: string;
  kie_endpoint: string;
  cortexia_price_usd: string;
};

export default defineEventHandler(async (event) => {
  const charged: { userId: number; runId: number; executionId: number; amount: number }[] = [];
  try {
    const auth = getHeader(event, "authorization");
    if (!auth?.startsWith("Bearer cx_")) {
      setResponseStatus(event, 401);
      return { error: "Invalid API key format. Use: Authorization: Bearer cx_..." };
    }
    const keyHash = await sha256Hex(auth.slice(7));
    const keyRows = (await sql`
      SELECT id, user_id, permissions FROM api_keys
      WHERE key_hash = ${keyHash} AND status = 'active'
      LIMIT 1
    `) as { id: number; user_id: number; permissions: unknown }[];
    if (keyRows.length === 0) {
      setResponseStatus(event, 401);
      return { error: "Invalid or inactive API key" };
    }
    const userId = keyRows[0].user_id;
    const permissions = normalizeApiKeyPermissions(keyRows[0].permissions);
    const canUseCategory = (category: string) => scopeAllowsCategory(permissions, category);
    await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${keyRows[0].id}`.catch(
      () => undefined,
    );

    const body = (await readBody(event)) as { workflow_id?: unknown; inputs?: unknown } | undefined;
    const workflowId = typeof body?.workflow_id === "string" ? body.workflow_id : "";
    const match = /^wf_(\d+)$/.exec(workflowId);
    if (!match) {
      setResponseStatus(event, 400);
      return { error: "workflow_id must use the wf_<id> format" };
    }
    const numericId = Number(match[1]);
    const inputs =
      body?.inputs && typeof body.inputs === "object" ? (body.inputs as WorkflowInput) : {};

    const workflowRows = (await sql`
      SELECT id, name FROM workflows
      WHERE id = ${numericId} AND user_id = ${userId}
      LIMIT 1
    `) as { id: number; name: string }[];
    if (workflowRows.length === 0) {
      setResponseStatus(event, 404);
      return { error: "Workflow not found" };
    }

    const nodeRows = (await sql`
      SELECT id, model_slug, config
      FROM workflow_nodes
      WHERE workflow_id = ${numericId}
      ORDER BY canvas_x::numeric ASC, id ASC
    `) as NodeRow[];
    if (nodeRows.length === 0) {
      setResponseStatus(event, 400);
      return { error: "Workflow has no steps" };
    }

    const modelSlugs = nodeRows.map((node) => node.model_slug);
    const modelRows = (await sql`
      SELECT slug, name, category, fidelity_status, kie_endpoint, cortexia_price_usd::text AS cortexia_price_usd
      FROM models
      WHERE slug = ANY(${modelSlugs}) AND active = TRUE AND fidelity_status = 'fidele'
    `) as ModelRow[];
    const modelsBySlug = new Map(modelRows.map((model) => [model.slug, model]));
    if (modelRows.length !== new Set(modelSlugs).size) {
      setResponseStatus(event, 400);
      return { error: "Workflow contains an inactive, unverified, or missing model" };
    }
    if (modelRows.some((model) => !canUseCategory(model.category))) {
      setResponseStatus(event, 403);
      return { error: "API key scope does not allow one or more workflow model categories" };
    }

    const totalCost = nodeRows.reduce(
      (sum, node) => sum + Number(modelsBySlug.get(node.model_slug)?.cortexia_price_usd ?? 0),
      0,
    );
    if (!Number.isFinite(totalCost) || totalCost <= 0) {
      setResponseStatus(event, 503);
      return { error: "Workflow pricing is unavailable" };
    }
    const balance = await ensureSufficientCredits(userId, totalCost);
    if (!balance.ok) {
      setResponseStatus(event, 402);
      return {
        error: "Insufficient credits",
        balance: balance.balance,
        required: balance.required,
      };
    }

    const runRows = (await sql`
      INSERT INTO runs (user_id, workflow_id, status, total_cost_usd)
      VALUES (${userId}, ${numericId}, 'running', ${totalCost})
      RETURNING id, started_at
    `) as { id: number; started_at: string }[];
    const runId = runRows[0].id;

    for (const node of nodeRows) {
      const model = modelsBySlug.get(node.model_slug)!;
      const config = { ...node.config } as Record<string, unknown>;
      let prompt = typeof config.prompt === "string" ? config.prompt : "";
      for (const [key, value] of Object.entries(inputs)) {
        prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      }
      const input = { ...config, prompt };
      const amount = Number(model.cortexia_price_usd);
      const executionRows = (await sql`
        INSERT INTO run_node_executions
          (run_id, workflow_node_id, status, input_params, started_at, cost_usd)
        VALUES
          (${runId}, ${node.id}, 'submitting', ${JSON.stringify(input)}::jsonb, NOW(), ${amount})
        RETURNING id
      `) as { id: number }[];
      const executionId = executionRows[0].id;

      await recordTransaction({
        userId,
        amount: -amount,
        type: "usage",
        reference: `run:${runId}/exec:${executionId}`,
      });
      charged.push({ userId, runId, executionId, amount });

      try {
        const callback = (() => {
          try {
            return buildCallbackUrl();
          } catch {
            return undefined;
          }
        })();
        const task = await createTask({
          model: model.kie_endpoint,
          input,
          ...(callback ? { callBackUrl: callback } : {}),
        });
        await sql`
          UPDATE run_node_executions
          SET status = 'queued', kie_task_id = ${task.taskId}
          WHERE id = ${executionId} AND status = 'submitting'
        `;
      } catch (error) {
        await refundGeneration({ userId, amount, runId, nodeExecutionId: executionId });
        await sql`
          UPDATE run_node_executions
          SET status = 'failed', completed_at = NOW(), error_message = ${error instanceof Error ? error.message.slice(0, 2000) : "Provider submission failed"}
          WHERE id = ${executionId} AND status IN ('submitting', 'queued')
        `;
        throw error;
      }
    }

    return {
      id: `run_${runId}`,
      object: "workflow_run",
      workflow_id: workflowId,
      status: "running",
      created_at: new Date(runRows[0].started_at).toISOString(),
    };
  } catch (err) {
    console.error("[api/v1/workflows/run]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
