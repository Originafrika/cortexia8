// Cross-check: every kie.ai endpoint in KIE-ENDPOINTS.md is in CATALOGUE.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CATALOGUE } from "../src/lib/models-data";

const md = readFileSync(resolve(process.cwd(), "KIE-ENDPOINTS.md"), "utf8");
// kie.ai docs URL has the form https://docs.kie.ai/market/<path> or https://docs.kie.ai/<path>.
// The actual API base URL drops the "market/" prefix, so the kieEndpoint in our catalogue
// is the path after the API base (i.e. for "market/foo/bar" the endpoint is "/foo/bar").
const endpoints = [...md.matchAll(/^- https:\/\/docs\.kie\.ai\/(.+)$/gm)]
  .map((m) => "/" + m[1].trim().replace(/^market\//, ""))
  .filter((p) => !p.startsWith("/common/") && !p.startsWith("/veo3-api/quickstart"));

const inCatalogue = new Set(CATALOGUE.map((m) => m.kieEndpoint));
const missing = endpoints.filter((e) => !inCatalogue.has(e));
const extra = [...inCatalogue].filter((e) => !endpoints.includes(e));

console.log(`KIE endpoints to register: ${endpoints.length}`);
console.log(`In catalogue:             ${endpoints.length - missing.length}`);
console.log(`Missing from catalogue:   ${missing.length}`);
if (missing.length) {
  console.log("  Missing:");
  for (const m of missing) console.log(`    - ${m}`);
}
console.log(`Extra (in catalogue but not in KIE list): ${extra.length}`);
if (extra.length) {
  console.log("  Extra:");
  for (const e of extra) console.log(`    - ${e}`);
}
