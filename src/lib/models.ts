// Cortexia model catalog — exposes the full ~170 kie.ai endpoints.
// The single source of truth lives in `./models-data.ts`.
// This file:
//   1. Re-exports the new types and raw CATALOGUE
//   2. Derives the legacy `params` (ParamSpec[]) and `priceUSD` fields
//      so the existing UI (playground, wall, marquee, simulator) keeps working.

import {
  CATALOGUE,
  type CatalogueEntry,
  type FidelityStatus,
  type InputSchemaField,
  type ModelCategory,
  type PriceTier as _PriceTier,
} from "./models-data";

// ── Public types ─────────────────────────────────────────────────────────

export type { CatalogueEntry, FidelityStatus, InputSchemaField, ModelCategory };
export type Unit =
  | "image"
  | "second"
  | "1k-chars"
  | "1m-tokens-io"
  | "track";

export type ParamSpec =
  | { kind: "prompt"; label: string; placeholder?: string }
  | { kind: "upload"; label: string; multiple?: boolean; accepts?: string }
  | { kind: "select"; label: string; key: string; options: string[]; advanced?: boolean }
  | {
      kind: "slider";
      label: string;
      key: string;
      min: number;
      max: number;
      step: number;
      default: number;
      suffix?: string;
      advanced?: boolean;
    }
  | { kind: "seed"; label: string; advanced?: boolean }
  | { kind: "toggle"; label: string; key: string; default?: boolean; advanced?: boolean };

export type PriceTier = _PriceTier;

export type Model = {
  slug: string;
  name: string;
  provider: string;
  category: ModelCategory;
  unit: Unit;
  priceUSD?: number;
  tiers?: PriceTier[];
  io?: { inputUSD: number; outputUSD: number };
  kieEndpoint: string;
  fidelityStatus: FidelityStatus;
  supportsReferenceUpload: boolean;
  providerCostUsd: number;
  cortexiaPriceUsd: number;
  active: boolean;
  inputSchema: InputSchemaField[];
  badge?: "popular" | "new" | "pro";
  blurb: string;
  params: ParamSpec[];
};

// ── Derive legacy `params` from `inputSchema` ────────────────────────────

function deriveParams(schema: InputSchemaField[]): ParamSpec[] {
  const out: ParamSpec[] = [];
  for (const f of schema) {
    const label = f.label ?? f.key;
    switch (f.type) {
      case "text":
      case "longtext":
        out.push({ kind: "prompt", label });
        break;
      case "upload":
        out.push({
          kind: "upload",
          label,
          ...(f.multiple ? { multiple: true } : {}),
          ...(f.accepts ? { accepts: f.accepts } : {}),
        });
        break;
      case "enum":
        out.push({
          kind: "select",
          label,
          key: f.key,
          options: f.options ?? [],
        });
        break;
      case "number":
        // Treat wide-range unsigned integers as a seed control.
        if (f.min === 0 && f.max === 4294967295) {
          out.push({ kind: "seed", label });
        } else {
          out.push({
            kind: "slider",
            label,
            key: f.key,
            min: f.min ?? 0,
            max: f.max ?? 100,
            step: f.step ?? 1,
            default: typeof f.default === "number" ? f.default : (f.min ?? 0),
          });
        }
        break;
      case "boolean":
        out.push({
          kind: "toggle",
          label,
          key: f.key,
          ...(typeof f.default === "boolean" ? { default: f.default } : {}),
        });
        break;
    }
  }
  return out;
}

// ── Derive legacy `priceUSD` from tiers or cortexia price ────────────────

function derivePriceUSD(entry: CatalogueEntry): number {
  if (entry.tiers && entry.tiers.length > 0) {
    return entry.tiers[0].priceUSD;
  }
  return Number(entry.cortexiaPriceUsd.toFixed(4));
}

// ── Build MODELS ─────────────────────────────────────────────────────────

export const MODELS: Model[] = CATALOGUE.map((e) => ({
  slug: e.slug,
  name: e.name,
  provider: e.provider,
  category: e.category,
  unit: e.unit,
  priceUSD: derivePriceUSD(e),
  ...(e.tiers ? { tiers: e.tiers } : {}),
  ...(e.io ? { io: e.io } : {}),
  kieEndpoint: e.kieEndpoint,
  fidelityStatus: e.fidelityStatus,
  supportsReferenceUpload: e.supportsReferenceUpload,
  providerCostUsd: e.providerCostUsd,
  cortexiaPriceUsd: e.cortexiaPriceUsd,
  active: e.active,
  inputSchema: e.inputSchema,
  ...(e.badge ? { badge: e.badge } : {}),
  blurb: e.blurb,
  params: deriveParams(e.inputSchema),
}));

// ── Helpers ──────────────────────────────────────────────────────────────

export function modelsByCategory(cat: ModelCategory): Model[] {
  return MODELS.filter((m) => m.category === cat);
}

export function getModel(slug: string): Model | undefined {
  return MODELS.find((m) => m.slug === slug);
}

export function basePrice(m: Model): number {
  if (m.priceUSD != null) return m.priceUSD;
  if (m.tiers?.length) return m.tiers[0].priceUSD;
  if (m.io) return m.io.outputUSD;
  return 0;
}

export function unitLabel(m: Model): string {
  switch (m.unit) {
    case "image":
      return "/ image";
    case "second":
      return "/ seconde";
    case "1k-chars":
      return "/ 1 000 caractères";
    case "1m-tokens-io":
      return "/ million de tokens (sortie)";
    case "track":
      return "/ track";
  }
}
