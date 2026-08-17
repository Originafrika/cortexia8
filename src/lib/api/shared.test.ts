import { describe, expect, it } from "vitest";
import { nodeCostUsd, type ModelRow } from "./shared";

const model = (pricingUnit: ModelRow["pricing_unit"], price = "2") =>
  ({ pricing_unit: pricingUnit, cortexia_price_usd: price }) as ModelRow;

describe("nodeCostUsd", () => {
  it("charges one image unit", () => {
    expect(nodeCostUsd(model("image", "0.08"), {})).toBeCloseTo(0.08);
  });

  it("multiplies second-based pricing by requested duration", () => {
    expect(nodeCostUsd(model("second", "0.12"), { duration: 7 })).toBeCloseTo(0.84);
  });

  it("rounds character pricing up to the next thousand-character block", () => {
    expect(nodeCostUsd(model("1k-chars", "0.004"), { text: "a".repeat(1001) })).toBeCloseTo(0.008);
  });

  it("reserves token pricing against the requested output budget", () => {
    expect(nodeCostUsd(model("1m-tokens-io", "4"), { max_tokens: 4096 })).toBeCloseTo(0.016384);
  });
});
