import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getRequestContext, HttpError } from "./auth";

// ── Create API Key ────────────────────────────────────────────────────────

export type CreateKeyResult = {
  id: number;
  name: string;
  prefix: string;
  rawKey: string;
};

export const createApiKey = createServerFn({ method: "POST" })
  .validator((data: { name: string }) => {
    if (!data?.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      throw new HttpError(400, "name is required");
    }
    return { name: data.name.trim() };
  })
  .handler(async ({ data }) => {
    const ctx = await getRequestContext(new Headers());
    if (ctx.userId == null) {
      throw new HttpError(401, "Authentication required");
    }

    // Generate a random API key: cx_live_<48 hex chars>
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const rawKey = `cx_live_${hex}`;
    const prefix = rawKey.slice(0, 11); // cx_live_XXXX

    // Hash the key for storage (never store raw keys)
    const keyHash = await sha256Hex(rawKey);

    const rows = (await sql`
      INSERT INTO api_keys (user_id, key_hash, permissions, status)
      VALUES (${ctx.userId}, ${keyHash}, '["generate:*"]'::jsonb, 'active')
      RETURNING id
    `) as { id: number }[];

    return {
      id: rows[0].id,
      name: data.name,
      prefix,
      rawKey,
    };
  });

// ── List API Keys ─────────────────────────────────────────────────────────

export type ApiKeyRow = {
  id: number;
  name: string;
  prefix: string;
  permissions: string;
  status: string;
  last_used_at: string | null;
  created_at: string;
};

export const listApiKeys = createServerFn({ method: "GET" })
  .handler(async () => {
    const ctx = await getRequestContext(new Headers());
    if (ctx.userId == null) {
      throw new HttpError(401, "Authentication required");
    }

    const rows = (await sql`
      SELECT id, key_hash, permissions, status, last_used_at, created_at
      FROM api_keys
      WHERE user_id = ${ctx.userId}
      ORDER BY created_at DESC
    `) as {
      id: number;
      key_hash: string;
      permissions: string;
      status: string;
      last_used_at: string | null;
      created_at: string;
    }[];

    // We can't recover the raw key; show prefix from the hash (first 11 chars of hash)
    return rows.map((r) => ({
      id: r.id,
      name: `Clé #${r.id}`,
      prefix: r.key_hash.slice(0, 11),
      permissions: r.permissions,
      status: r.status,
      lastUsed: r.last_used_at
        ? formatRelativeTime(new Date(r.last_used_at))
        : "jamais",
      created_at: r.created_at,
    }));
  });

// ── Revoke API Key ────────────────────────────────────────────────────────

export const revokeApiKey = createServerFn({ method: "POST" })
  .validator((data: { keyId: number }) => {
    if (!data?.keyId) throw new HttpError(400, "keyId is required");
    return { keyId: data.keyId };
  })
  .handler(async ({ data }) => {
    const ctx = await getRequestContext(new Headers());
    if (ctx.userId == null) {
      throw new HttpError(401, "Authentication required");
    }

    await sql`
      UPDATE api_keys
      SET status = 'revoked'
      WHERE id = ${data.keyId} AND user_id = ${ctx.userId}
    `;
  });

// ── Helpers ───────────────────────────────────────────────────────────────

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD}j`;
}
