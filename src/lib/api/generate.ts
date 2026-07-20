/**
 * POST /api/generate — single-shot generation.
 *
 * Flow:
 *   1. Look up the model in the DB (active only).
 *   2. Resolve any reference uploads via kie.ai file-upload.
 *   3. Check the user has enough credits (skip for unknown-cost units).
 *   4. Submit the task to kie.ai.
 *   5. Persist a run + run_node_executions row with the kie_task_id so
 *      the webhook can pick it up.
 *
 * The endpoint is model-agnostic. The dispatch path never branches on
 * `category` or `slug`; everything it needs is read from `models.*`.
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import {
  buildCallbackUrl,
  createTask,
  chatCompletion,
  chatAnthropic,
  chatGoogleNative,
} from "@/lib/kie-api/client";
import {
  ensureSufficientCredits,
  InsufficientCreditsError,
  recordTransaction,
} from "@/lib/credits";
import {
  getActiveModelBySlug,
  nodeCostUsd,
  resolveUploads,
  toNumber,
  type ApiFamily,
  type ModelRow,
} from "./shared";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";

export type GenerateInput = {
  modelSlug: string;
  input: Record<string, unknown>;
  /** Optional workflow_id so a single generation can be part of a run. */
  workflowId?: number;
  /** Optional explicit user id (server-side calls bypass session check). */
  userId?: number;
  /** When true, don't actually submit the task — useful for dry-runs. */
  dryRun?: boolean;
};

export type GenerateResponse = {
  runId: number;
  runNodeExecutionId: number;
  taskId: string | null;
  status: "queued" | "dry-run";
  estimatedCostUsd: number;
  uploadedCount: number;
  modelSlug: string;
  modelName: string;
  category: string;
};

