/**
 * Auth helper for API routes and TanStack Start server functions.
 *
 * Reads the Better Auth / Neon Auth session cookie via TanStack Start's
 * server utilities to resolve the authenticated user on the server side.
 */

import { getRequestHeaders, getCookie } from "@tanstack/react-start/server";
import { sql } from "@/lib/db";

const SESSION_COOKIE = "__Secure-neon-auth.session_token";

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

export async function getRequestContext(sessionToken?: string): Promise<RequestContext> {
  console.log("[auth] getRequestContext called, sessionToken:", sessionToken ? sessionToken.slice(0, 12) + "..." : "UNDEFINED/EMPTY");
  // ── 1. Bearer API key (cx_…) ───────────────────────────────────────────
  const headers = getEventHeaders();
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
          console.log("[auth] resolved via API key, userId:", rows[0].user_id);
          return { userId: rows[0].user_id, apiKeyId: rows[0].id };
        }
      }
    }
  }

  // ── 2. Explicit session token from client ──────────────────────────────
  if (sessionToken) {
    console.log("[auth] trying explicit sessionToken...");
    const session = await resolveSessionFromToken(sessionToken);
    if (session) {
      console.log("[auth] resolved via explicit token, userId:", session.userId);
      return session;
    }
    console.log("[auth] explicit token NOT found in DB");
  } else {
    console.log("[auth] no explicit sessionToken provided, skipping step 2");
  }

  // ── 3. Cookie-based session (Better Auth / Neon Auth) ──────────────────
  const cookieToken = getSessionTokenFromCookie();
  if (cookieToken) {
    console.log("[auth] trying cookie token:", cookieToken.slice(0, 12) + "...");
    const session = await resolveSessionFromToken(cookieToken);
    if (session) {
      console.log("[auth] resolved via cookie, userId:", session.userId);
      return session;
    }
    console.log("[auth] cookie token NOT found in DB");
  } else {
    console.log("[auth] no cookie token found");
  }

  console.log("[auth] ALL AUTH METHODS FAILED — returning userId: null");
  return { userId: null, apiKeyId: null };
}

function getEventHeaders(): Headers | null {
  try {
    return getRequestHeaders();
  } catch {
    return null;
  }
}

function getSessionTokenFromCookie(): string | null {
  try {
    return getCookie(SESSION_COOKIE) ?? null;
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
    console.log("[auth] resolveSessionFromToken, token:", token.slice(0, 12) + "...");
    const rows = (await sql`
      SELECT u.email, u.name
      FROM neon_auth.session s
      JOIN neon_auth."user" u ON u.id = s."userId"
      WHERE s.token = ${token}
        AND s."expiresAt" > NOW()
      LIMIT 1
    `) as { email: string; name: string }[];

    console.log("[auth] Neon Auth lookup rows:", rows.length, rows.length > 0 ? rows[0] : "(none)");
    if (rows.length === 0) return null;

    // Upsert into local users table so app operations can reference the integer userId.
    console.log("[auth] upserting user into local users table:", rows[0].email);
    await sql`
      INSERT INTO users (email, display_name)
      VALUES (${rows[0].email}, ${rows[0].name ?? ""})
      ON CONFLICT (email) DO NOTHING
    `.catch((e) => console.error("[auth] upsert users FAILED:", e));

    const users = (await sql`
      SELECT id FROM users WHERE email = ${rows[0].email} LIMIT 1
    `) as { id: number }[];

    console.log("[auth] local users lookup:", users.length > 0 ? users[0] : "(none)");
    if (users.length === 0) return null;
    console.log("[auth] resolved userId:", users[0].id);
    return { userId: users[0].id, apiKeyId: null };
  } catch (err) {
    console.error("[auth] resolveSessionFromToken FAILED:", err);
    return null;
  }
}

export async function requireUserId(ctx: RequestContext): Promise<number> {
  console.log("[auth] requireUserId called, ctx:", ctx);
  if (ctx.userId == null) {
    console.error("[auth] requireUserId FAILED: userId is null");
    throw new HttpError(401, "Authentication required");
  }
  console.log("[auth] requireUserId OK, returning:", ctx.userId);
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
