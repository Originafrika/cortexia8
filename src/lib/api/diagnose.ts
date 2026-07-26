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
