/**
 * GET /api/proxy-image?url=<encoded-url>
 *
 * Fetches a remote image (kie.ai, R2 private endpoint, etc.) server-side
 * and streams it to the browser. This bypasses CORS restrictions and
 * authentication requirements on the source URL.
 *
 * Used as a fallback for old assets that still have private R2 URLs or
 * kie.ai URLs that can't be loaded directly by the browser.
 */

import { defineEventHandler, getQuery, setResponseStatus, setResponseHeader } from "h3";

const ALLOWED_HOSTS = [
  ".r2.cloudflarestorage.com",
  ".r2.dev",
  ".kie.ai",
  ".fal.media",
  "storage.googleapis.com",
  "images.ctfassets.net",
];

function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return ALLOWED_HOSTS.some((h) => u.hostname.endsWith(h));
  } catch {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawUrl = query.url;
  if (typeof rawUrl !== "string" || !rawUrl) {
    setResponseStatus(event, 400);
    return { error: "Missing ?url= parameter" };
  }

  const url = decodeURIComponent(rawUrl);
  if (!isAllowedUrl(url)) {
    setResponseStatus(event, 403);
    return { error: "URL not in allowlist" };
  }

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "Cortexia-Proxy/1.0" },
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok) {
      setResponseStatus(event, upstream.status);
      return { error: `Upstream returned ${upstream.status}` };
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const cacheControl = upstream.headers.get("cache-control") ?? "public, max-age=86400, s-maxage=604800";

    setResponseHeader(event, "Content-Type", contentType);
    setResponseHeader(event, "Cache-Control", cacheControl);
    setResponseHeader(event, "Access-Control-Allow-Origin", "*");

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(`[proxy-image] Failed to fetch ${url}:`, err);
    setResponseStatus(event, 502);
    return { error: "Failed to fetch upstream" };
  }
});
