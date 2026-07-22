import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getBalance } from "@/lib/credits";
import { HttpError, toJsonResponse } from "./auth";

export type BalanceInput = {
  userId: number;
};

export type BalanceResponse = {
  balance: number;
};

export const getUserBalance = createServerFn({ method: "GET" })
  .validator((data: BalanceInput): BalanceInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (data.userId == null) throw new HttpError(400, "userId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const balance = await getBalance(data.userId);
      return { balance } as BalanceResponse;
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });

export type TxRow = {
  id: number;
  amount: number;
  type: string;
  reference: string | null;
  created_at: string;
};

export const getTransactionHistory = createServerFn({ method: "GET" })
  .validator((data: BalanceInput): BalanceInput => {
    if (!data || typeof data !== "object") throw new HttpError(400, "Invalid body");
    if (data.userId == null) throw new HttpError(400, "userId is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const rows = (await sql`
        SELECT id, amount, type, reference, created_at
        FROM credits_ledger
        WHERE user_id = ${data.userId}
        ORDER BY created_at DESC
        LIMIT 50
      `) as TxRow[];
      return { transactions: rows };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });
