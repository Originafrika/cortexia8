import { createHmac, timingSafeEqual } from "node:crypto";

export function createFedaPaySignatureHeader(
  payload: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000),
): string {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  return `t=${timestamp},s=${signature}`;
}

export function verifyFedaPayWebhookSignature(
  payload: string,
  header: string,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  const values = header.split(",").reduce(
    (result, item) => {
      const separator = item.indexOf("=");
      if (separator < 0) return result;
      const key = item.slice(0, separator).trim();
      const value = item.slice(separator + 1).trim();
      if (key === "t") result.timestamp = Number(value);
      if (key === "s" && value) result.signatures.push(value);
      return result;
    },
    { timestamp: Number.NaN, signatures: [] as string[] },
  );

  if (!Number.isFinite(values.timestamp) || values.signatures.length === 0) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - values.timestamp) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret)
    .update(`${values.timestamp}.${payload}`, "utf8")
    .digest("hex");
  const expectedBytes = Buffer.from(expected, "utf8");
  return values.signatures.some((signature) => {
    const candidate = Buffer.from(signature, "utf8");
    return candidate.length === expectedBytes.length && timingSafeEqual(candidate, expectedBytes);
  });
}
