-- Fix grok-video-15 kieEndpoint: dot → hyphen (kie.ai expects grok-imagine-video-1-5-preview)
UPDATE models SET kie_endpoint = 'grok-imagine-video-1-5-preview' WHERE slug = 'grok-video-15';

-- Fix any remaining NULL api_family values (should be market_unified)
UPDATE models SET api_family = 'market_unified' WHERE api_family IS NULL;
