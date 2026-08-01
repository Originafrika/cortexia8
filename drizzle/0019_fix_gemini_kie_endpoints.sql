-- Revert Gemini kieEndpoint to model names.
-- Gemini models use chat_openai: /${model}/v1/chat/completions
-- So kieEndpoint should be the model name (e.g. "gemini-3-flash"), not "gemini/gemini-3-flash".

UPDATE models SET kie_endpoint = 'gemini-2.5-pro' WHERE slug = 'gemini-25-pro';
UPDATE models SET kie_endpoint = 'gemini-3-pro' WHERE slug = 'gemini-3-pro';
UPDATE models SET kie_endpoint = 'gemini-3.1-pro' WHERE slug = 'gemini-31-pro';
UPDATE models SET kie_endpoint = 'gemini-2.5-flash' WHERE slug = 'gemini-25-flash';
UPDATE models SET kie_endpoint = 'gemini-3-flash' WHERE slug = 'gemini-3-flash';
UPDATE models SET kie_endpoint = 'gemini-3.5-flash' WHERE slug = 'gemini-35-flash';
UPDATE models SET kie_endpoint = 'gemini-3-flash-v1beta' WHERE slug = 'gemini-3-flash-v1beta';
