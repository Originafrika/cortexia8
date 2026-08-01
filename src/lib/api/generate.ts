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
 * For chat models (chat_openai, chat_anthropic):
 *   - Calls the chat endpoint synchronously
 *   - Stores text result directly in run_node_executions.text_result
 *   - Returns status "succeeded" immediately (no polling needed)
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
import {
  getRequestContext,
  HttpError,
  requireUserId,
  validateOrigin,
} from "./auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export type GenerateInput = {
  modelSlug: string;
  input: Record<string, unknown>;
  /** Optional workflow_id so a single generation can be part of a run. */
  workflowId?: number;
  /** When true, don't actually submit the task — useful for dry-runs. */
  dryRun?: boolean;
  sessionToken?: string;
};

export type GenerateResponse = {
  runId: number;
  runNodeExecutionId: number;
  taskId: string | null;
  status: "queued" | "succeeded" | "dry-run";
  estimatedCostUsd: number;
  uploadedCount: number;
  modelSlug: string;
  modelName: string;
  category: string;
  /** For chat models: the text response content. */
  textContent?: string;
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
    return { ...data, sessionToken: data.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      const userId = await requireUserId(ctx);

      // Rate limit: 30 requests per minute per user
      const rateLimitKey = `generate:${userId}`;
      if (!checkRateLimit(rateLimitKey, RATE_LIMITS.generation)) {
        throw new HttpError(429, "Rate limit exceeded. Please try again later.");
      }

      const result = await runGenerate(data, userId, ctx.apiKeyId);
      return result;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      console.error("[Generate] Error:", err);
      throw new HttpError(500, "Internal server error");
    }
  });

