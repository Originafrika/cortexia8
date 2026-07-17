/**
 * POST /api/canvas/run — execute a workflow.
 *
 * Loads the workflow + its nodes + edges, validates them, then walks the
 * graph in topological order. Independent nodes (same level) are fired
 * in parallel via Promise.all. Each node submission goes through the
 * same dispatch path as the single-shot /api/generate route, just with
 * the node's stored config as the input.
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { buildCallbackUrl, createTask } from "@/lib/kie-api/client";
import {
  recordTransaction,
  ensureSufficientCredits,
  InsufficientCreditsError,
} from "@/lib/credits";
import {
  getActiveModelBySlug,
  nodeCostUsd,
  resolveUploads,
  topoLevels,
  type ModelRow,
} from "./shared";
import { HttpError, toJsonResponse } from "./auth";

export type RunInput = {
  workflowId: number;
  userId: number;
};

export type RunResponse = {
  runId: number;
  totalNodes: number;
  queued: number;
  estimatedTotalCostUsd: number;
  skippedNodes: { nodeId: number; reason: string }[];
};

type WorkflowNodeRow = {
  id: number;
  workflow_id: number;
  type: string;
  model_slug: string;
  config: Record<string, unknown>;
};

type WorkflowEdgeRow = {
  id: number;
  workflow_id: number;
  source_node_id: number;
  target_node_id: number;
};

export const runCanvas = createServerFn({ method: "POST" })
  .validator((data: RunInput): RunInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!Number.isInteger(data.workflowId)) {
      throw new HttpError(400, "workflowId is required");
    }
    if (!Number.isInteger(data.userId)) {
      throw new HttpError(400, "userId is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await runCanvasImpl(data);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

async function runCanvasImpl(input: RunInput): Promise<RunResponse> {
  // 1. Load the workflow + nodes + edges.
  const wfRows = (await sql`
    SELECT id, user_id, name FROM workflows WHERE id = ${input.workflowId} LIMIT 1
  `) as { id: number; user_id: number | null; name: string }[];
  if (wfRows.length === 0) {
    throw new HttpError(404, `Workflow ${input.workflowId} not found`);
  }
  if (wfRows[0].user_id != null && wfRows[0].user_id !== input.userId) {
    throw new HttpError(403, "Workflow belongs to a different user");
  }
  const workflow = wfRows[0];

  const nodes = (await sql`
    SELECT id, workflow_id, type, model_slug, config
    FROM workflow_nodes
    WHERE workflow_id = ${workflow.id}
    ORDER BY id ASC
  `) as WorkflowNodeRow[];
  if (nodes.length === 0) {
    throw new HttpError(400, "Workflow has no nodes");
  }
  const edges = (await sql`
    SELECT id, workflow_id, source_node_id, target_node_id
    FROM workflow_edges
    WHERE workflow_id = ${workflow.id}
  `) as WorkflowEdgeRow[];

  // 2. Resolve all model slugs in one go (cache).
  const modelCache = new Map<string, ModelRow | null>();
  for (const n of nodes) {
    if (!modelCache.has(n.model_slug)) {
      modelCache.set(n.model_slug, await getActiveModelBySlug(n.model_slug));
    }
  }

  // 3. Topological levels (independent nodes per level run in parallel).
  const levels = topoLevels(
    nodes.map((n) => n.id),
    edges.map((e) => ({ source: e.source_node_id, target: e.target_node_id })),
  );

  // 4. Mint a run row up front so all node executions share the same run.
  const runId = (
    (await sql`
      INSERT INTO runs (workflow_id, user_id, status, started_at)
      VALUES (${workflow.id}, ${input.userId}, 'running', NOW())
      RETURNING id
    `) as { id: number }[]
  )[0].id;

  const skipped: RunResponse["skippedNodes"] = [];
  let estimatedTotal = 0;
  let queued = 0;

  // 5. Process level by level, parallel within a level.
  for (const level of levels) {
    const levelNodes = level
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is WorkflowNodeRow => !!n);

    const results = await Promise.allSettled(
      levelNodes.map((node) =>
        dispatchNode({
          runId,
          userId: input.userId,
          workflowId: workflow.id,
          node,
          model: modelCache.get(node.model_slug) ?? null,
        }),
      ),
    );

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const node = levelNodes[i];
      if (r.status === "fulfilled") {
        estimatedTotal += r.value.cost;
        queued += 1;
      } else {
        skipped.push({
          nodeId: node.id,
          reason: r.reason instanceof Error ? r.reason.message : String(r.reason),
        });
      }
    }
  }

  // 6. Update the run with the cost rollup. Don't change status here —
  //    the webhook updates it once all node executions finish.
  await sql`
    UPDATE runs SET total_cost_usd = ${estimatedTotal} WHERE id = ${runId}
  `;

  return {
    runId,
    totalNodes: nodes.length,
    queued,
    estimatedTotalCostUsd: estimatedTotal,
    skippedNodes: skipped,
  };
}

async function dispatchNode(opts: {
  runId: number;
  userId: number;
  workflowId: number;
  node: WorkflowNodeRow;
  model: ModelRow | null;
}): Promise<{ cost: number }> {
  const { node, model, runId, userId } = opts;
  if (!model) {
    // Mark the execution as failed and bail. The node stays in the
    // graph so the user can fix the model slug.
    await recordNodeExecution({
      runId,
      workflowNodeId: node.id,
      status: "failed",
      error: `Model '${node.model_slug}' not found or inactive`,
    });
    throw new Error(`model not found: ${node.model_slug}`);
  }

  // Resolve any reference uploads in the node's config.
  const { resolved } = await resolveUploads(node.config ?? {});

  const cost = nodeCostUsd(model, resolved) ?? 0;
  if (cost > 0) {
    const check = await ensureSufficientCredits(userId, cost);
    if (!check.ok) {
      await recordNodeExecution({
        runId,
        workflowNodeId: node.id,
        status: "failed",
        error: `Insufficient credits (${check.balance} < ${check.required})`,
      });
      throw new InsufficientCreditsError(check.balance, check.required);
    }
  }

  let callback: string | undefined;
  try {
    callback = buildCallbackUrl();
  } catch {
    // Optional — fall back to polling.
  }

  const { taskId } = await createTask({
    model: model.kie_endpoint,
    input: resolved,
    ...(callback ? { callBackUrl: callback } : {}),
  });

  await recordNodeExecution({
    runId,
    workflowNodeId: node.id,
    status: "queued",
    taskId,
    inputParams: resolved,
    cost,
    startedAt: new Date().toISOString(),
  });

  if (cost > 0) {
    await recordTransaction({
      userId,
      amount: -Math.abs(cost),
      type: "usage",
      reference: `run:${runId}/node:${node.id}`,
    });
  }

  return { cost };
}

async function recordNodeExecution(opts: {
  runId: number;
  workflowNodeId: number;
  status: "queued" | "running" | "succeeded" | "failed";
  taskId?: string;
  inputParams?: Record<string, unknown>;
  cost?: number;
  error?: string;
  startedAt?: string;
}) {
  await sql`
    INSERT INTO run_node_executions
      (run_id, workflow_node_id, status, kie_task_id, input_params, cost_usd, error_message, started_at)
    VALUES
      (${opts.runId}, ${opts.workflowNodeId}, ${opts.status},
       ${opts.taskId ?? null},
       ${opts.inputParams ? JSON.stringify(opts.inputParams) : null}::jsonb,
       ${opts.cost ?? 0},
       ${opts.error ?? null},
       ${opts.startedAt ?? null}::timestamp)
  `;
}
