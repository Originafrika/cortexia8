import { Webhook } from "fedapay";
import { describe, expect, it } from "vitest";

describe("FedaPay webhook verification", () => {
  it("accepts a fresh SDK-generated signature", () => {
    const payload = JSON.stringify({ id: "evt_1", name: "transaction.approved" });
    const header = Webhook.generateTestHeaderString({
      payload,
      secret: "wh_test_secret",
      timestamp: Math.floor(Date.now() / 1000),
    });

    expect(Webhook.constructEvent(payload, header, "wh_test_secret")).toMatchObject({
      id: "evt_1",
      name: "transaction.approved",
    });
  });

  it("rejects a tampered payload", () => {
    const payload = JSON.stringify({ id: "evt_2", name: "transaction.approved" });
    const header = Webhook.generateTestHeaderString({
      payload,
      secret: "wh_test_secret",
      timestamp: Math.floor(Date.now() / 1000),
    });

    expect(() => Webhook.constructEvent(`${payload}.tampered`, header, "wh_test_secret")).toThrow();
  });
});
