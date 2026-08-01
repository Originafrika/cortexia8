-- 0017: Set correct api_family for all chat/text models.
-- Previously all models were set to 'market_unified' which routes
-- through createTask — chat models need dedicated chat endpoints.
-- 'chat_google_native' was removed from codebase; Gemini uses OpenAI-compat.

-- Gemini (OpenAI-compatible endpoint: /${model}/v1/chat/completions)
UPDATE models SET api_family = 'chat_openai' WHERE slug IN (
  'gemini-25-pro', 'gemini-3-pro', 'gemini-31-pro',
  'gemini-25-flash', 'gemini-3-flash', 'gemini-35-flash',
  'gemini-3-flash-v1beta'
);

-- OpenAI-compatible (GPT, Gemini-OpenAI variants, Grok)
UPDATE models SET api_family = 'chat_openai' WHERE slug IN (
  'gpt-52', 'gpt-54', 'gpt-54-luna', 'gpt-54-terra', 'gpt-54-sol',
  'gpt-55', 'gpt-55-luna', 'gpt-55-terra', 'gpt-55-sol',
  'gpt-56-luna', 'gpt-56-terra', 'gpt-56-sol',
  'gpt-56-luna-resp', 'gpt-56-terra-resp', 'gpt-56-sol-resp',
  'gpt-codex',
  'gemini-25-pro-openai', 'gemini-3-pro-openai', 'gemini-31-pro-openai',
  'gemini-25-flash-openai', 'gemini-3-flash-openai', 'gemini-3-flash-v1beta-openai',
  'gemini-35-flash-openai',
  'grok-43', 'grok-45'
);

-- Anthropic (Claude)
UPDATE models SET api_family = 'chat_anthropic' WHERE slug IN (
  'claude-opus-47', 'claude-opus-48', 'claude-opus-45', 'claude-opus-46',
  'claude-sonnet-45', 'claude-sonnet-46', 'claude-sonnet-5',
  'claude-haiku-45', 'claude-fable-5'
);
