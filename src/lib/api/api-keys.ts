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
  .validator((data: { name: string; scope?: string; sessionToken?: string }) => {
    if (!data?.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      throw new HttpError(400, "name is required");
    }
    return { name: data.name.trim(), scope: data.scope ?? "generate:*", sessionToken: data.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      console.log("[api-keys] createApiKey called, name:", data.name, "scope:", data.scope);
      const ctx = await getRequestContext(data.sessionToken);
      console.log("[api-keys] auth ctx:", ctx);
      if (ctx.userId == null) {
        throw new HttpError(401, "Authentication required");
      }
      // CSRF: This is a state-changing POST. TanStack Start server functions do not
      // expose raw request headers, so Origin/Referer validation is not possible here.
      // Primary CSRF defense: SameSite=Strict session cookies + SameSite=Strict API key cookies.
      // If headers become available, call validateOrigin(headers, allowedOrigins).

      // Generate a random API key: cx_live_<48 hex chars>
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      const rawKey = `cx_live_${hex}`;
      const prefix = rawKey.slice(0, 11); // cx_live_XXXX

      // Hash the key for storage (never store raw keys)
      const keyHash = await sha256Hex(rawKey);

      const rows = (await sql`
        INSERT INTO api_keys (user_id, key_hash, name, prefix, permissions, status)
        VALUES (${ctx.userId}, ${keyHash}, ${data.name}, ${prefix}, ${JSON.stringify([data.scope])}::jsonb, 'active')
        RETURNING id
      `) as { id: number }[];

      return {
        id: rows[0].id,
        name: data.name,
        prefix,
        rawKey,
      };
    } catch (err) {
      console.error("[api-keys] createApiKey FAILED:", err);
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });

// ── List API Keys ─────────────────────────────────────────────────────────

export type ApiKeyRow = {
  id: number;
  name: string;
  prefix: string;
  permissions: unknown;
  status: string;
  lastUsed: string;
  created_at: string;
};

export const listApiKeys = createServerFn({ method: "POST" })
  .validator((data: { sessionToken?: string }) => {
    if (data && typeof data !== "object") throw new HttpError(400, "Invalid body");
    return { sessionToken: data?.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      console.log("[api-keys] listApiKeys called, sessionToken:", data.sessionToken ? data.sessionToken.slice(0, 12) + "..." : "NONE");
      const ctx = await getRequestContext(data.sessionToken);
      console.log("[api-keys] auth ctx:", ctx);
      if (ctx.userId == null) {
        throw new HttpError(401, "Authentication required");
      }

      const rows = (await sql`
        SELECT id, name, prefix, permissions, status, last_used_at, created_at
        FROM api_keys
        WHERE user_id = ${ctx.userId}
        ORDER BY created_at DESC
      `) as {
        id: number;
        name: string;
        prefix: string;
        permissions: string;
        status: string;
        last_used_at: string | null;
        created_at: string;
      }[];

      console.log("[api-keys] found", rows.length, "keys");
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        prefix: r.prefix,
        permissions: r.permissions,
        status: r.status,
        lastUsed: r.last_used_at
          ? formatRelativeTime(new Date(r.last_used_at))
          : "jamais",
        created_at: r.created_at,
      }));
    } catch (err) {
      console.error("[api-keys] listApiKeys FAILED:", err);
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });

// ── Revoke API Key ────────────────────────────────────────────────────────

export const revokeApiKey = createServerFn({ method: "POST" })
  .validator((data: { keyId: number; sessionToken?: string }) => {
    if (!data?.keyId) throw new HttpError(400, "keyId is required");
    return { keyId: data.keyId, sessionToken: data.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      if (ctx.userId == null) {
        throw new HttpError(401, "Authentication required");
      }
      // CSRF: This is a state-changing POST. SameSite=Strict session cookies provide
      // the primary CSRF defense. If request headers become available in this runtime,
      // call validateOrigin(headers, allowedOrigins) here.

      await sql`
        UPDATE api_keys
        SET status = 'revoked'
        WHERE id = ${data.keyId} AND user_id = ${ctx.userId}
      `;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
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
