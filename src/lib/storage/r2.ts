/**
 * Cloudflare R2 storage helper.
 *
 * R2 is S3-compatible. We use a tiny in-tree Signature v4 implementation
 * built on Web Crypto so we don't need to add @aws-sdk/client-s3 to the
 * Vercel Function bundle (~500KB+ saving). The same code works on
 * Cloudflare Workers and Node 22+.
 *
 * MVP behaviour: if R2 isn't configured, we fall back to passing through
 * the original kie.ai URL. The asset record still gets a storage_url; it
 * just points at the upstream CDN. The webhook flow remains the same, and
 * we can flip on R2 later by setting the four env vars.
 */

export type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
  publicBaseUrl?: string;
};

export function getR2Config(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }
  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    region: process.env.R2_REGION ?? "auto",
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  };
}

export type PutOptions = {
  /** Path inside the bucket, e.g. "users/12/assets/42.mp4" */
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
};

export type PutResult = {
  key: string;
  /** Public URL for the uploaded object. */
  url: string;
  via: "r2" | "passthrough";
};

/**
 * Upload an object via the S3 PutObject API. Returns the public URL. If
 * R2 isn't configured, we still return a result so the caller can record
 * the asset with the original kie.ai URL.
 */
export async function putObject(opts: PutOptions): Promise<PutResult> {
  const cfg = getR2Config();
  if (!cfg) {
    return { key: opts.key, url: opts.key, via: "passthrough" };
  }
  await s3PutObject(cfg, opts);
  const publicBase = cfg.publicBaseUrl ?? cfg.endpoint.replace(/\/+$/, "");
  const url = `${publicBase.replace(/\/+$/, "")}/${opts.key}`;
  return { key: opts.key, url, via: "r2" };
}

/** Download a remote URL into a Buffer. */
export async function downloadToBuffer(
  url: string,
): Promise<{ body: Buffer; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const ab = await res.arrayBuffer();
  return { body: Buffer.from(ab), contentType };
}

/** Cheap content-type guess from a key's extension. */
export function guessContentType(key: string): string {
  const ext = key.toLowerCase().split(".").pop() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "m4a":
      return "audio/mp4";
    case "ogg":
      return "audio/ogg";
    case "json":
    case "txt":
    case "md":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

/** Build a deterministic-ish R2 key from a context. */
export function buildAssetKey(input: {
  userId: number | null;
  runId: number;
  nodeExecutionId: number;
  sourceUrl: string;
}): string {
  const ext = (() => {
    try {
      const u = new URL(input.sourceUrl);
      const last = u.pathname.split(".").pop();
      return last && last.length <= 5 ? last : "bin";
    } catch {
      return "bin";
    }
  })();
  const userPart = input.userId ?? "anon";
  return `users/${userPart}/runs/${input.runId}/exec/${input.nodeExecutionId}.${ext}`;
}

// ── AWS Signature v4 implementation (small + dependency-free) ────────────

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
  // `as BufferSource` casts away the SharedArrayBuffer ambiguity in
  // TypeScript's lib.dom types — Web Crypto accepts both.
  const keyData = key instanceof Uint8Array ? key : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(msg) as BufferSource);
}

async function sha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  let buf: ArrayBuffer;
  if (typeof data === "string") {
    const enc = new TextEncoder().encode(data);
    buf = enc.buffer.slice(enc.byteOffset, enc.byteOffset + enc.byteLength) as ArrayBuffer;
  } else if (data instanceof Uint8Array) {
    buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else {
    buf = data;
  }
  const digest = await crypto.subtle.digest("SHA-256", buf as ArrayBuffer);
  return toHex(digest);
}

function toAmzDate(date: Date): { amzDate: string; dateStamp: string } {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const Y = date.getUTCFullYear();
  const M = pad(date.getUTCMonth() + 1);
  const D = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const m = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return {
    amzDate: `${Y}${M}${D}T${h}${m}${s}Z`,
    dateStamp: `${Y}${M}${D}`,
  };
}

async function deriveSigningKey(
  secret: string,
  dateStamp: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${secret}`), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

async function s3PutObject(cfg: R2Config, opts: PutOptions): Promise<void> {
  const region = cfg.region ?? "auto";
  const service = "s3";
  const { amzDate, dateStamp } = toAmzDate(new Date());
  const host = new URL(cfg.endpoint).host;
  const payloadHash = await sha256Hex(opts.body);

  const canonicalHeaders =
    `content-type:${opts.contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    `/${cfg.bucket}/${encodeURI(opts.key)}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await deriveSigningKey(cfg.secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const url = `${cfg.endpoint.replace(/\/+$/, "")}/${cfg.bucket}/${encodeURI(opts.key)}`;
  // Convert the body to a fresh ArrayBuffer to side-step the
  // SharedArrayBuffer mismatch in Node 22's lib types.
  const bodyBytes =
    opts.body instanceof Uint8Array
      ? (new Uint8Array(opts.body.byteLength).set(opts.body) ?? opts.body)
      : new Uint8Array(opts.body);
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Host: host,
      "Content-Type": opts.contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      "Cache-Control": opts.cacheControl ?? "public, max-age=31536000, immutable",
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: bodyBytes as BodyInit,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`R2 PUT failed: HTTP ${res.status} ${text.slice(0, 300)}`);
  }
}
