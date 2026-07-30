/**
 * GET /v1/credits — Returns the available credit balance.
 *
 * Authentication: Bearer API key (cx_...) in Authorization header
 *
 * Response:
 *   credits: { amount: number, currency: string }
 */

import { defineEventHandler, getHeader, setResponseStatus } from "h3";
import { sql } from "@/lib/db";
import { sha256Hex } from "../../../src/lib/utils/crypto";

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

    // 2. Get balance
    const balanceRows = (await sql`
      SELECT credits_balance FROM users WHERE id = ${userId} LIMIT 1
    `) as { credits_balance: number }[];

    const balance = Number(balanceRows[0]?.credits_balance ?? 0);

    // 3. Return response
    return {
      credits: {
        amount: balance,
        currency: "USD",
      },
    };
  } catch (err) {
    console.error("[api/v1/credits]", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error" };
  }
});
