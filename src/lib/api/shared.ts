/**
 * Shared types + helpers for the API routes.
 *
 * The API is intentionally model-agnostic: every route reads model config
 * from the `models` table at request time. Adding a 151st model is a DB
 * row, never a code change.
 */

import { sql } from "@/lib/db";
import { UploadSource, upload as kieUpload } from "@/lib/kie-api/upload";

export type ModelCategory = "image" | "video" | "audio" | "text" | "music";

export type ModelRow = {
  id: number;
  slug: string;
  name: string;
  provider: string;
  category: ModelCategory;
  kie_endpoint: string;
  input_schema: Record<string, unknown>;
  output_type: string;
  pricing_unit: string;
  provider_cost_usd: string;
  cortexia_price_usd: string;
  fidelity_status: "fidele" | "generique";
  supports_reference_upload: boolean;
  active: boolean;
};

/** Resolve a model by slug. Returns null if not found or inactive. */
export async function getActiveModelBySlug(slug: string): Promise<ModelRow | null> {
  const rows = (await sql`
    SELECT id, slug, name, provider, category, kie_endpoint, input_schema,
           output_type, pricing_unit,
           provider_cost_usd::text AS provider_cost_usd,
           cortexia_price_usd::text AS cortexia_price_usd,
           fidelity_status, supports_reference_upload, active
    FROM models
    WHERE slug = ${slug} AND active = TRUE
    LIMIT 1
  `) as ModelRow[];
  return rows[0] ?? null;
}

/** Convert a numeric/decimal string to a JS number. */
export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Marker shape a client uses to ask the server to upload a file before
 * the input is forwarded to kie.ai. Putting this convention in one place
 * (here) keeps model-specific code out of the dispatcher.
 */
export type UploadMarker = {
  __kie_upload: "base64" | "url" | "stream" | "file";
  data?: string;
  url?: string;
  bytes_b64?: string;
  filename?: string;
  mimeType?: string;
};

export function isUploadMarker(v: unknown): v is UploadMarker {
  return (
    !!v &&
    typeof v === "object" &&
    "__kie_upload" in (v as Record<string, unknown>) &&
    typeof (v as { __kie_upload: unknown }).__kie_upload === "string"
  );
}

function markerToSource(marker: UploadMarker): UploadSource {
  switch (marker.__kie_upload) {
    case "base64":
      return {
        kind: "base64",
        data: marker.data ?? "",
        filename: marker.filename,
        mimeType: marker.mimeType,
      };
    case "url":
      if (!marker.url) throw new Error("Upload marker missing url");
      return { kind: "url", url: marker.url };
    case "stream":
      if (!marker.url) throw new Error("Upload marker missing url");
      return {
        kind: "stream",
        url: marker.url,
        filename: marker.filename,
        mimeType: marker.mimeType,
      };
    case "file":
      if (!marker.bytes_b64) throw new Error("Upload marker missing bytes_b64");
      return {
        kind: "base64",
        data: marker.bytes_b64,
        filename: marker.filename ?? "upload",
        mimeType: marker.mimeType ?? "application/octet-stream",
      };
  }
}

/**
 * Walk an arbitrary input object and replace any upload markers with the
 * hosted URL returned by kie.ai's file-upload endpoint. Non-marker
 * values are left untouched; nested objects/arrays are walked
 * recursively. This is the entire "model-agnostic reference upload"
 * story — no model-specific code anywhere.
 */
export async function resolveUploads(
  input: Record<string, unknown>,
): Promise<{ resolved: Record<string, unknown>; uploadedCount: number }> {
  let uploadedCount = 0;

  async function walk(value: unknown): Promise<unknown> {
    if (isUploadMarker(value)) {
      const result = await kieUpload(markerToSource(value));
      uploadedCount += 1;
      return result.url;
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map((v) => walk(v)));
    }
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = await walk(v);
      }
      return out;
    }
    return value;
  }

  const resolved: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    resolved[k] = await walk(v);
  }
  return { resolved, uploadedCount };
}

/**
 * Cost lookup for a single node execution. For LLM (1m-tokens-io) we
 * can't know the cost upfront — debit after the run. For image / second /
 * 1k-chars the price is fixed and we debit up front.
 */
export function nodeCostUsd(model: ModelRow, input: Record<string, unknown>): number | null {
  const price = toNumber(model.cortexia_price_usd);
  switch (model.pricing_unit) {
    case "image":
      return price;
    case "second": {
      const d = Number(input.duration ?? 5);
      return Number.isFinite(d) && d > 0 ? price * d : price * 5;
    }
    case "1k-chars": {
      const text = typeof input.text === "string" ? input.text : "";
      const ks = Math.max(1, Math.ceil(text.length / 1000));
      return price * ks;
    }
    case "1m-tokens-io":
      // Cost depends on actual token usage, not known yet.
      return null;
    default:
      return price;
  }
}

/**
 * Topological sort that also returns the per-level grouping of nodes —
 * handy for parallel execution. Input uses an adjacency map keyed by
 * node id; both source and target ids are required.
 */
export function topoLevels(
  nodeIds: number[],
  edges: { source: number; target: number }[],
): number[][] {
  const indeg = new Map<number, number>();
  const adj = new Map<number, number[]>();
  for (const id of nodeIds) {
    indeg.set(id, 0);
    adj.set(id, []);
  }
  for (const e of edges) {
    if (!adj.has(e.source) || !indeg.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }
  const levels: number[][] = [];
  let frontier = nodeIds.filter((id) => (indeg.get(id) ?? 0) === 0);
  while (frontier.length) {
    levels.push(frontier);
    const next: number[] = [];
    for (const id of frontier) {
      for (const t of adj.get(id) ?? []) {
        const d = (indeg.get(t) ?? 0) - 1;
        indeg.set(t, d);
        if (d === 0) next.push(t);
      }
    }
    frontier = next;
  }
  // Disconnected / cyclic leftovers — append at the end so nothing is lost.
  const seen = new Set(levels.flat());
  const tail = nodeIds.filter((id) => !seen.has(id));
  if (tail.length) levels.push(tail);
  return levels;
}
