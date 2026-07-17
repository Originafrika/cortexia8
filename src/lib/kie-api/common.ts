/**
 * Common kie.ai utilities — credit lookup, fresh download URL, task detail.
 *
 * These wrap the bare createTask/getTaskDetail/parseResultJson helpers in
 * client.ts with smaller surfaces aimed at the webhook + generate flows.
 */

import { getTaskDetail, kieApiBase, parseResultJson, KieApiError } from "./client";

export type KieCredits = { remaining: number };

/** GET /api/v1/chat/credit — current kie.ai account balance. */
export async function getAccountCredits(): Promise<KieCredits> {
  const endpoint = "/api/v1/chat/credit";
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY is not set");
  const res = await fetch(`${kieApiBase()}${endpoint}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    let upstream: unknown = null;
    try {
      upstream = await res.json();
    } catch {
      upstream = await res.text();
    }
    throw new KieApiError(res.status, endpoint, `HTTP ${res.status}`, upstream);
  }
  const json = (await res.json()) as { code: number; msg: string; data?: number };
  if (json.code !== 200 || typeof json.data !== "number") {
    throw new KieApiError(json.code, endpoint, json.msg, json);
  }
  return { remaining: json.data };
}

/**
 * GET /api/v1/common/download-url — kie.ai's URLs expire (~24h), so the
 * webhook re-asks for a fresh link before storing the asset. The exact
 * shape of this endpoint isn't documented; we POST the URL and accept
 * whatever kie.ai returns (commonly { code, msg, data: { url } }).
 */
export async function getFreshDownloadUrl(sourceUrl: string): Promise<string> {
  const endpoint = "/api/v1/common/download-url";
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY is not set");
  const res = await fetch(`${kieApiBase()}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: sourceUrl }),
  });
  if (!res.ok) {
    // Non-fatal: the original URL may still be valid for a while.
    return sourceUrl;
  }
  const json = (await res.json()) as {
    code: number;
    msg: string;
    data?: { url?: string } | string;
  };
  if (json.code !== 200) return sourceUrl;
  if (typeof json.data === "string") return json.data;
  if (json.data && typeof json.data === "object" && typeof json.data.url === "string") {
    return json.data.url;
  }
  return sourceUrl;
}

/**
 * Convenience: poll a task until it lands on success / fail. We use this
 * as a fallback in the generate route when kie.ai does not deliver a
 * webhook (e.g. misconfigured APP_URL, transient upstream issue). The
 * webhook flow is the primary path; polling is just a safety net.
 */
export async function awaitTaskSuccess(
  taskId: string,
  opts: { timeoutMs?: number; intervalMs?: number; signal?: AbortSignal } = {},
): Promise<Awaited<ReturnType<typeof getTaskDetail>>> {
  const timeout = opts.timeoutMs ?? 10 * 60_000; // 10 min, matches kie.ai's recommendation
  const interval = opts.intervalMs ?? 2_000;
  const start = Date.now();
  // exponential backoff capped at 8s — kie.ai docs recommend this curve
  let currentInterval = interval;
  while (true) {
    if (opts.signal?.aborted) {
      throw new Error("Polling aborted");
    }
    const info = await getTaskDetail(taskId);
    if (info.state === "success" || info.state === "fail") return info;
    if (Date.now() - start > timeout) {
      throw new Error(`Task ${taskId} timed out after ${timeout}ms`);
    }
    await new Promise((r) => setTimeout(r, currentInterval));
    currentInterval = Math.min(currentInterval * 1.4, 8_000);
  }
}

export { getTaskDetail, parseResultJson };
