/**
 * kie.ai file upload — supports the four upload shapes kie.ai exposes:
 *   1. file:    raw bytes (base64 in the body) or multipart (server-side)
 *   2. base64:  pre-encoded data URL or raw base64 string
 *   3. stream:  a streamable URL we re-fetch and forward
 *   4. url:     a remote URL kie.ai will fetch directly
 *
 * In all four cases we end up with a hosted URL kie.ai can re-fetch for
 * image-to-image, image-to-video, and reference uploads. The dispatcher
 * decides which one to call based on what the client provides.
 */

import { kieApiBase, KieApiError } from "./client";

export type UploadSource =
  | { kind: "file"; bytes: ArrayBuffer; filename: string; mimeType: string }
  | { kind: "base64"; data: string; filename?: string; mimeType?: string }
  | { kind: "stream"; url: string; filename?: string; mimeType?: string }
  | { kind: "url"; url: string };

export type UploadResult = {
  url: string;
  /**
   * Whatever kie.ai returns alongside the URL. We keep this raw so callers
   * can use it (e.g. for asset metadata) without us hardcoding a shape.
   */
  raw: unknown;
};

export class UploadError extends Error {
  constructor(
    message: string,
    public source: UploadSource["kind"],
    public upstream?: unknown,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB ceiling, generous for media refs

function authHeaders(): Record<string, string> {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY is not set");
  return { Authorization: `Bearer ${key}` };
}

function bytesToBase64(bytes: ArrayBuffer): string {
  // Buffer is available in the Node runtime Vercel Functions use.
  const buf = Buffer.from(bytes);
  return buf.toString("base64");
}

/** Strip the `data:<mime>;base64,` prefix if present. */
function stripBase64Prefix(s: string): { data: string; mime?: string } {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(s);
  if (m) return { mime: m[1], data: m[2] };
  return { data: s };
}

/** 1. file — raw bytes we already have in memory (server-side request). */
export async function uploadFile(
  bytes: ArrayBuffer,
  filename: string,
  mimeType: string,
): Promise<UploadResult> {
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new UploadError(`File too large (${bytes.byteLength} > ${MAX_UPLOAD_BYTES})`, "file");
  }
  return uploadBase64(bytesToBase64(bytes), filename, mimeType);
}

/** 2. base64 — pre-encoded string (data URL or raw). */
export async function uploadBase64(
  rawBase64: string,
  filename = "upload",
  mimeType = "application/octet-stream",
): Promise<UploadResult> {
  const { data, mime } = stripBase64Prefix(rawBase64);
  const endpoint = "/api/v1/common/file-upload";
  const body = {
    base64: data,
    fileName: filename,
    mimeType: mime ?? mimeType,
  };
  const res = await fetch(`${kieApiBase()}${endpoint}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let upstream: unknown = null;
    try {
      upstream = await res.json();
    } catch {
      upstream = await res.text();
    }
    throw new UploadError(`Upload failed: HTTP ${res.status}`, "base64", upstream);
  }
  const json = (await res.json()) as {
    code: number;
    msg: string;
    data?: { url?: string; [k: string]: unknown };
  };
  if (json.code !== 200 || !json.data?.url) {
    throw new UploadError(json.msg || "Upload rejected", "base64", json);
  }
  return { url: json.data.url, raw: json.data };
}

/** 3. stream — fetch the URL ourselves and forward as base64. */
export async function uploadStream(
  url: string,
  filename?: string,
  mimeType?: string,
): Promise<UploadResult> {
  const inferredName =
    filename ??
    (() => {
      try {
        const u = new URL(url);
        const last = u.pathname.split("/").filter(Boolean).pop();
        return last || "stream-upload";
      } catch {
        return "stream-upload";
      }
    })();
  const res = await fetch(url);
  if (!res.ok) {
    throw new UploadError(`Failed to fetch stream source: HTTP ${res.status}`, "stream");
  }
  const inferredMime = mimeType ?? res.headers.get("content-type") ?? "application/octet-stream";
  const bytes = await res.arrayBuffer();
  return uploadFile(bytes, inferredName, inferredMime);
}

/** 4. url — kie.ai fetches it directly. Used for already-hosted media. */
export async function uploadUrl(url: string): Promise<UploadResult> {
  // kie.ai accepts a hosted URL as-is for image-to-image / image-to-video
  // models. We just echo it back so the dispatcher can hand it to the
  // generation endpoint without an extra round-trip.
  try {
    // basic validation — we don't want to hand garbage to kie.ai
    new URL(url);
  } catch {
    throw new UploadError(`Invalid URL: ${url}`, "url");
  }
  return { url, raw: { source: "url" } };
}

/**
 * Dispatcher — pick the right upload method based on the source shape.
 * The shape is decided by the caller (e.g. the API route) so the model
 * layer stays oblivious to how the file arrived.
 */
export async function upload(source: UploadSource): Promise<UploadResult> {
  switch (source.kind) {
    case "file":
      return uploadFile(source.bytes, source.filename, source.mimeType);
    case "base64":
      return uploadBase64(source.data, source.filename, source.mimeType);
    case "stream":
      return uploadStream(source.url, source.filename, source.mimeType);
    case "url":
      return uploadUrl(source.url);
  }
}
