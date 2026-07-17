import { neon, Pool, neonConfig, type PoolClient } from "@neondatabase/serverless";

if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  neonConfig.disableWarningInBrowsers = true;
}

function getConnectionString(): string {
  const cs = process.env.DATABASE_URL;
  if (!cs) {
    throw new Error("DATABASE_URL is not set in environment variables. Add it in Vercel Dashboard → Settings → Environment Variables.");
  }
  return cs;
}

let _sql: ReturnType<typeof neon> | null = null;
let _pool: Pool | null = null;

function getSql() {
  if (!_sql) _sql = neon(getConnectionString());
  return _sql;
}

function getPool() {
  if (!_pool) _pool = new Pool({ connectionString: getConnectionString() });
  return _pool;
}

/**
 * Stateless query function proxy. Lazy-instantiates on first call so module
 * load does NOT crash when DATABASE_URL is absent.
 */
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_target, prop) {
    return Reflect.get(getSql() as object, prop);
  },
}) as unknown as ReturnType<typeof neon>;

/**
 * Connection pool proxy. Lazy-instantiates on first call.
 */
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    return Reflect.get(getPool() as object, prop);
  },
}) as unknown as Pool;

export type { PoolClient } from "@neondatabase/serverless";

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
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
