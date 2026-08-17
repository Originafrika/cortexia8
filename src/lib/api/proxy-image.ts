/**
 * Server-side image proxy for URLs that the browser can't load directly
 * (private R2 endpoints, kie.ai CDN with restrictive CORS, etc.).
 *
 * Returns base64-encoded image data with content-type so the client
 * can create a blob URL for <img> display.
 */

import { createServerFn } from "@tanstack/react-start";

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
    return ALLOWED_HOSTS.some((h) =>
      h.startsWith(".") ? u.hostname.endsWith(h) : u.hostname === h,
    );
  } catch {
    return false;
  }
}

export type ProxyImageInput = {
  url: string;
};

export type ProxyImageResponse = {
  data: string; // base64-encoded body
  contentType: string;
  cacheControl: string;
};

export const proxyImage = createServerFn({ method: "GET" })
  .validator((data: ProxyImageInput): ProxyImageInput => {
    if (!data || typeof data !== "object" || !data.url) {
      throw new Error("Missing url parameter");
    }
    const url = decodeURIComponent(data.url);
    if (!isAllowedUrl(url)) {
      throw new Error("URL not in allowlist");
    }
    return { url: data.url };
  })
  .handler(async ({ data }): Promise<ProxyImageResponse> => {
    const url = decodeURIComponent(data.url);

    const upstream = await fetch(url, {
      headers: { "User-Agent": "Cortexia-Proxy/1.0" },
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok) {
      throw new Error(`Upstream returned ${upstream.status}`);
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const cacheControl =
      upstream.headers.get("cache-control") ?? "public, max-age=86400, s-maxage=604800";

    const arrayBuffer = await upstream.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      data: base64,
      contentType,
      cacheControl,
    };
  });
