-- 0001 — full schema (users, models catalog, workflows, runs, assets, ledger, api keys)
-- Replaces the partial 0001_create_models.sql. The `0000_create_waitlist.sql` migration
-- already created the waitlist table; we don't touch it here.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  credits_balance NUMERIC(12, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('image', 'video', 'audio', 'text', 'music')),
  kie_endpoint TEXT NOT NULL UNIQUE,
  input_schema JSONB NOT NULL,
  output_type TEXT NOT NULL,
  pricing_unit TEXT NOT NULL,
  provider_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  cortexia_price_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  fidelity_status TEXT NOT NULL DEFAULT 'generique' CHECK (fidelity_status IN ('fidele', 'generique')),
  supports_reference_upload BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS models_slug_idx ON models (slug);
CREATE UNIQUE INDEX IF NOT EXISTS models_endpoint_idx ON models (kie_endpoint);
CREATE INDEX IF NOT EXISTS models_category_idx ON models (category);
CREATE INDEX IF NOT EXISTS models_active_idx ON models (active);

CREATE TABLE IF NOT EXISTS workflows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS workflows_user_idx ON workflows (user_id);

CREATE TABLE IF NOT EXISTS workflow_nodes (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'model',
  model_slug TEXT NOT NULL REFERENCES models(slug),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  canvas_x TEXT NOT NULL DEFAULT '0',
  canvas_y TEXT NOT NULL DEFAULT '0',
  canvas_width TEXT NOT NULL DEFAULT '220',
  canvas_height TEXT NOT NULL DEFAULT '120'
);
CREATE INDEX IF NOT EXISTS workflow_nodes_workflow_idx ON workflow_nodes (workflow_id);

CREATE TABLE IF NOT EXISTS workflow_edges (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  source_node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  source_output_key TEXT NOT NULL DEFAULT 'out',
  target_node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  target_input_key TEXT NOT NULL DEFAULT 'in'
);
CREATE INDEX IF NOT EXISTS workflow_edges_workflow_idx ON workflow_edges (workflow_id);
CREATE INDEX IF NOT EXISTS workflow_edges_source_idx ON workflow_edges (source_node_id);
CREATE INDEX IF NOT EXISTS workflow_edges_target_idx ON workflow_edges (target_node_id);

CREATE TABLE IF NOT EXISTS runs (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP,
  total_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS runs_workflow_idx ON runs (workflow_id);
CREATE INDEX IF NOT EXISTS runs_user_idx ON runs (user_id);

CREATE TABLE IF NOT EXISTS run_node_executions (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  workflow_node_id INTEGER NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  kie_task_id TEXT,
  input_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_asset_id INTEGER,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS rne_run_idx ON run_node_executions (run_id);
CREATE INDEX IF NOT EXISTS rne_kie_task_idx ON run_node_executions (kie_task_id);
CREATE INDEX IF NOT EXISTS rne_status_idx ON run_node_executions (status);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  run_node_execution_id INTEGER REFERENCES run_node_executions(id) ON DELETE SET NULL,
  model_slug TEXT REFERENCES models(slug),
  type TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  preview_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS assets_user_idx ON assets (user_id);
CREATE INDEX IF NOT EXISTS assets_rne_idx ON assets (run_node_execution_id);
CREATE INDEX IF NOT EXISTS assets_type_idx ON assets (type);

CREATE TABLE IF NOT EXISTS credits_ledger (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 6) NOT NULL,
  type TEXT NOT NULL,
  reference TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS credits_ledger_user_idx ON credits_ledger (user_id);
CREATE INDEX IF NOT EXISTS credits_ledger_type_idx ON credits_ledger (type);

CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys (user_id);
