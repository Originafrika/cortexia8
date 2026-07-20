/**
 * GET /api/history — fetch generation history for the current user.
 *
 * Joins runs → run_node_executions → workflow_nodes → assets to return
 * a flat list of completed generations with model info, prompt, cost,
 * and preview URL.
 */

import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getModel, type Model } from "@/lib/models";
import { HttpError, toJsonResponse } from "./auth";

export type HistoryInput = {
  userId: number;
  limit?: number;
};

export type HistoryItem = {
  id: string;
  modelSlug: string;
  modelName: string;
  modelCategory: string;
  prompt: string;
  date: string;
  cost: number;
  previewUrl: string | null;
  status: string;
};

export type HistoryResponse = {
  items: HistoryItem[];
};

export const getHistory = createServerFn({ method: "GET" })
  .validator((data: HistoryInput): HistoryInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (data.userId == null) throw new HttpError(400, "userId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      return await loadHistory(data);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

async function loadHistory(input: HistoryInput): Promise<HistoryResponse> {
  const limit = Math.min(input.limit ?? 100, 200);

  const rows = (await sql`
    SELECT
      rne.id AS exec_id,
      rne.status,
      rne.cost_usd::text AS cost_usd,
      rne.input_params,
      rne.started_at,
      wn.model_slug,
      a.storage_url AS preview_url
    FROM run_node_executions rne
    JOIN runs r ON r.id = rne.run_id
    JOIN workflow_nodes wn ON wn.id = rne.workflow_node_id
    LEFT JOIN assets a ON a.id = rne.output_asset_id
    WHERE r.user_id = ${input.userId}
    ORDER BY rne.started_at DESC NULLS LAST, rne.id DESC
    LIMIT ${limit}
  `) as {
    exec_id: number;
    status: string;
    cost_usd: string;
    input_params: Record<string, unknown> | null;
    started_at: string | null;
    model_slug: string;
    preview_url: string | null;
  }[];

  const items: HistoryItem[] = rows.map((row) => {
    const prompt = extractPrompt(row.input_params);
    const cost = Number(row.cost_usd ?? 0);
    const model = getModel(row.model_slug);

    return {
      id: `exec-${row.exec_id}`,
      modelSlug: row.model_slug,
      modelName: model?.name ?? row.model_slug,
      modelCategory: model?.category ?? "image",
      prompt,
      date: row.started_at ?? "",
      cost,
      previewUrl: row.preview_url,
      status: row.status,
    };
  });

  return { items };
}

function extractPrompt(params: Record<string, unknown> | null): string {
  if (!params || typeof params !== "object") return "";
  // Common prompt field names across model types
  for (const key of ["prompt", "text", "message", "messages"]) {
    const val = params[key];
    if (typeof val === "string" && val.trim()) return val.trim();
    // OpenAI-style messages array
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0] as Record<string, unknown>;
      if (typeof first?.content === "string") return first.content.trim();
    }
  }
  return "";
}
