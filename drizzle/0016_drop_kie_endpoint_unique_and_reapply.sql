-- Migration 0016: Drop UNIQUE constraint on kie_endpoint + re-apply 0015 safely
-- The UNIQUE constraint prevented models that share a kie.ai endpoint
-- (e.g. OpenAI-compatible vs native variants) from coexisting.

-- 1. Drop the UNIQUE constraint (column-level) and the redundant index
ALTER TABLE models DROP CONSTRAINT IF EXISTS models_kie_endpoint_key;
DROP INDEX IF EXISTS models_endpoint_idx;

-- 2. Re-apply all kieEndpoint fixes from migration 0015 (now safe)

-- IMAGE MODELS
UPDATE models SET kie_endpoint = 'seedream/4.5-text-to-image' WHERE slug = 'seedream-45';
UPDATE models SET kie_endpoint = 'seedream/4.5-edit' WHERE slug = 'seedream-45-edit';
UPDATE models SET kie_endpoint = 'z-image' WHERE slug = 'z-image';
UPDATE models SET kie_endpoint = 'nano-banana-pro' WHERE slug = 'nano-banana-pro';
UPDATE models SET kie_endpoint = 'nano-banana-2' WHERE slug = 'nano-banana-2';
UPDATE models SET kie_endpoint = 'flux-2/pro-text-to-image' WHERE slug = 'flux2-pro';
UPDATE models SET kie_endpoint = 'flux-2/pro-image-to-image' WHERE slug = 'flux2-pro-edit';
UPDATE models SET kie_endpoint = 'flux-2/flex-text-to-image' WHERE slug = 'flux2-flex';
UPDATE models SET kie_endpoint = 'flux-2/flex-image-to-image' WHERE slug = 'flux2-flex-edit';
UPDATE models SET kie_endpoint = 'gpt-image/1.5-text-to-image' WHERE slug = 'gpt-image-15';
UPDATE models SET kie_endpoint = 'gpt-image/1.5-image-to-image' WHERE slug = 'gpt-image-15-edit';
UPDATE models SET kie_endpoint = 'gpt-image-2-text-to-image' WHERE slug = 'gpt-image-2';
UPDATE models SET kie_endpoint = 'gpt-image-2-image-to-image' WHERE slug = 'gpt-image-2-edit';

-- VIDEO MODELS
UPDATE models SET kie_endpoint = 'kling-2.6/text-to-video' WHERE slug = 'kling-3-standard';
UPDATE models SET kie_endpoint = 'kling-2.6/image-to-video' WHERE slug = 'kling-i2v';
UPDATE models SET kie_endpoint = 'kling/v2-5-turbo-text-to-video-pro' WHERE slug = 'kling-v25-turbo-t2v-pro';
UPDATE models SET kie_endpoint = 'kling/v2-1-master-image-to-video' WHERE slug = 'kling-v25-turbo-i2v-pro';
UPDATE models SET kie_endpoint = 'kling-2.6/motion-control' WHERE slug = 'kling-motion-control';
UPDATE models SET kie_endpoint = 'kling-3.0/motion-control' WHERE slug = 'kling-3-motion';
UPDATE models SET kie_endpoint = 'kling-3.0/video' WHERE slug = 'kling-3';
UPDATE models SET kie_endpoint = 'kling-3.0/video' WHERE slug = 'kling-3-4k';
UPDATE models SET kie_endpoint = 'kling-3.0/video' WHERE slug = 'kling-3-i2v';
UPDATE models SET kie_endpoint = 'bytedance/seedance-2-5' WHERE slug = 'seedance-2-mini';
UPDATE models SET kie_endpoint = 'bytedance/seedance-1.5-pro' WHERE slug = 'seedance-15-pro';
UPDATE models SET kie_endpoint = 'bytedance/seedance-2' WHERE slug = 'seedance-2-i2v';
UPDATE models SET kie_endpoint = 'hailuo/2-3-image-to-video-pro' WHERE slug = 'hailuo-23-t2v-pro';
UPDATE models SET kie_endpoint = 'hailuo/2-3-image-to-video-standard' WHERE slug = 'hailuo-23-t2v-std';
UPDATE models SET kie_endpoint = 'sora-2-text-to-video' WHERE slug = 'sora2';
UPDATE models SET kie_endpoint = 'sora-2-image-to-video' WHERE slug = 'sora2-i2v';
UPDATE models SET kie_endpoint = 'sora-2-pro-text-to-video' WHERE slug = 'sora2-pro-t2v';
UPDATE models SET kie_endpoint = 'sora-2-pro-image-to-video' WHERE slug = 'sora2-pro-i2v';
UPDATE models SET kie_endpoint = 'sora-watermark-remover' WHERE slug = 'sora2-watermark-remover';
UPDATE models SET kie_endpoint = 'sora-2-pro-storyboard' WHERE slug = 'sora2-storyboard';
UPDATE models SET kie_endpoint = 'sora-2-characters' WHERE slug = 'sora2-characters';
UPDATE models SET kie_endpoint = 'sora-2-characters-pro' WHERE slug = 'sora2-characters-pro';
UPDATE models SET kie_endpoint = 'aleph/generate' WHERE slug = 'aleph-video';
UPDATE models SET kie_endpoint = 'veo3' WHERE slug = 'veo31-video';

