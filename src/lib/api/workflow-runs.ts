/**
 * GET /api/workflow-runs — fetch run history for a specific workflow.
 *
 * Returns each run with its node executions, status, cost, and dates.
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getModel } from "@/lib/models";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";

export type WorkflowRunNodeExec = {
  id: number;
  workflowNodeId: number;
  modelSlug: string;
  modelName: string;
  status: string;
  costUsd: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  outputPreviewUrl: string | null;
};

export type WorkflowRun = {
  id: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  totalCostUsd: number;
  nodeCount: number;
  nodes: WorkflowRunNodeExec[];
};

export type WorkflowRunsInput = {
  workflowId: number;
  limit?: number;
};

export type WorkflowRunsResponse = {
  runs: WorkflowRun[];
};

export const getWorkflowRuns = createServerFn({ method: "GET" })
  .validator((data: WorkflowRunsInput): WorkflowRunsInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!Number.isInteger(data.workflowId)) throw new HttpError(400, "workflowId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      const userId = await requireUserId(ctx);
      const limit = Math.min(data.limit ?? 50, 100);

      // Verify the workflow belongs to this user
      const wfRows = (await sql`
        SELECT id FROM workflows WHERE id = ${data.workflowId} AND user_id = ${userId} LIMIT 1
      `) as { id: number }[];
      if (wfRows.length === 0) {
        throw new HttpError(404, "Workflow not found");
      }

      // Fetch runs
      const runRows = (await sql`
        SELECT
          r.id,
          r.status,
          r.started_at,
          r.completed_at,
          r.total_cost_usd::text AS total_cost_usd
        FROM runs r
        WHERE r.workflow_id = ${data.workflowId}
        ORDER BY r.started_at DESC
        LIMIT ${limit}
      `) as {
        id: number;
        status: string;
        started_at: string;
        completed_at: string | null;
        total_cost_usd: string;
      }[];

      if (runRows.length === 0) {
        return { runs: [] } satisfies WorkflowRunsResponse;
      }

      const runIds = runRows.map((r) => r.id);

      // Fetch all node executions for these runs in one query
      const execRows = (await sql`
        SELECT
          rne.id,
          rne.run_id,
          rne.workflow_node_id,
          rne.status,
          rne.cost_usd::text AS cost_usd,
          rne.started_at,
          rne.completed_at,
          rne.error_message,
          wn.model_slug,
          a.storage_url AS preview_url
        FROM run_node_executions rne
        JOIN workflow_nodes wn ON wn.id = rne.workflow_node_id
        LEFT JOIN assets a ON a.id = rne.output_asset_id
        WHERE rne.run_id = ANY(${runIds})
        ORDER BY rne.run_id, rne.id
      `) as {
        id: number;
        run_id: number;
        workflow_node_id: number;
        status: string;
        cost_usd: string;
        started_at: string | null;
        completed_at: string | null;
        error_message: string | null;
        model_slug: string;
        preview_url: string | null;
      }[];

      // Group executions by run_id
      const execsByRun = new Map<number, WorkflowRunNodeExec[]>();
      for (const row of execRows) {
        const model = getModel(row.model_slug);
        const exec: WorkflowRunNodeExec = {
          id: row.id,
          workflowNodeId: row.workflow_node_id,
          modelSlug: row.model_slug,
          modelName: model?.name ?? row.model_slug,
          status: row.status,
          costUsd: Number(row.cost_usd ?? 0),
          startedAt: row.started_at,
          completedAt: row.completed_at,
          errorMessage: row.error_message,
          outputPreviewUrl: row.preview_url,
        };
        const list = execsByRun.get(row.run_id) ?? [];
        list.push(exec);
        execsByRun.set(row.run_id, list);
      }

      const runs: WorkflowRun[] = runRows.map((r) => ({
        id: r.id,
        status: r.status,
        startedAt: r.started_at,
        completedAt: r.completed_at,
        totalCostUsd: Number(r.total_cost_usd ?? 0),
        nodeCount: (execsByRun.get(r.id) ?? []).length,
        nodes: execsByRun.get(r.id) ?? [],
      }));

      return { runs } satisfies WorkflowRunsResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });
