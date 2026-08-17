import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CATALOGUE, type CatalogueEntry } from "../src/lib/models-data";

/**
 * KIE-ENDPOINTS.md contains documentation URLs, while `kie_endpoint` stores
 * the exact model identifier sent in the createTask payload. These aliases
 * are intentionally explicit because the documentation path and payload
 * identifier are not always the same (for example, Seedream and Kling).
 */
export function normalizeKieDocumentationPath(rawPath: string): string {
  let path = rawPath.trim().replace(/[)`]+$/, "");
  if (path.startsWith("market/")) path = path.slice("market/".length);
  if (path.startsWith("common/") || path === "veo3-api/quickstart") return "";

  if (path === "seedream/seedream") return "bytedance/seedream";
  if (path.startsWith("seedream/seedream-v4-"))
    return `bytedance/${path.slice("seedream/".length)}`;
  if (path.startsWith("seedream/4-5-")) return path.replace("seedream/4-5-", "seedream/4.5-");
  if (path === "z-image/z-image") return "z-image";
  if (path === "google/nanobanana2") return "nano-banana-2";
  if (path.startsWith("flux2/")) return `flux-2/${path.slice("flux2/".length)}`;
  if (path.startsWith("gpt-image/1-5-")) return path.replace("gpt-image/1-5-", "gpt-image/1.5-");
  if (path.startsWith("gpt/gpt-image-2-")) return path.slice("gpt/".length);
  if (path === "grok-imagine/1-5-preview") return "grok-imagine-video-1-5-preview";
  if (path === "kling/kling-3-0") return "kling-3.0/video";
  if (path === "kling/motion-control") return "kling-2.6/motion-control";
  if (path === "kling/motion-control-v3") return "kling-3.0/motion-control";
  if (path === "kling/v25-turbo-image-to-video-pro") {
    return "kling/v2-1-master-image-to-video";
  }
  if (path.startsWith("kling/v25-")) return path.replace("kling/v25-", "kling/v2-5-");
  if (path === "kling/text-to-video") return "kling-2.6/text-to-video";
  if (path === "kling/image-to-video") return "kling-2.6/image-to-video";
  if (path === "kling/v2-5-turbo-image-to-video-pro") {
    return "kling/v2-1-master-image-to-video";
  }
  if (path === "bytedance/seedance-1-5-pro") return "bytedance/seedance-1.5-pro";
  if (path === "bytedance/seedance-2-mini") return "bytedance/seedance-2-5";
  if (path.startsWith("chat/")) return path.slice("chat/".length);
  if (path.startsWith("claude/")) {
    return path.slice("claude/".length).replace("cluade-", "claude-");
  }
  if (path === "codex/gpt-codex") return "gpt-5-codex";
  if (path.startsWith("gemini/")) {
    const value = path.slice("gemini/".length);
    return value.replace(/^(gemini)-(\d+)-(\d+)(.*)$/, "$1-$2.$3$4");
  }
  if (path.startsWith("grok/")) return path.slice("grok/".length).replace("grok-4-", "grok-4.");

  return path;
}

export function parseDocumentedKieEndpoints(markdown: string): string[] {
  return [...markdown.matchAll(/^- https:\/\/docs\.kie\.ai\/(.+)$/gm)]
    .map((match) => normalizeKieDocumentationPath(match[1]))
    .filter(Boolean);
}

export const APPROVED_CATALOGUE_ONLY_ENDPOINTS = new Set([
  "aleph/generate",
  "elevenlabs/sound-effect-v2",
  "elevenlabs/speech-to-text",
  "gemini-2.5-pro-tts",
  "gemini-3.1-flash-tts",
  "happyhorse-1-1/video-edit",
  "ideogram/v3-reframe",
  "kling/2-6-image-to-video",
  "kling/2-6-motion-control",
  "kling/2-6-text-to-video",
  "nano-banana-pro",
  "runway/extend",
  "runway/generate",
  "sora-2-characters",
  "sora-2-characters-pro",
  "sora-2-image-to-video",
  "sora-2-pro-image-to-video",
  "sora-2-pro-storyboard",
  "sora-2-pro-text-to-video",
  "sora-2-text-to-video",
  "sora-watermark-remover",
  "suno-api/boost-style",
  "suno-api/generate-timestamped-lyrics",
  "veo3",
]);

/** Multiple catalogue slugs intentionally share a provider identifier. */
export const APPROVED_DUPLICATE_ENDPOINTS = new Set([
  "bytedance/seedance-2",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-3-flash",
  "gemini-3-flash-v1beta",
  "gemini-3-pro",
  "gemini-3.1-pro",
  "gpt-5-4",
  "gpt-5-5",
  "gpt-5-6-luna",
  "gpt-5-6-sol",
  "gpt-5-6-terra",
  "hailuo/2-3-image-to-video-pro",
  "hailuo/2-3-image-to-video-standard",
  "kling-3.0/video",
  "kling/v2-1-master-image-to-video",
]);

export type KieContractReport = {
  documentedEndpointCount: number;
  documentedUniqueEndpointCount: number;
  catalogueEntryCount: number;
  catalogueUniqueEndpointCount: number;
  missingFromCatalogue: string[];
  unapprovedCatalogueOnly: string[];
  duplicateEndpoints: string[];
  catalogueOnly: string[];
};

export function buildKieContractReport(
  markdown: string = readFileSync(resolve(process.cwd(), "KIE-ENDPOINTS.md"), "utf8"),
  catalogue: CatalogueEntry[] = CATALOGUE,
): KieContractReport {
  const documented = parseDocumentedKieEndpoints(markdown);
  const documentedSet = new Set(documented);
  const catalogueEndpoints = catalogue.map((entry) => entry.kieEndpoint);
  const catalogueSet = new Set(catalogueEndpoints);
  const catalogueOnly = [...catalogueSet].filter((endpoint) => !documentedSet.has(endpoint)).sort();
  const duplicateEndpoints = [...catalogueSet]
    .filter((endpoint) => catalogueEndpoints.filter((value) => value === endpoint).length > 1)
    .sort();

  return {
    documentedEndpointCount: documented.length,
    documentedUniqueEndpointCount: documentedSet.size,
    catalogueEntryCount: catalogue.length,
    catalogueUniqueEndpointCount: catalogueSet.size,
    missingFromCatalogue: [...documentedSet]
      .filter((endpoint) => !catalogueSet.has(endpoint))
      .sort(),
    unapprovedCatalogueOnly: catalogueOnly
      .filter((endpoint) => !APPROVED_CATALOGUE_ONLY_ENDPOINTS.has(endpoint))
      .sort(),
    duplicateEndpoints,
    catalogueOnly,
  };
}
