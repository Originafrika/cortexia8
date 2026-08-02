import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import { getRequestContext, HttpError } from "./auth";

export type ApiStats = {
  callsThisMonth: number;
  costThisMonth: number;
  successRate: number;
};

export const getApiStats = createServerFn({ method: "POST" })
  .validator((data: { sessionToken?: string }) => {
    return { sessionToken: data?.sessionToken };
  })
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext(data.sessionToken);
      if (ctx.userId == null) {
        throw new HttpError(401, "Authentication required");
      }

      const callsRows = (await sql`
        SELECT COUNT(*)::int as count
        FROM run_node_executions rne
        JOIN runs r ON r.id = rne.run_id
        WHERE r.user_id = ${ctx.userId}
          AND rne.created_at >= date_trunc('month', NOW())
      `) as { count: number }[];

      const costRows = (await sql`
        SELECT COALESCE(SUM(rne.cost_usd), 0)::float as total
        FROM run_node_executions rne
        JOIN runs r ON r.id = rne.run_id
        WHERE r.user_id = ${ctx.userId}
          AND rne.created_at >= date_trunc('month', NOW())
      `) as { total: number }[];

      const rateRows = (await sql`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE rne.status = 'succeeded')::int as succeeded
        FROM run_node_executions rne
        JOIN runs r ON r.id = rne.run_id
        WHERE r.user_id = ${ctx.userId}
          AND rne.created_at >= date_trunc('month', NOW())
      `) as { total: number; succeeded: number }[];

      const total = rateRows[0]?.total ?? 0;
      const succeeded = rateRows[0]?.succeeded ?? 0;

      return {
        callsThisMonth: callsRows[0]?.count ?? 0,
        costThisMonth: costRows[0]?.total ?? 0,
        successRate: total > 0 ? Math.round((succeeded / total) * 100) : 0,
      };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });
