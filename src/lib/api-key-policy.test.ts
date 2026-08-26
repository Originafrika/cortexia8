import { describe, expect, it } from "vitest";
import { API_KEY_SCOPES, normalizeApiKeyPermissions, scopeAllowsCategory } from "./api-key-policy";

describe("API key policy", () => {
  it("publishes the full set of generation scopes", () => {
    expect(API_KEY_SCOPES).toEqual([
      "generate:*",
      "generate:image",
      "generate:video",
      "generate:audio",
      "generate:text",
      "generate:music",
    ]);
  });

  it("allows every category with the wildcard scope", () => {
    expect(scopeAllowsCategory(["generate:*"], "image")).toBe(true);
    expect(scopeAllowsCategory(["generate:*"], "text")).toBe(true);
    expect(scopeAllowsCategory(["generate:*"], "music")).toBe(true);
  });

  it("limits a category-scoped key to its category", () => {
    expect(scopeAllowsCategory(["generate:image"], "image")).toBe(true);
    expect(scopeAllowsCategory(["generate:image"], "video")).toBe(false);
  });

  it("normalizes array and JSON permissions without trusting malformed values", () => {
    expect(normalizeApiKeyPermissions(["generate:text"])).toEqual(["generate:text"]);
    expect(normalizeApiKeyPermissions('["generate:music"]')).toEqual(["generate:music"]);
    expect(normalizeApiKeyPermissions("not-json")).toEqual([]);
    expect(normalizeApiKeyPermissions({ scope: "generate:*" })).toEqual([]);
  });
});
