-- Add api_family column to models table
-- This column is used by generate.ts to route to the correct kie.ai API family
ALTER TABLE models ADD COLUMN IF NOT EXISTS api_family TEXT;

-- Populate with default value for existing rows
UPDATE models SET api_family = 'market_unified' WHERE api_family IS NULL;
