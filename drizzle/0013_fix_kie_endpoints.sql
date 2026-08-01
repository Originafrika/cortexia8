-- Fix kie_endpoint format: remove leading slash
-- kie.ai expects "grok-imagine/1-5-preview" not "/grok-imagine/1-5-preview"
UPDATE models SET kie_endpoint = REPLACE(kie_endpoint, '/', '') WHERE kie_endpoint LIKE '/%';
