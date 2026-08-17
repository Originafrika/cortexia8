import { describe, expect, it } from "vitest";
import { AGENT_MODELS } from "../src/lib/agent";
import { CATALOGUE } from "../src/lib/models-data";
import { APPROVED_DUPLICATE_ENDPOINTS, buildKieContractReport } from "./kie-endpoint-contract";

describe("KIE endpoint contract", () => {
  it("covers every documented model after applying explicit documentation aliases", () => {
    const report = buildKieContractReport();

    expect(report.documentedEndpointCount).toBeGreaterThan(150);
    expect(report.missingFromCatalogue).toEqual([]);
    expect(report.unapprovedCatalogueOnly).toEqual([]);
  });

  it("keeps intentional shared provider identifiers explicit", () => {
    const report = buildKieContractReport();

    expect(report.duplicateEndpoints).toEqual([...APPROVED_DUPLICATE_ENDPOINTS].sort());
  });

  it("derives agent options from the active text catalogue", () => {
    const expected = CATALOGUE.filter(
      (model) =>
        model.active &&
        model.category === "text" &&
        (model.apiFamily === "chat_openai" || model.apiFamily === "chat_anthropic"),
    )
      .map((model) => model.slug)
      .sort();

    expect(AGENT_MODELS.map((model) => model.value).sort()).toEqual(expected);
  });
});