async function runGenerate(
  data: GenerateInput,
  userId: number,
  _apiKeyId: number | null,
): Promise<GenerateResponse> {
  console.log(`[Generate] Starting generation for user ${userId}, model: ${data.modelSlug}`);
  
  const model = await getActiveModelBySlug(data.modelSlug);
  if (!model) {
    throw new HttpError(404, `Model '${data.modelSlug}' not found or inactive`);
  }

  // Validate kie_endpoint is properly configured before calling kie.ai
  if (!model.kie_endpoint) {
    throw new HttpError(500, `Model '${model.slug}' is misconfigured: kie_endpoint is empty`);
  }

  // 1. Upload references (if any markers in the input).
  const { resolved: resolvedInput, uploadedCount } = await resolveUploads(data.input);
  console.log(`[Generate] Resolved input, uploaded: ${uploadedCount}`);

  // 1b. Auto-wrap plain-text messages into OpenAI format for text models.
  //     Users type "hi" in the textarea; kie.ai expects [{role:"user",content:"hi"}].
  if (model.category === "text") {
    const msgs = resolvedInput.messages;
    if (typeof msgs === "string") {
      const text = msgs.trim();
      resolvedInput.messages = text ? [{ role: "user", content: text }] : [];
      console.log(`[Generate] Auto-wrapped messages string into OpenAI format`);
    } else if (!Array.isArray(msgs) || msgs.length === 0) {
      resolvedInput.messages = [];
    }
  }

  // 2. Cost + credit check.
  const cost = nodeCostUsd(model, resolvedInput);
  console.log(`[Generate] Cost: ${cost}, model: ${model.slug}`);
  if (cost != null && cost > 0) {
    const check = await ensureSufficientCredits(userId, cost);
    if (!check.ok) {
      console.log(`[Generate] Insufficient credits: balance=${check.balance}, required=${check.required}`);
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

  const apiFamily = model.api_family;
  if (!apiFamily) {
    throw new HttpError(500, `Model '${model.slug}' is misconfigured: api_family is NULL`);
  }

  // Chat models are synchronous — call the API, store text, return immediately.
  const isChat = apiFamily === "chat_openai" || apiFamily === "chat_anthropic";

  if (isChat) {
    console.log(`[Generate] Chat model detected (${apiFamily}), calling synchronously`);
    const { textContent, responseId } = await callChatEndpoint(apiFamily, model, resolvedInput);
    console.log(`[Generate] Chat response received, length: ${textContent.length}`);

    // Persist run + execution with text result and "succeeded" status.
    const { runId, nodeExecutionId } = workflowId != null
      ? await persistRunWithTextResult({
          userId,
          model,
          workflowId,
          input: resolvedInput,
          cost: cost ?? 0,
          textResult: textContent,
          taskId: responseId,
        })
      : await persistPlaygroundRunWithTextResult({
          userId,
          model,
          input: resolvedInput,
          cost: cost ?? 0,
          textResult: textContent,
          taskId: responseId,
        });

    // Debit credits
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
      taskId: responseId,
      status: "succeeded",
      estimatedCostUsd: cost ?? 0,
      uploadedCount,
      modelSlug: model.slug,
      modelName: model.name,
      category: model.category,
      textContent,
    };
  }

  // Media models are async — submit task and wait for webhook.
  const callback = tryBuildCallback();
  console.log(`[Generate] Submitting task to kie.ai, model: ${model.slug}, apiFamily: ${apiFamily}`);
  const taskId = await submitTask({
    apiFamily,
    model,
    input: resolvedInput,
    callback,
  });
  console.log(`[Generate] Task submitted, taskId: ${taskId}`);

  // Persist run + execution rows so the webhook can find them.
  const { runId, nodeExecutionId } = workflowId != null
    ? await persistRunWithExecution({
        userId,
        model,
        workflowId,
        input: resolvedInput,
        cost: cost ?? 0,
        taskId,
      })
    : await persistPlaygroundRun({
        userId,
        model,
        input: resolvedInput,
        cost: cost ?? 0,
        taskId,
      });
  console.log(`[Generate] Persisted run: ${runId}, execution: ${nodeExecutionId}`);

  // Debit credits now (for fixed-price units). LLM cost (1m-tokens-io)
  // is settled after the run completes — we record a pending 0 debit.
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
 * Call a chat endpoint synchronously and extract the text response.
 */
async function callChatEndpoint(
  family: ApiFamily,
  model: ModelRow,
  input: Record<string, unknown>,
): Promise<{ textContent: string; responseId: string }> {
  switch (family) {
    case "chat_openai": {
      const { taskId, response } = await chatCompletion({
        model: model.kie_endpoint,
        messages: (input.messages as unknown[]) ?? [],
        tools: input.tools as unknown[] | undefined,
        reasoning_effort: input.reasoning_effort as string | undefined,
        stream: false,
      });
      const resp = response as Record<string, unknown>;
      const choices = resp.choices as { message?: { content?: string } }[] | undefined;
      const text = choices?.[0]?.message?.content ?? "";
      return { textContent: text, responseId: taskId };
    }

    case "chat_anthropic": {
      const { taskId, response } = await chatAnthropic({
        model: model.kie_endpoint,
        messages: (input.messages as unknown[]) ?? [],
        max_tokens: input.max_tokens as number | undefined,
        thinking: input.thinking as boolean | undefined,
        stream: false,
      });
      const resp = response as Record<string, unknown>;
      const content = resp.content as { type?: string; text?: string }[] | undefined;
      const text = content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("") ?? "";
      return { textContent: text, responseId: taskId };
    }

    default:
      throw new HttpError(500, `Unsupported chat family: ${family}`);
  }
}

/**
 * Route a media generation request to the correct kie.ai endpoint based on
 * the model's api_family. Returns a taskId that the webhook can track.
 */
async function submitTask(opts: {
  apiFamily: ApiFamily;
  model: ModelRow;
  input: Record<string, unknown>;
  callback?: string;
}): Promise<string> {
  const family = opts.apiFamily;

  switch (family) {
    case "market_unified": {
      const { taskId } = await createTask({
        model: opts.model.kie_endpoint,
        input: opts.input,
        ...(opts.callback ? { callBackUrl: opts.callback } : {}),
      });
      return taskId;
    }

    case "dedicated": {
      const { taskId } = await createTask({
        model: opts.model.kie_endpoint,
        input: opts.input,
      });
      return taskId;
    }

    default: {
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
  const wfId =
    opts.workflowId ??
    (
      (await sql`
        INSERT INTO workflows (user_id, name, status)
        VALUES (${opts.userId}, ${`Ad-hoc · ${opts.model.name}`}, 'running')
        RETURNING id
      `) as { id: number }[]
    )[0].id;

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

/**
 * Persist a run for playground generations (no workflow context).
 * Creates only runs + run_node_executions rows.
 * Also creates a minimal workflow row for backward compatibility with history page.
 */
async function persistPlaygroundRun(opts: {
  userId: number;
  model: ModelRow;
  input: Record<string, unknown>;
  cost: number;
  taskId: string;
}): Promise<{ runId: number; nodeExecutionId: number }> {
  const wfId = (
    (await sql`
      INSERT INTO workflows (user_id, name, status)
      VALUES (${opts.userId}, ${`Playground · ${opts.model.name}`}, 'running')
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
        (run_id, status, kie_task_id, input_params, started_at, cost_usd)
      VALUES
        (${run.id}, 'queued', ${opts.taskId}, ${JSON.stringify(opts.input)}::jsonb, NOW(), ${opts.cost})
      RETURNING id
    `) as { id: number }[]
  )[0];

  return { runId: run.id, nodeExecutionId: exec.id };
}

/**
 * Persist a run for playground chat models (no workflow context, text result).
 */
async function persistPlaygroundRunWithTextResult(opts: {
  userId: number;
  model: ModelRow;
  input: Record<string, unknown>;
  cost: number;
  textResult: string;
  taskId: string;
}): Promise<{ runId: number; nodeExecutionId: number }> {
  const wfId = (
    (await sql`
      INSERT INTO workflows (user_id, name, status)
      VALUES (${opts.userId}, ${`Playground · ${opts.model.name}`}, 'succeeded')
      RETURNING id
    `) as { id: number }[]
  )[0].id;

  const run = (
    (await sql`
      INSERT INTO runs (workflow_id, user_id, status, total_cost_usd, completed_at)
      VALUES (${wfId}, ${opts.userId}, 'succeeded', ${opts.cost}, NOW())
      RETURNING id
    `) as { id: number }[]
  )[0];

  const exec = (
    (await sql`
      INSERT INTO run_node_executions
        (run_id, status, kie_task_id, input_params, text_result, started_at, completed_at, cost_usd)
      VALUES
        (${run.id}, 'succeeded', ${opts.taskId}, ${JSON.stringify(opts.input)}::jsonb, ${opts.textResult}, NOW(), NOW(), ${opts.cost})
      RETURNING id
    `) as { id: number }[]
  )[0];

  return { runId: run.id, nodeExecutionId: exec.id };
}

/**
 * Persist a run + execution for chat models with text result.
 * The run is immediately marked as "succeeded" since chat is synchronous.
 */
async function persistRunWithTextResult(opts: {
  userId: number;
  model: ModelRow;
  workflowId: number | null;
  input: Record<string, unknown>;
  cost: number;
  textResult: string;
  taskId: string;
}): Promise<{ runId: number; nodeExecutionId: number }> {
  const wfId =
    opts.workflowId ??
    (
      (await sql`
        INSERT INTO workflows (user_id, name, status)
        VALUES (${opts.userId}, ${`Ad-hoc · ${opts.model.name}`}, 'succeeded')
        RETURNING id
      `) as { id: number }[]
    )[0].id;

  const nodeId = (
    (await sql`
      INSERT INTO workflow_nodes (workflow_id, type, model_slug, config, canvas_x, canvas_y)
      VALUES (${wfId}, 'model', ${opts.model.slug}, ${JSON.stringify(opts.input)}::jsonb, '0', '0')
      RETURNING id
    `) as { id: number }[]
  )[0].id;

  const run = (
    (await sql`
      INSERT INTO runs (workflow_id, user_id, status, total_cost_usd, completed_at)
      VALUES (${wfId}, ${opts.userId}, 'succeeded', ${opts.cost}, NOW())
      RETURNING id
    `) as { id: number }[]
  )[0];

  const exec = (
    (await sql`
      INSERT INTO run_node_executions
        (run_id, workflow_node_id, status, kie_task_id, input_params, text_result, started_at, completed_at, cost_usd)
      VALUES
        (${run.id}, ${nodeId}, 'succeeded', ${opts.taskId}, ${JSON.stringify(opts.input)}::jsonb, ${opts.textResult}, NOW(), NOW(), ${opts.cost})
      RETURNING id
    `) as { id: number }[]
  )[0];

  return { runId: run.id, nodeExecutionId: exec.id };
}

// Re-export the cost helper so other API files can use without re-importing.
export { toNumber };
