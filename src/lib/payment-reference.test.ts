import { describe, expect, it } from "vitest";
import { makePaymentReference } from "./payment-reference";

describe("makePaymentReference", () => {
  it("is deterministic for the same user and idempotency key", () => {
    expect(makePaymentReference(42, "checkout-abc-123")).toBe("cx-42-checkout-abc-123");
    expect(makePaymentReference(42, "checkout-abc-123")).toBe("cx-42-checkout-abc-123");
  });

  it("scopes identical client keys to different users", () => {
    expect(makePaymentReference(42, "same-key")).not.toBe(makePaymentReference(43, "same-key"));
  });

  it("normalizes unsafe characters and bounds the key portion", () => {
    const reference = makePaymentReference(42, "a/b?c" + "x".repeat(200));
    expect(reference).toMatch(/^cx-42-a-b-cx+$/);
    expect(reference.length).toBeLessThanOrEqual(86);
  });
});
