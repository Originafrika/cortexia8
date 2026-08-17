import { buildKieContractReport } from "./kie-endpoint-contract";

const report = buildKieContractReport();

console.log(`KIE documented endpoints:     ${report.documentedUniqueEndpointCount}`);
console.log(`Catalogue entries:            ${report.catalogueEntryCount}`);
console.log(`Unique catalogue identifiers: ${report.catalogueUniqueEndpointCount}`);
console.log(`Missing from catalogue:       ${report.missingFromCatalogue.length}`);
console.log(`Catalogue-only (reviewed):    ${report.catalogueOnly.length}`);
console.log(`Duplicate identifiers:        ${report.duplicateEndpoints.length}`);

if (report.missingFromCatalogue.length > 0) {
  console.error("Missing provider identifiers:");
  for (const endpoint of report.missingFromCatalogue) console.error(`  - ${endpoint}`);
}

if (report.unapprovedCatalogueOnly.length > 0) {
  console.error("Unapproved catalogue-only identifiers:");
  for (const endpoint of report.unapprovedCatalogueOnly) console.error(`  - ${endpoint}`);
}

if (report.missingFromCatalogue.length > 0 || report.unapprovedCatalogueOnly.length > 0) {
  process.exitCode = 1;
}
