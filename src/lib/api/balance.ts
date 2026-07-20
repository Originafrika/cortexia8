import { createServerFn } from "@tanstack/react-start";
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
