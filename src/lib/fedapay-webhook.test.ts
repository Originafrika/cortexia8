import { describe, expect, it } from "vitest";
import { createFedaPaySignatureHeader, verifyFedaPayWebhookSignature } from "./fedapay-webhook";

describe("FedaPay webhook verification", () => {
  it("accepts a fresh HMAC signature", () => {
    const payload = JSON.stringify({ id: "evt_1", name: "transaction.approved" });
    const header = createFedaPaySignatureHeader(
      payload,
      "wh_test_secret",
      Math.floor(Date.now() / 1000),
    );

    expect(verifyFedaPayWebhookSignature(payload, header, "wh_test_secret")).toBe(true);
  });

  it("rejects tampered or stale signatures", () => {
    const payload = JSON.stringify({ id: "evt_2", name: "transaction.approved" });
    const header = createFedaPaySignatureHeader(
      payload,
      "wh_test_secret",
      Math.floor(Date.now() / 1000),
    );

    expect(verifyFedaPayWebhookSignature(`${payload}.tampered`, header, "wh_test_secret")).toBe(
      false,
    );
    expect(
      verifyFedaPayWebhookSignature(
        payload,
        createFedaPaySignatureHeader(
          payload,
          "wh_test_secret",
          Math.floor(Date.now() / 1000) - 301,
        ),
        "wh_test_secret",
      ),
    ).toBe(false);
  });
});
