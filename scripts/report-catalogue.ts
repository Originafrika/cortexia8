// Reports the catalogue breakdown by category.
// Run with: tsx scripts/report-catalogue.ts
import { CATALOGUE } from "../src/lib/models-data";

const byCategory = new Map<string, number>();
const byFidelity = new Map<string, number>();
const byProvider = new Map<string, number>();

for (const m of CATALOGUE) {
  byCategory.set(m.category, (byCategory.get(m.category) ?? 0) + 1);
  byFidelity.set(m.fidelityStatus, (byFidelity.get(m.fidelityStatus) ?? 0) + 1);
  byProvider.set(m.provider, (byProvider.get(m.provider) ?? 0) + 1);
}

console.log(`Total models: ${CATALOGUE.length}\n`);

console.log("By category:");
for (const [k, v] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(10)} ${v}`);
}

console.log("\nBy fidelity:");
for (const [k, v] of byFidelity.entries()) {
  console.log(`  ${k.padEnd(12)} ${v}`);
}

console.log("\nBy provider (top 10):");
for (const [k, v] of [...byProvider.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${k.padEnd(20)} ${v}`);
}

console.log("\nAll slugs by category:");
const grouped = new Map<string, string[]>();
for (const m of CATALOGUE) {
  if (!grouped.has(m.category)) grouped.set(m.category, []);
  grouped.get(m.category)!.push(m.slug);
}
for (const [cat, slugs] of grouped.entries()) {
  console.log(`\n  ${cat} (${slugs.length}):`);
  for (const s of slugs) console.log(`    - ${s}`);
}