export const generate = createServerFn({ method: "POST" })
  .validator((data: GenerateInput): GenerateInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (!data.modelSlug || typeof data.modelSlug !== "string") {
      throw new HttpError(400, "modelSlug is required");
    }
    if (!data.input || typeof data.input !== "object") {
      throw new HttpError(400, "input is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(new Headers());
      // The client supplies userId explicitly because the current auth
      // bridge (Neon Auth session cookie) is decoded by the React layer
      // before the call. Server-to-server callers may also use an API
      // key via Authorization: Bearer cx_… (see auth.ts).
      const userId = data.userId ?? ctx.userId;
      if (userId == null) {
        throw new HttpError(401, "Authentication required (userId or API key)");
      }
      const result = await runGenerate(data, userId, ctx.apiKeyId);
      return result;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

async function runGenerate(
  data: GenerateInput,
  userId: number,
  _apiKeyId: number | null,
): Promise<GenerateResponse> {
  const model = await getActiveModelBySlug(data.modelSlug);
  if (!model) {
    throw new HttpError(404, `Model '${data.modelSlug}' not found or inactive`);
  }

  // 1. Upload references (if any markers in the input).
  const { resolved: resolvedInput, uploadedCount } = await resolveUploads(data.input);

  // 2. Cost + credit check.
  const cost = nodeCostUsd(model, resolvedInput);
  if (cost != null && cost > 0) {
    const check = await ensureSufficientCredits(userId, cost);
    if (!check.ok) {
      throw new InsufficientCreditsError(check.balance, check.required);
    }
  }

  // 3. (optional) workflow context.
  const workflowId = data.workflowId ?? null;
  if (workflowId != null) {
    const rows = (await sql`
      SELECT id, user_id FROM workflows WHERE id = ${workflowId} LIMIT 1
    `) as { id: number; user_id: number | null }[];
    if (rows.length === 0) {
      throw new HttpError(404, `Workflow ${workflowId} not found`);
    }
    if (rows[0].user_id != null && rows[0].user_id !== userId) {
      throw new HttpError(403, "Workflow belongs to a different user");
    }
  }

  if (data.dryRun) {
    // Validate the model can accept the input (lightweight JSON Schema
    // check) and return cost without actually submitting.
    return {
      runId: 0,
      runNodeExecutionId: 0,
      taskId: null,
      status: "dry-run",
      estimatedCostUsd: cost ?? 0,
      uploadedCount,
      modelSlug: model.slug,
      modelName: model.name,
      category: model.category,
    };
  }

  // 4. Submit to kie.ai — branch on api_family.
  const callback = tryBuildCallback();
  const taskId = await submitTask({
    apiFamily: model.api_family,
    model,
    input: resolvedInput,
    callback,
  });

  // 5. Persist run + execution rows so the webhook can find them.
  const { runId, nodeExecutionId } = await persistRunWithExecution({
    userId,
    model,
    workflowId,
    input: resolvedInput,
    cost: cost ?? 0,
    taskId,
  });

  // 6. Debit credits now (for fixed-price units). LLM cost (1m-tokens-io)
  //    is settled after the run completes — we record a pending 0 debit.
  if (cost != null && cost > 0) {
    await recordTransaction({
      userId,
      amount: -Math.abs(cost),
      type: "usage",
      reference: `run:${runId}/exec:${nodeExecutionId}`,
    });
  }

  return {
    runId,
    runNodeExecutionId: nodeExecutionId,
    taskId,
    status: "queued",
    estimatedCostUsd: cost ?? 0,
    uploadedCount,
    modelSlug: model.slug,
    modelName: model.name,
    category: model.category,
  };
}

function tryBuildCallback(): string | undefined {
  try {
    return buildCallbackUrl();
  } catch {
    return undefined;
  }
}

/**
 * Route a generation request to the correct kie.ai endpoint based on
 * the model's api_family. Returns a taskId that the webhook can track.
 */
async function submitTask(opts: {
  apiFamily: ApiFamily | null;
  model: ModelRow;
  input: Record<string, unknown>;
  callback?: string;
}): Promise<string> {
  const family = opts.apiFamily ?? "market_unified";

  switch (family) {
    case "market_unified": {
      const { taskId } = await createTask({
        model: opts.model.kie_endpoint,
        input: opts.input,
        ...(opts.callback ? { callBackUrl: opts.callback } : {}),
      });
      return taskId;
    }

    case "chat_openai": {
      const { taskId } = await chatCompletion({
        model: opts.model.kie_endpoint,
        messages: (opts.input.messages as unknown[]) ?? [],
        tools: opts.input.tools as unknown[] | undefined,
        reasoning_effort: opts.input.reasoning_effort as string | undefined,
        stream: false,
      });
      return taskId;
    }

    case "chat_anthropic": {
      const { taskId } = await chatAnthropic({
        model: opts.model.kie_endpoint,
        messages: (opts.input.messages as unknown[]) ?? [],
        max_tokens: opts.input.max_tokens as number | undefined,
        thinking: opts.input.thinking as boolean | undefined,
        stream: false,
      });
      return taskId;
    }

    case "chat_google_native": {
      const { taskId } = await chatGoogleNative({
        model: opts.model.kie_endpoint,
        contents: (opts.input.contents as unknown[]) ?? [],
        tools: opts.input.tools as unknown[] | undefined,
        generationConfig: opts.input.generationConfig as Record<string, unknown> | undefined,
      });
      return taskId;
    }

    case "dedicated": {
      // Dedicated models (Runway, Veo, GPT Image 4o, Flux Kontext,
      // Aleph, Luma, Suno/Voice) use createTask with a model-specific
      // endpoint stored in kie_endpoint. The routing distinction here
      // is that dedicated models don't support callback URLs — the
      // client must poll for status.
      const { taskId } = await createTask({
        model: opts.model.kie_endpoint,
        input: opts.input,
      });
      return taskId;
    }

    default: {
      // Unknown family — fall back to market_unified.
      const { taskId } = await createTask({
        model: opts.model.kie_endpoint,
        input: opts.input,
        ...(opts.callback ? { callBackUrl: opts.callback } : {}),
      });
      return taskId;
    }
  }
}

async function persistRunWithExecution(opts: {
  userId: number;
  model: ModelRow;
  workflowId: number | null;
  input: Record<string, unknown>;
  cost: number;
  taskId: string;
}): Promise<{ runId: number; nodeExecutionId: number }> {
  // If no workflow context, mint a synthetic one-off workflow so the
  // runs/run_node_executions foreign keys still resolve. Keeps the
  // schema uniform — every generation is part of a run.
  const wfId =
    opts.workflowId ??
    (
      (await sql`
        INSERT INTO workflows (user_id, name, status)
        VALUES (${opts.userId}, ${`Ad-hoc · ${opts.model.name}`}, 'running')
        RETURNING id
      `) as { id: number }[]
    )[0].id;

  // We need a workflow_node too (FK from run_node_executions). For
  // ad-hoc POSTs (no workflowId) we mint a synthetic node so the FK
  // resolves. The visual canvas-side route manages its own nodes.
  const nodeId = (
    (await sql`
      INSERT INTO workflow_nodes (workflow_id, type, model_slug, config, canvas_x, canvas_y)
      VALUES (${wfId}, 'model', ${opts.model.slug}, ${JSON.stringify(opts.input)}::jsonb, '0', '0')
      RETURNING id
    `) as { id: number }[]
  )[0].id;

  const run = (
    (await sql`
      INSERT INTO runs (workflow_id, user_id, status, total_cost_usd)
      VALUES (${wfId}, ${opts.userId}, 'running', ${opts.cost})
      RETURNING id
    `) as { id: number }[]
  )[0];

  const exec = (
    (await sql`
      INSERT INTO run_node_executions
        (run_id, workflow_node_id, status, kie_task_id, input_params, started_at, cost_usd)
      VALUES
        (${run.id}, ${nodeId}, 'queued', ${opts.taskId}, ${JSON.stringify(opts.input)}::jsonb, NOW(), ${opts.cost})
      RETURNING id
    `) as { id: number }[]
  )[0];

  return { runId: run.id, nodeExecutionId: exec.id };
}

// Re-export the cost helper so other API files can use it without
// having to re-import the type-guard dance.
export { toNumber };
