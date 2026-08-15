/**
 * GET /v1/credits/transactions — Returns paginated credit transaction history.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Query params:
 *   limit: number (optional, default 20, max 100)
 *   offset: number (optional, default 0)
 *
 * Response:
 *   data: Array of credit transactions
 *   has_more: boolean
 *   total: number
 */

import { defineEventHandler, getHeader, getQuery, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../../src/lib/utils/crypto";

export default defineEventHandler(async (event) => {
  try {
    // 1. Authenticate via Bearer API key
    const auth = getHeader(event, "authorization");
    if (!auth?.startsWith("Bearer cx_")) {
      setResponseStatus(event, 401);
      return { error: "Invalid API key format. Use: Authorization: Bearer cx_..." };
    }
    const token = auth.slice(7);
    const keyHash = await sha256Hex(token);

    const keyRows = (await sql`
      SELECT id, user_id FROM api_keys
      WHERE key_hash = ${keyHash} AND status = 'active'
      LIMIT 1
    `) as { id: number; user_id: number }[];

    if (keyRows.length === 0) {
      setResponseStatus(event, 401);
      return { error: "Invalid or inactive API key" };
    }

    const userId = keyRows[0].user_id;

    // 2. Parse query params
    const query = getQuery(event);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);

    // 3. Get total count
    const countRows = (await sql`
      SELECT COUNT(*)::int as count FROM credits_ledger WHERE user_id = ${userId}
    `) as { count: number }[];
    const total = countRows[0]?.count ?? 0;

    // 4. Get transactions
    const rows = (await sql`
      SELECT id, amount, type, reference, created_at
      FROM credits_ledger
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as {
      id: number;
      amount: number;
      type: string;
      reference: string | null;
      created_at: string;
    }[];

    // 5. Map to API response format
    const data = rows.map((r) => ({
      id: `txn_${r.id}`,
      object: "credit_transaction",
      type: r.type === "usage" ? "charge" : r.type === "purchase" ? "topup" : r.type,
      amount: Number(r.amount),
      currency: "USD",
      description: r.reference ?? r.type,
      created_at: new Date(r.created_at).toISOString(),
    }));

    // 6. Return response
    return {
      data,
      has_more: offset + limit < total,
      total,
    };
  } catch (err) {
    console.error("[api/v1/credits/transactions]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
