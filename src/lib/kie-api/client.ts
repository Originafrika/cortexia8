/**
 * kie.ai client — single entry point for talking to the kie.ai API.
 *
 * The kie.ai integration is intentionally model-agnostic. The DB row's
 * `kie_endpoint` field stores the exact model identifier kie.ai expects
 * in the createTask payload (e.g. "bytedance/seedream", "kling/kling-3-0").
 * This module never branches on slug → behaviour; it just forwards the
 * configured input to the right endpoint URL.
 *
 * Endpoints used (kie.ai OpenAPI, base https://api.kie.ai):
 *   POST /api/v1/jobs/createTask            create a generation task
 *   GET  /api/v1/jobs/recordInfo?taskId=…   poll for status / result
 *   GET  /api/v1/chat/credit                remaining credits
 *   GET  /api/v1/common/download-url        get a fresh download URL
 *   POST /api/v1/common/file-upload         upload a file, get a hosted URL
 */

const KIE_API_BASE = process.env.KIE_API_BASE ?? "https://api.kie.ai";

export const kieApiBase = () => KIE_API_BASE.replace(/\/+$/, "");

export type KieCreateTaskResponse = {
  code: number;
  msg: string;
  data?: { taskId: string };
};

export type KieRecordState = "waiting" | "queuing" | "generating" | "success" | "fail";

export type KieRecordInfo = {
  taskId: string;
  model: string;
  state: KieRecordState;
  param?: string;
  resultJson?: string;
  failCode?: string;
  failMsg?: string;
  costTime?: number;
  completeTime?: number;
  createTime?: number;
  updateTime?: number;
  progress?: number;
  creditsConsumed?: number;
};

export type KieRecordInfoResponse = {
  code: number;
  msg: string;
  data?: KieRecordInfo;
};

export type KieCreditsResponse = {
  code: number;
  msg: string;
  data?: number;
};

export class KieApiError extends Error {
  constructor(
    public code: number,
    public endpoint: string,
    message: string,
    public upstream?: unknown,
  ) {
    super(`kie.ai [${code}] ${endpoint}: ${message}`);
    this.name = "KieApiError";
  }
}

function authHeaders(): Record<string, string> {
  const key = process.env.KIE_API_KEY;
  if (!key) {
    // Fail loudly — the rest of the system is meaningless without the key.
    throw new Error("KIE_API_KEY is not set");
  }
  return { Authorization: `Bearer ${key}` };
}

async function readError(res: Response, endpoint: string): Promise<never> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  const msg =
    typeof body === "object" && body && "msg" in body
      ? String((body as { msg?: unknown }).msg ?? "unknown error")
      : typeof body === "string" && body.length < 500
        ? body
        : `HTTP ${res.status}`;
  const code =
    typeof body === "object" && body && "code" in body
      ? Number((body as { code?: unknown }).code ?? res.status)
      : res.status;
  throw new KieApiError(code, endpoint, msg, body);
}

/**
 * Submit a generation task. The caller supplies the model identifier
 * (read from models.kie_endpoint) and the input payload, both of which
 * are stored in the DB at request time.
 */
export async function createTask(opts: {
  model: string;
  input: Record<string, unknown>;
  callBackUrl?: string;
}): Promise<{ taskId: string }> {
  const endpoint = "/api/v1/jobs/createTask";
  const body: Record<string, unknown> = {
    model: opts.model,
    input: opts.input,
  };
  if (opts.callBackUrl) body.callBackUrl = opts.callBackUrl;

  const res = await fetch(`${kieApiBase()}${endpoint}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) await readError(res, endpoint);
  const json = (await res.json()) as KieCreateTaskResponse;
  if (json.code !== 200 || !json.data?.taskId) {
    throw new KieApiError(json.code, endpoint, json.msg, json);
  }
  return { taskId: json.data.taskId };
}

/** Poll a task's state. Cheap and idempotent. */
export async function getTaskDetail(taskId: string): Promise<KieRecordInfo> {
  const endpoint = `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;
  const res = await fetch(`${kieApiBase()}${endpoint}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) await readError(res, endpoint);
  const json = (await res.json()) as KieRecordInfoResponse;
  if (json.code !== 200 || !json.data) {
    throw new KieApiError(json.code, endpoint, json.msg, json);
  }
  return json.data;
}

/** Resolve a task's resultJson into structured URLs (for media tasks). */
export function parseResultJson(raw: string | undefined): {
  resultUrls: string[];
  resultObject?: Record<string, unknown>;
} {
  if (!raw) return { resultUrls: [] };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const urls = Array.isArray(parsed.resultUrls)
      ? (parsed.resultUrls as unknown[]).filter((u): u is string => typeof u === "string")
      : [];
    const obj =
      parsed.resultObject && typeof parsed.resultObject === "object"
        ? (parsed.resultObject as Record<string, unknown>)
        : undefined;
    return { resultUrls: urls, resultObject: obj };
  } catch {
    return { resultUrls: [] };
  }
}

/**
 * Build the absolute callback URL we send to kie.ai. In dev we hit
 * localhost; in prod we trust the APP_URL env var.
 */
export function buildCallbackUrl(): string {
  const base =
    process.env.APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (!base) {
    throw new Error(
      "APP_URL is not set. Required to build the kie.ai callback URL. " +
        "Set it to your public origin (e.g. https://app.cortexia.ai).",
    );
  }
  return `${base.replace(/\/+$/, "")}/api/webhooks/kie`;
}
