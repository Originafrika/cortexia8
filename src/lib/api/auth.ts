/**
 * Auth helper for API routes and TanStack Start server functions.
 *
 * Reads the Better Auth / Neon Auth session cookie via h3's getEvent()
 * to resolve the authenticated user on the server side.
 */

import { getEvent } from "h3";
import { sql } from "@/lib/db";

const SESSION_COOKIE = "better-auth.session_token";

export type RequestContext = {
  userId: number | null;
  apiKeyId: number | null;
};

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const i = pair.indexOf("=");
    if (i < 0) continue;
    const key = pair.slice(0, i).trim();
    const val = pair.slice(i + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

export async function getRequestContext(_headers?: Headers): Promise<RequestContext> {
  // ── 1. Bearer API key (cx_…) ───────────────────────────────────────────
  const headers = _headers ?? getEventHeaders();
  if (headers) {
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
          await sql`
            UPDATE api_keys SET last_used_at = NOW() WHERE id = ${rows[0].id}
          `.catch(() => undefined);
          return { userId: rows[0].user_id, apiKeyId: rows[0].id };
        }
      }
    }
  }

  // ── 2. Cookie-based session (Better Auth / Neon Auth) ──────────────────
  const cookieToken = getSessionTokenFromCookie();
  if (cookieToken) {
    const session = await resolveSessionFromToken(cookieToken);
    if (session) return session;
  }

  return { userId: null, apiKeyId: null };
}

function getEventHeaders(): Headers | null {
  try {
    const event = getEvent();
    const raw = event.node.req.headers;
    const h = new Headers();
    for (const [k, v] of Object.entries(raw)) {
      if (v != null) h.set(k, Array.isArray(v) ? v.join(", ") : v);
    }
    return h;
  } catch {
    return null;
  }
}

function getSessionTokenFromCookie(): string | null {
  try {
    const event = getEvent();
    const raw = event.node.req.headers.cookie;
    if (!raw) return null;
    const cookies = parseCookies(raw);
    return cookies[SESSION_COOKIE] ?? null;
  } catch {
    return null;
  }
}

/**
 * Look up the Better Auth session token in the `session` / `user` tables
 * managed by Neon Auth, then join with the local `users` table by email
 * to obtain the integer userId used throughout the app.
 */
async function resolveSessionFromToken(
  token: string,
): Promise<RequestContext | null> {
  try {
    const rows = (await sql`
      SELECT u.email
      FROM session s
      JOIN "user" u ON u.id = s.user_id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
      LIMIT 1
    `) as { email: string }[];

    if (rows.length === 0) return null;

    const users = (await sql`
      SELECT id FROM users WHERE email = ${rows[0].email} LIMIT 1
    `) as { id: number }[];

    if (users.length === 0) return null;
    return { userId: users[0].id, apiKeyId: null };
  } catch {
    return null;
  }
}

export async function requireUserId(ctx: RequestContext): Promise<number> {
  if (ctx.userId == null) {
    throw new HttpError(401, "Authentication required");
  }
  return ctx.userId;
}

/**
 * Validate the Origin/Referer header against a list of allowed origins
 * to prevent CSRF attacks on state-changing POST endpoints.
 */
export function validateOrigin(headers: Headers, allowedOrigins: string[]): void {
  const origin = headers.get("origin") ?? headers.get("referer");
  if (!origin || !allowedOrigins.some((o) => origin.startsWith(o))) {
    throw new HttpError(403, "Invalid origin");
  }
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
