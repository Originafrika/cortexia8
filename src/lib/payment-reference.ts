export function makePaymentReference(userId: number, idempotencyKey: string): string {
  const normalized = idempotencyKey.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
  return `cx-${userId}-${normalized || Date.now().toString(36)}`;
}
