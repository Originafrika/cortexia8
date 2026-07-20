-- 0005 — add is_public_wall column to assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_public_wall BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS assets_public_wall_idx ON assets (is_public_wall) WHERE is_public_wall = TRUE;
