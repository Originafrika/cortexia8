import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";

export const diagnoseAuth = createServerFn({ method: "GET" })
  .handler(async () => {
    const result: Record<string, unknown> = {};

    try {
      const schemas = (await sql`
        SELECT schema_name FROM information_schema.schemata
        ORDER BY schema_name
      `) as { schema_name: string }[];
      result.schemas = schemas.map((s) => s.schema_name);
    } catch (e) {
      result.schemaError = String(e);
    }

    try {
      const sessionCols = (await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'neon_auth' AND table_name = 'session'
        ORDER BY ordinal_position
      `) as { column_name: string; data_type: string }[];
      result.neonAuthSessionColumns = sessionCols;
    } catch (e) {
      result.sessionColError = String(e);
    }

    try {
      const userCols = (await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'neon_auth' AND table_name = 'user'
        ORDER BY ordinal_position
      `) as { column_name: string; data_type: string }[];
      result.neonAuthUserColumns = userCols;
    } catch (e) {
      result.userColError = String(e);
    }

    try {
      const count = (await sql`SELECT COUNT(*)::int AS cnt FROM neon_auth.session`) as { cnt: number }[];
      result.sessionCount = count[0]?.cnt ?? 0;
    } catch (e) {
      result.sessionCountError = String(e);
    }

    try {
      const sessions = (await sql`
        SELECT
          LEFT(token, 8) || '...' AS token_prefix,
          "userId",
          "expiresAt"
        FROM neon_auth.session
        LIMIT 3
      `) as { token_prefix: string; userId: string; expiresAt: Date }[];
      result.sampleSessions = sessions;
    } catch (e) {
      result.sampleSessionsError = String(e);
    }

    try {
      const localCols = (await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
      `) as { column_name: string; data_type: string }[];
      result.localUsersColumns = localCols;
    } catch (e) {
      result.localUsersError = String(e);
    }

    try {
      const count = (await sql`SELECT COUNT(*)::int AS cnt FROM users`) as { cnt: number }[];
      result.localUsersCount = count[0]?.cnt ?? 0;
    } catch (e) {
      result.localUsersCountError = String(e);
    }

    try {
      const testResult = (await sql`
        SELECT u.email, u.name
        FROM neon_auth.session s
        JOIN neon_auth."user" u ON u.id = s."userId"
        WHERE s.token = 'DOES_NOT_EXIST'
          AND s."expiresAt" > NOW()
        LIMIT 1
      `) as unknown[];
      result.testQueryWorks = true;
      result.testQueryRows = testResult.length;
    } catch (e) {
      result.testQueryError = String(e);
    }

    return result;
  });

// ---------------------------------------------------------------------------
// Migration endpoint — creates missing tables
// ---------------------------------------------------------------------------

export const runMigration = createServerFn({ method: "GET" })
  .handler(async () => {
    const results: string[] = [];

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          display_name TEXT,
          credits_balance NUMERIC(12, 6) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      results.push("users table: OK");
    } catch (e) {
      results.push(`users table: ${String(e)}`);
    }

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`;
      results.push("users.role column: OK");
    } catch (e) {
      results.push(`users.role column: ${String(e)}`);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS models (
          id SERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          provider TEXT NOT NULL,
          category TEXT NOT NULL,
          kie_endpoint TEXT NOT NULL UNIQUE,
          input_schema JSONB NOT NULL,
          default_params JSONB NOT NULL DEFAULT '{}',
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      results.push("models table: OK");
    } catch (e) {
      results.push(`models table: ${String(e)}`);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS workflows (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL DEFAULT 'Workflow sans titre',
          status TEXT NOT NULL DEFAULT 'idle',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      results.push("workflows table: OK");
    } catch (e) {
      results.push(`workflows table: ${String(e)}`);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS workflow_nodes (
          id SERIAL PRIMARY KEY,
          workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
          type TEXT NOT NULL DEFAULT 'model',
          model_slug TEXT NOT NULL,
          config JSONB NOT NULL DEFAULT '{}',
          canvas_x REAL NOT NULL DEFAULT 0,
          canvas_y REAL NOT NULL DEFAULT 0,
          canvas_width REAL NOT NULL DEFAULT 200,
          canvas_height REAL NOT NULL DEFAULT 120,
          status TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      results.push("workflow_nodes table: OK");
    } catch (e) {
      results.push(`workflow_nodes table: ${String(e)}`);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS workflow_edges (
          id SERIAL PRIMARY KEY,
          workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
          source_node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
          target_node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
          source_output_key TEXT NOT NULL DEFAULT 'output',
          target_input_key TEXT NOT NULL DEFAULT 'input',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      results.push("workflow_edges table: OK");
    } catch (e) {
      results.push(`workflow_edges table: ${String(e)}`);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS runs (
          id SERIAL PRIMARY KEY,
          workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'pending',
          started_at TIMESTAMP DEFAULT NOW(),
          finished_at TIMESTAMP,
          output JSONB,
          error TEXT
        )
      `;
      results.push("runs table: OK");
    } catch (e) {
      results.push(`runs table: ${String(e)}`);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS api_keys (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          key_hash TEXT NOT NULL UNIQUE,
          key_prefix TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          last_used_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      results.push("api_keys table: OK");
    } catch (e) {
      results.push(`api_keys table: ${String(e)}`);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS waitlist (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          referral_code TEXT,
          referred_by TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      results.push("waitlist table: OK");
    } catch (e) {
      results.push(`waitlist table: ${String(e)}`);
    }

    // Verify
    try {
      const count = (await sql`SELECT COUNT(*)::int AS cnt FROM users`) as { cnt: number }[];
      results.push(`users count: ${count[0]?.cnt}`);
    } catch (e) {
      results.push(`users verify: ${String(e)}`);
    }

    return results;
  });
