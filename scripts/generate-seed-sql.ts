// Generates drizzle/0002_seed_models.sql from src/lib/models-data.ts.
// Run with: tsx scripts/generate-seed-sql.ts
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CATALOGUE, type CatalogueEntry, type ModelCategory, type Unit } from "../src/lib/models-data";

const esc = (s: string) => s.replace(/'/g, "''");

function sqlValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "string") return `'${esc(v)}'`;
  if (Array.isArray(v) || typeof v === "object") return `'${esc(JSON.stringify(v))}'::jsonb`;
  return `'${esc(String(v))}'`;
}

function outputTypeFor(c: ModelCategory): string {
  switch (c) {
    case "image": return "image";
    case "video": return "video_url";
    case "audio": return "audio_url";
    case "text":  return "text";
    case "music": return "audio_url";
  }
}

function pricingUnitFor(u: Unit): string {
  return u;
}

const lines: string[] = [];
lines.push("-- Seed data for models table — generated from src/lib/models-data.ts");
lines.push("-- Run order: 0000_create_waitlist.sql, 0001_full_schema.sql, 0002_seed_models.sql");
lines.push("");
lines.push("INSERT INTO models (");
lines.push("  slug, name, provider, category, kie_endpoint, input_schema,");
lines.push("  output_type, pricing_unit,");
lines.push("  provider_cost_usd, cortexia_price_usd,");
lines.push("  fidelity_status, supports_reference_upload, active");
lines.push(") VALUES");
lines.push("");

const values: string[] = [];
for (const m of CATALOGUE) {
  const row = [
    sqlValue(m.slug),
    sqlValue(m.name),
    sqlValue(m.provider),
    sqlValue(m.category),
    sqlValue(m.kieEndpoint),
    sqlValue(m.inputSchema),
    sqlValue(outputTypeFor(m.category)),
    sqlValue(pricingUnitFor(m.unit)),
    sqlValue(m.providerCostUsd),
    sqlValue(m.cortexiaPriceUsd),
    sqlValue(m.fidelityStatus),
    sqlValue(m.supportsReferenceUpload),
    sqlValue(m.active),
  ].join(", ");
  values.push(`  (${row})`);
}
lines.push(values.join(",\n"));
lines.push(";");
lines.push("");

const out = resolve(process.cwd(), "drizzle/0002_seed_models.sql");
writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${out} with ${CATALOGUE.length} models.`);
