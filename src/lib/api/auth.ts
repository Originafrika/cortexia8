/**
 * Minimal auth helper for the API routes.
 *
 * The app uses Neon Auth (Better Auth). For MVP we accept a `userId`
 * coming either from a server-side request context (e.g. middleware
 * that decoded the session cookie) or, for the API-key flow, from a
 * header. Full session wiring lands in a later iteration; this stub
 * keeps the API callable today without inventing a fake auth model.
 */

import { sql } from "@/lib/db";

export type RequestContext = {
  userId: number | null;
  apiKeyId: number | null;
};

export async function getRequestContext(headers: Headers): Promise<RequestContext> {
  // 1. Bearer API key (cx_…)
  const auth = headers.get("authorization") ?? headers.get("Authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token.startsWith("cx_")) {
      const keyHash = await sha256Hex(token);
      const rows = (await sql`
        SELECT id, user_id FROM api_keys
        WHERE key_hash = ${keyHash} AND status = 'active'
        LIMIT 1
      `) as { user_id: number; id: number }[];
      if (rows.length > 0) {
        // Best-effort last_used_at bump; non-fatal if it fails.
        await sql`
          UPDATE api_keys SET last_used_at = NOW() WHERE id = ${rows[0].id}
        `.catch(() => undefined);
        return { userId: rows[0].user_id, apiKeyId: rows[0].id };
      }
    }
  }
  // 2. Cookie-based session — handled by Neon Auth's middleware in the
  //    React side. The server functions don't decode cookies yet; the
  //    client passes the userId explicitly when calling the API.
  return { userId: null, apiKeyId: null };
}

export async function requireUserId(ctx: RequestContext): Promise<number> {
  if (ctx.userId == null) {
    throw new HttpError(401, "Authentication required");
  }
  return ctx.userId;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function toJsonResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json(
      { error: err.message, detail: err.detail ?? null },
      { status: err.status },
    );
  }
  const message = err instanceof Error ? err.message : "Internal error";
  return Response.json({ error: message }, { status: 500 });
}

async function sha256Hex(s: string): Promise<string> {
  // Use Web Crypto (available in Vercel's Node 22 runtime).
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
