-- Fix Gemini market_unified kieEndpoint values to match kie.ai catalogue.
-- The catalogue paths are: market/gemini/gemini-2-5-pro, etc.
-- After stripping "market/", the correct kieEndpoint includes the "gemini/" prefix.

UPDATE models SET kie_endpoint = 'gemini/gemini-2-5-pro' WHERE slug = 'gemini-25-pro';
UPDATE models SET kie_endpoint = 'gemini/gemini-3-pro' WHERE slug = 'gemini-3-pro';
UPDATE models SET kie_endpoint = 'gemini/gemini-3-1-pro' WHERE slug = 'gemini-31-pro';
UPDATE models SET kie_endpoint = 'gemini/gemini-2-5-flash' WHERE slug = 'gemini-25-flash';
UPDATE models SET kie_endpoint = 'gemini/gemini-3-flash' WHERE slug = 'gemini-3-flash';
UPDATE models SET kie_endpoint = 'gemini/gemini-3-5-flash' WHERE slug = 'gemini-35-flash';
UPDATE models SET kie_endpoint = 'gemini/gemini-3-flash-v1beta' WHERE slug = 'gemini-3-flash-v1beta';
