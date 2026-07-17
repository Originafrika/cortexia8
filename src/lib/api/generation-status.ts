/**
 * GET /api/generations/{id} — poll a run (or single execution) status.
 *
 * `id` can be either a `runs.id` or a `run_node_executions.id`. We
 * auto-detect by hitting both tables. The response shape is normalised
 * so the frontend can poll the same endpoint regardless of granularity.
 *
 * Also performs a live kie.ai lookup when the local row is still in
 * flight, so the user sees fresh state without waiting for the webhook.
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getTaskDetail, parseResultJson } from "@/lib/kie-api/common";
import { HttpError, toJsonResponse } from "./auth";

export type StatusInput = {
  id: number;
  /** Refresh the state from kie.ai even if our row is terminal. */
  force?: boolean;
};

type AssetSummary = {
  id: number;
  type: string;
  storageUrl: string;
  previewUrl: string | null;
  modelSlug: string | null;
  createdAt: string;
};

type NodeSummary = {
  id: number;
  workflowNodeId: number;
  modelSlug: string;
  status: string;
  kieTaskId: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  costUsd: number;
  asset: AssetSummary | null;
};

export type GenerationStatus = {
  scope: "run" | "execution";
  runId: number;
  runNodeExecutionId?: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  totalCostUsd: number;
  nodes: NodeSummary[];
};

export const generationStatus = createServerFn({ method: "GET" })
  .validator((data: StatusInput): StatusInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!Number.isInteger(data.id)) {
      throw new HttpError(400, "id is required (integer)");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await loadStatus(data);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

async function loadStatus(input: StatusInput): Promise<GenerationStatus> {
  // Is the id a run or a node execution? Try both.
  const exec = (await sql`
    SELECT id, run_id FROM run_node_executions WHERE id = ${input.id} LIMIT 1
  `) as { id: number; run_id: number }[];
  if (exec.length > 0) {
    return await loadRun(exec[0].run_id, input.force, exec[0].id);
  }
  const run = (await sql`
    SELECT id FROM runs WHERE id = ${input.id} LIMIT 1
  `) as { id: number }[];
  if (run.length > 0) {
    return await loadRun(run[0].id, input.force);
  }
  throw new HttpError(404, `No run or execution with id ${input.id}`);
}

async function loadRun(
  runId: number,
  force: boolean | undefined,
  scopeExecutionId?: number,
): Promise<GenerationStatus> {
  const runRows = (await sql`
    SELECT id, status, started_at, completed_at, total_cost_usd::text AS total_cost_usd
    FROM runs WHERE id = ${runId} LIMIT 1
  `) as {
    id: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    total_cost_usd: string;
  }[];
  if (runRows.length === 0) throw new HttpError(404, `Run ${runId} not found`);
  const run = runRows[0];

  const nodeRows = (await sql`
    SELECT
      rne.id, rne.workflow_node_id, wn.model_slug, rne.status, rne.kie_task_id,
      rne.error_message,
      rne.started_at, rne.completed_at,
      rne.cost_usd::text AS cost_usd,
      a.id AS asset_id, a.storage_url AS asset_storage_url, a.preview_url AS asset_preview_url,
      a.type AS asset_type, a.created_at AS asset_created_at
    FROM run_node_executions rne
    JOIN workflow_nodes wn ON wn.id = rne.workflow_node_id
    LEFT JOIN assets a ON a.id = rne.output_asset_id
    WHERE rne.run_id = ${runId}
    ORDER BY rne.id ASC
  `) as {
    id: number;
    workflow_node_id: number;
    model_slug: string;
    status: string;
    kie_task_id: string | null;
    error_message: string | null;
    started_at: string | null;
    completed_at: string | null;
    cost_usd: string;
    asset_id: number | null;
    asset_storage_url: string | null;
    asset_preview_url: string | null;
    asset_type: string | null;
    asset_created_at: string | null;
  }[];

  // Optional live refresh from kie.ai for still-in-flight executions.
  const nodes: NodeSummary[] = [];
  for (const row of nodeRows) {
    let liveState = row.status;
    if ((force || row.status === "queued" || row.status === "running") && row.kie_task_id) {
      try {
        const info = await getTaskDetail(row.kie_task_id);
        liveState = info.state;
        const { resultUrls } = parseResultJson(info.resultJson);
        if (info.state === "success" && resultUrls.length > 0 && !row.asset_id) {
          // The webhook hasn't fired yet; the user can still see the
          // first result URL via this endpoint.
        }
      } catch {
        // keep the local state — kie.ai might be briefly down
      }
    }
    nodes.push({
      id: row.id,
      workflowNodeId: row.workflow_node_id,
      modelSlug: row.model_slug,
      status: liveState,
      kieTaskId: row.kie_task_id,
      errorMessage: row.error_message,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      costUsd: Number(row.cost_usd ?? 0),
      asset: row.asset_id
        ? {
            id: row.asset_id,
            type: row.asset_type ?? "unknown",
            storageUrl: row.asset_storage_url ?? "",
            previewUrl: row.asset_preview_url,
            modelSlug: row.model_slug,
            createdAt: row.asset_created_at ?? "",
          }
        : null,
    });
  }

  const filtered = scopeExecutionId ? nodes.filter((n) => n.id === scopeExecutionId) : nodes;

  return {
    scope: scopeExecutionId ? "execution" : "run",
    runId: run.id,
    runNodeExecutionId: scopeExecutionId,
    status: run.status,
    startedAt: run.started_at,
    completedAt: run.completed_at,
    totalCostUsd: Number(run.total_cost_usd ?? 0),
    nodes: filtered,
  };
}
