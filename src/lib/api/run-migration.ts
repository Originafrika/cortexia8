import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";

export const runMigration = createServerFn({ method: "GET" })
  .handler(async () => {
    const results: string[] = [];

    // 1. credits_ledger table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS credits_ledger (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount NUMERIC(12, 6) NOT NULL,
          type TEXT NOT NULL,
          reference TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS credits_ledger_user_idx ON credits_ledger (user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS credits_ledger_type_idx ON credits_ledger (type)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS credits_ledger_reference_unique_idx ON credits_ledger (reference) WHERE reference IS NOT NULL`;
      results.push("credits_ledger: OK");
    } catch (e) {
      results.push(`credits_ledger: ${String(e)}`);
    }

    // 2. payment_transactions table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS payment_transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL,
          provider_transaction_id TEXT NOT NULL,
          amount_local NUMERIC(12, 6) NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          amount_usd_credited NUMERIC(12, 6) NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS payment_transactions_user_idx ON payment_transactions (user_id)`;
      results.push("payment_transactions: OK");
    } catch (e) {
      results.push(`payment_transactions: ${String(e)}`);
    }

    // 3. assets table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS assets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          run_node_execution_id INTEGER REFERENCES run_node_executions(id) ON DELETE SET NULL,
          model_slug TEXT NOT NULL,
          type TEXT NOT NULL,
          storage_url TEXT NOT NULL,
          preview_url TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS assets_user_idx ON assets (user_id)`;
      results.push("assets: OK");
    } catch (e) {
      results.push(`assets: ${String(e)}`);
    }

    // 4. runs table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS runs (
          id SERIAL PRIMARY KEY,
          workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          started_at TIMESTAMP DEFAULT NOW() NOT NULL,
          completed_at TIMESTAMP,
          total_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS runs_workflow_idx ON runs (workflow_id)`;
      await sql`CREATE INDEX IF NOT EXISTS runs_user_idx ON runs (user_id)`;
      results.push("runs: OK");
    } catch (e) {
      results.push(`runs: ${String(e)}`);
    }

    // 5. run_node_executions table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS run_node_executions (
          id SERIAL PRIMARY KEY,
          run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
          workflow_node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'queued',
          kie_task_id TEXT,
          input_params JSONB,
          output_asset_id INTEGER REFERENCES assets(id),
          error_message TEXT,
          started_at TIMESTAMP DEFAULT NOW() NOT NULL,
          completed_at TIMESTAMP,
          cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS rne_run_idx ON run_node_executions (run_id)`;
      await sql`CREATE INDEX IF NOT EXISTS rne_task_idx ON run_node_executions (kie_task_id)`;
      await sql`CREATE INDEX IF NOT EXISTS rne_status_idx ON run_node_executions (status)`;
      results.push("run_node_executions: OK");
    } catch (e) {
      results.push(`run_node_executions: ${String(e)}`);
    }

    // 6. api_keys table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS api_keys (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL DEFAULT '',
          key_hash TEXT NOT NULL UNIQUE,
          prefix TEXT NOT NULL DEFAULT '',
          permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
          status TEXT NOT NULL DEFAULT 'active',
          last_used_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys (user_id)`;
      results.push("api_keys: OK");
    } catch (e) {
      results.push(`api_keys: ${String(e)}`);
    }

    return results;
  });
