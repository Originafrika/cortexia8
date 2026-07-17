/**
 * Seed the `models` table from the static catalog in src/lib/models.ts.
 *
 * This is intentionally a one-shot script, not a permanent data source.
 * The DB is the source of truth at runtime; this script just bootstraps
 * it with the existing ~30 models so the API routes can be exercised
 * end-to-end. Run it with:
 *
 *   pnpm tsx scripts/seed-models.ts
 *   # or
 *   DATABASE_URL=… node --import tsx scripts/seed-models.ts
 *
 * The kie_endpoint values come from the existing catalog. They are
 * kie.ai model identifiers (e.g. "bytedance/seedream") — verify each
 * one against https://docs.kie.ai before going to production; the
 * underlying provider model strings sometimes shift between minor
 * versions.
 */

import { Pool } from "@neondatabase/serverless";
import { MODELS, type Model } from "../src/lib/models";

type ParamSpec = Model["params"][number];

function paramsToSchema(params: ParamSpec[]): {
  schema: Record<string, unknown>;
  supportsReferenceUpload: boolean;
} {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  let supportsReferenceUpload = false;
  for (const p of params) {
    switch (p.kind) {
      case "prompt": {
        properties[p.label] = { type: "string", "x-control": "prompt" };
        required.push(p.label);
        break;
      }
      case "upload": {
        properties[p.label] = {
          type: "string",
          format: "uri",
          "x-control": "upload",
          "x-accepts": p.accepts,
        };
        supportsReferenceUpload = true;
        break;
      }
      case "select": {
        properties[p.key] = { type: "string", enum: p.options, "x-control": "select" };
        if (!p.advanced) required.push(p.key);
        break;
      }
      case "slider": {
        properties[p.key] = {
          type: "number",
          minimum: p.min,
          maximum: p.max,
          default: p.default,
          "x-control": "slider",
          "x-suffix": p.suffix,
        };
        break;
      }
      case "seed": {
        properties.seed = { type: "integer", "x-control": "seed" };
        break;
      }
      case "toggle": {
        properties[p.key] = { type: "boolean", default: !!p.default, "x-control": "toggle" };
        break;
      }
    }
  }
  return {
    schema: { type: "object", properties, required, additionalProperties: true },
    supportsReferenceUpload,
  };
}

function categoryToOutputType(c: Model["category"]): string {
  switch (c) {
    case "image":
    case "video":
    case "audio":
    case "text":
      return c;
  }
}

function unitToPricingUnit(u: Model["unit"]): string {
  return u;
}

function costFromModel(m: Model): { provider: number; cortexia: number } {
  if (m.priceUSD != null) return { provider: m.priceUSD, cortexia: m.priceUSD };
  if (m.tiers?.length) return { provider: m.tiers[0].priceUSD, cortexia: m.tiers[0].priceUSD };
  if (m.io) return { provider: m.io.outputUSD, cortexia: m.io.outputUSD };
  return { provider: 0, cortexia: 0 };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url });

  let inserted = 0;
  let updated = 0;
  for (const m of MODELS) {
    const { schema, supportsReferenceUpload } = paramsToSchema(m.params);
    const { provider, cortexia } = costFromModel(m);
    const res = await pool.query(
      `INSERT INTO models
         (slug, name, provider, category, kie_endpoint, input_schema, output_type, pricing_unit,
          provider_cost_usd, cortexia_price_usd, fidelity_status, supports_reference_upload, active)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,TRUE)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         provider = EXCLUDED.provider,
         category = EXCLUDED.category,
         kie_endpoint = EXCLUDED.kie_endpoint,
         input_schema = EXCLUDED.input_schema,
         output_type = EXCLUDED.output_type,
         pricing_unit = EXCLUDED.pricing_unit,
         provider_cost_usd = EXCLUDED.provider_cost_usd,
         cortexia_price_usd = EXCLUDED.cortexia_price_usd,
         fidelity_status = EXCLUDED.fidelity_status,
         supports_reference_upload = EXCLUDED.supports_reference_upload,
         updated_at = NOW()
       RETURNING (xmax = 0) AS inserted`,
      [
        m.slug,
        m.name,
        m.provider,
        m.category,
        m.kieEndpoint,
        JSON.stringify(schema),
        categoryToOutputType(m.category),
        unitToPricingUnit(m.unit),
        provider.toString(),
        cortexia.toString(),
        "generique",
        supportsReferenceUpload,
      ],
    );
    const wasInsert = res.rows[0]?.inserted === true;
    if (wasInsert) inserted += 1;
    else updated += 1;
  }
  console.log(`Seeded ${inserted + updated} models (${inserted} new, ${updated} updated).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
