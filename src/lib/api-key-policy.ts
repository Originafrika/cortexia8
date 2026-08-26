export const API_KEY_SCOPES = [
  "generate:*",
  "generate:image",
  "generate:video",
  "generate:audio",
  "generate:text",
  "generate:music",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export function normalizeApiKeyPermissions(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function scopeAllowsCategory(permissions: readonly string[], category: string): boolean {
  return permissions.includes("generate:*") || permissions.includes(`generate:${category}`);
}
