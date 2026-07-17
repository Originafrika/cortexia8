import { neon, Pool, neonConfig, type PoolClient } from "@neondatabase/serverless";

if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  // The dev pool can otherwise spew "WebSocket" warnings in TanStack
  // Start's Vite dev server. Keep it quiet.
  neonConfig.disableWarningInBrowsers = true;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // The rest of the system is meaningless without a DB. Fail loud at
  // module load time so we don't discover this on the first request.
  throw new Error("DATABASE_URL is not set");
}

/**
 * Stateless query function. One-shot HTTP calls, no transactions.
 * This is what the existing code already used.
 */
export const sql = neon(connectionString);

/**
 * Connection pool. Use when you need multi-statement transactions
 * (BEGIN / COMMIT / ROLLBACK) or want to share a connection.
 *
 * Example:
 *   const client = await pool.connect();
 *   try {
 *     await client.query("BEGIN");
 *     await client.query("INSERT …");
 *     await client.query("COMMIT");
 *   } catch (e) {
 *     await client.query("ROLLBACK");
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
export const pool = new Pool({ connectionString });

/** Re-export the PoolClient type so callers don't have to know the
 * underlying package directly. */
export type { PoolClient } from "@neondatabase/serverless";

/** Convenience helper: run a function inside a transaction. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // best-effort
    }
    throw err;
  } finally {
    client.release();
  }
}
