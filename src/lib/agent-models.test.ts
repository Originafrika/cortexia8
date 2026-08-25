import { describe, expect, it } from "vitest";
import { CATALOGUE } from "./models-data";
import { AGENT_MODELS, DEFAULT_AGENT_MODEL } from "./agent-models";

describe("agent model registry", () => {
  it("contains only active verified text models from the catalogue", () => {
    expect(AGENT_MODELS.length).toBeGreaterThan(0);
    for (const model of AGENT_MODELS) {
      const entry = CATALOGUE.find((candidate) => candidate.slug === model.value);
      expect(entry).toBeDefined();
      expect(entry?.active).toBe(true);
      expect(entry?.category).toBe("text");
      expect(entry?.fidelityStatus).toBe("fidele");
      expect(entry?.apiFamily).toMatch(/^chat_/);
    }
  });

  it("does not expose known unverified aliases", () => {
    const values = new Set(AGENT_MODELS.map((model) => model.value));
    expect(values.has("claude-fable-5")).toBe(false);
    expect(values.has("claude-sonnet-5")).toBe(false);
    expect(values.has("gpt-56-luna")).toBe(false);
    expect(values.has("gemini-3-pro")).toBe(false);
    expect(values.has("grok-43")).toBe(false);
  });

  it("uses a selectable model as the default", () => {
    expect(AGENT_MODELS.some((model) => model.value === DEFAULT_AGENT_MODEL)).toBe(true);
  });
});