-- CHAT MODELS (OpenAI-compatible)
UPDATE models SET kie_endpoint = 'gpt-5-2' WHERE slug = 'gpt-52';
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55';
UPDATE models SET kie_endpoint = 'gpt-5-6-luna' WHERE slug = 'gpt-56-luna';
UPDATE models SET kie_endpoint = 'gpt-5-6-terra' WHERE slug = 'gpt-56-terra';
UPDATE models SET kie_endpoint = 'gpt-5-6-sol' WHERE slug = 'gpt-56-sol';
UPDATE models SET kie_endpoint = 'gpt-5-codex' WHERE slug = 'gpt-codex';

-- CHAT MODELS (Response) — same kie_endpoint as chat variants, different api_family
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54-luna';
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54-terra';
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54-sol';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55-luna';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55-terra';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55-sol';
UPDATE models SET kie_endpoint = 'gpt-5-6-luna' WHERE slug = 'gpt-56-luna-resp';
UPDATE models SET kie_endpoint = 'gpt-5-6-terra' WHERE slug = 'gpt-56-terra-resp';
UPDATE models SET kie_endpoint = 'gpt-5-6-sol' WHERE slug = 'gpt-56-sol-resp';

-- CHAT MODELS (Anthropic)
UPDATE models SET kie_endpoint = 'claude-opus-4-7' WHERE slug = 'claude-opus-47';
UPDATE models SET kie_endpoint = 'claude-opus-4-8' WHERE slug = 'claude-opus-48';
UPDATE models SET kie_endpoint = 'claude-fable-5' WHERE slug = 'claude-fable-5';
UPDATE models SET kie_endpoint = 'claude-sonnet-5' WHERE slug = 'claude-sonnet-5';
UPDATE models SET kie_endpoint = 'claude-haiku-4-5' WHERE slug = 'claude-haiku-45';
UPDATE models SET kie_endpoint = 'claude-opus-4-5' WHERE slug = 'claude-opus-45';
UPDATE models SET kie_endpoint = 'claude-opus-4-6' WHERE slug = 'claude-opus-46';
UPDATE models SET kie_endpoint = 'claude-sonnet-4-5' WHERE slug = 'claude-sonnet-45';
UPDATE models SET kie_endpoint = 'claude-sonnet-4-6' WHERE slug = 'claude-sonnet-46';

-- CHAT MODELS (Google) — OpenAI-compatible and native share kie_endpoint
UPDATE models SET kie_endpoint = 'gemini-2.5-pro' WHERE slug = 'gemini-25-pro';
UPDATE models SET kie_endpoint = 'gemini-3-pro' WHERE slug = 'gemini-3-pro';
UPDATE models SET kie_endpoint = 'gemini-3.1-pro' WHERE slug = 'gemini-31-pro';
UPDATE models SET kie_endpoint = 'gemini-2.5-flash' WHERE slug = 'gemini-25-flash';
UPDATE models SET kie_endpoint = 'gemini-3-flash' WHERE slug = 'gemini-3-flash';
UPDATE models SET kie_endpoint = 'gemini-3.5-flash' WHERE slug = 'gemini-35-flash';
UPDATE models SET kie_endpoint = 'gemini-3.5-flash-openai' WHERE slug = 'gemini-35-flash-openai';
UPDATE models SET kie_endpoint = 'gemini-3-flash-v1beta' WHERE slug = 'gemini-3-flash-v1beta';

-- Gemini TTS
UPDATE models SET kie_endpoint = 'gemini-3.1-flash-tts' WHERE slug = 'gemini-31-flash-tts';
UPDATE models SET kie_endpoint = 'gemini-2.5-pro-tts' WHERE slug = 'gemini-25-pro-tts';

-- Gemini OpenAI-compatible variants (same kie_endpoint, different api_family)
UPDATE models SET kie_endpoint = 'gemini-2.5-pro' WHERE slug = 'gemini-25-pro-openai';
UPDATE models SET kie_endpoint = 'gemini-3-pro' WHERE slug = 'gemini-3-pro-openai';
UPDATE models SET kie_endpoint = 'gemini-3.1-pro' WHERE slug = 'gemini-31-pro-openai';
UPDATE models SET kie_endpoint = 'gemini-2.5-flash' WHERE slug = 'gemini-25-flash-openai';
UPDATE models SET kie_endpoint = 'gemini-3-flash' WHERE slug = 'gemini-3-flash-openai';
UPDATE models SET kie_endpoint = 'gemini-3-flash-v1beta' WHERE slug = 'gemini-3-flash-v1beta-openai';

-- CHAT MODELS (Grok)
UPDATE models SET kie_endpoint = 'grok-4.3' WHERE slug = 'grok-43';
UPDATE models SET kie_endpoint = 'grok-4.5' WHERE slug = 'grok-45';

-- Ensure all models have api_family set
UPDATE models SET api_family = 'market_unified' WHERE api_family IS NULL;
