-- Migration 0015: Fix all kieEndpoint values to match kie.ai catalogue
-- Source: kie.ai Apidog export (docs_kie_ai_copy_Apidog.json)
-- Only updates models where the current kie_endpoint differs from the catalogue value.

-- ═══════════════════════════════════════════════════════════════
-- IMAGE MODELS
-- ═══════════════════════════════════════════════════════════════

-- Seedream 4.5: dot not hyphen
UPDATE models SET kie_endpoint = 'seedream/4.5-text-to-image' WHERE slug = 'seedream-45';
UPDATE models SET kie_endpoint = 'seedream/4.5-edit' WHERE slug = 'seedream-45-edit';

-- Z-Image: no extra /z-image suffix
UPDATE models SET kie_endpoint = 'z-image' WHERE slug = 'z-image';

-- Nano Banana Pro: no google/ prefix
UPDATE models SET kie_endpoint = 'nano-banana-pro' WHERE slug = 'nano-banana-pro';

-- Nano Banana 2: missing hyphens
UPDATE models SET kie_endpoint = 'nano-banana-2' WHERE slug = 'nano-banana-2';

-- Flux-2: missing hyphen in prefix
UPDATE models SET kie_endpoint = 'flux-2/pro-text-to-image' WHERE slug = 'flux2-pro';
UPDATE models SET kie_endpoint = 'flux-2/pro-image-to-image' WHERE slug = 'flux2-pro-edit';
UPDATE models SET kie_endpoint = 'flux-2/flex-text-to-image' WHERE slug = 'flux2-flex';
UPDATE models SET kie_endpoint = 'flux-2/flex-image-to-image' WHERE slug = 'flux2-flex-edit';

-- GPT Image 1.5: dot not hyphen
UPDATE models SET kie_endpoint = 'gpt-image/1.5-text-to-image' WHERE slug = 'gpt-image-15';
UPDATE models SET kie_endpoint = 'gpt-image/1.5-image-to-image' WHERE slug = 'gpt-image-15-edit';

-- GPT Image 2: no extra gpt/ prefix
UPDATE models SET kie_endpoint = 'gpt-image-2-text-to-image' WHERE slug = 'gpt-image-2';
UPDATE models SET kie_endpoint = 'gpt-image-2-image-to-image' WHERE slug = 'gpt-image-2-edit';

-- ═══════════════════════════════════════════════════════════════
-- VIDEO MODELS
-- ═══════════════════════════════════════════════════════════════

-- Kling 2.6: missing version prefix
UPDATE models SET kie_endpoint = 'kling-2.6/text-to-video' WHERE slug = 'kling-3-standard';
UPDATE models SET kie_endpoint = 'kling-2.6/image-to-video' WHERE slug = 'kling-i2v';

-- Kling V2.5 Turbo: missing dash in version
UPDATE models SET kie_endpoint = 'kling/v2-5-turbo-text-to-video-pro' WHERE slug = 'kling-v25-turbo-t2v-pro';
UPDATE models SET kie_endpoint = 'kling/v2-1-master-image-to-video' WHERE slug = 'kling-v25-turbo-i2v-pro';

-- Kling motion control: missing version
UPDATE models SET kie_endpoint = 'kling-2.6/motion-control' WHERE slug = 'kling-motion-control';

-- Kling 3.0 motion control: wrong format
UPDATE models SET kie_endpoint = 'kling-3.0/motion-control' WHERE slug = 'kling-3-motion';

-- Kling 3.0: redundant kling- prefix
UPDATE models SET kie_endpoint = 'kling-3.0/video' WHERE slug = 'kling-3';

-- Kling 3.0 4K: likely same model as kling-3 but 4K mode (keep as-is if it exists, otherwise fix)
UPDATE models SET kie_endpoint = 'kling-3.0/video' WHERE slug = 'kling-3-4k';

-- Kling 3.0 i2v: not a separate endpoint in catalogue
UPDATE models SET kie_endpoint = 'kling-3.0/video' WHERE slug = 'kling-3-i2v';

-- Bytedance Seedance 2.5: wrong model name (was "mini")
UPDATE models SET kie_endpoint = 'bytedance/seedance-2-5' WHERE slug = 'seedance-2-mini';

-- Bytedance Seedance 1.5 Pro: dot not hyphen
UPDATE models SET kie_endpoint = 'bytedance/seedance-1.5-pro' WHERE slug = 'seedance-15-pro';

-- Bytedance Seedance 2.0 Image-to-Video: not a separate endpoint
UPDATE models SET kie_endpoint = 'bytedance/seedance-2' WHERE slug = 'seedance-2-i2v';

-- Hailuo 2.3: no text-to-video variants in catalogue (only image-to-video)
UPDATE models SET kie_endpoint = 'hailuo/2-3-image-to-video-pro' WHERE slug = 'hailuo-23-t2v-pro';
UPDATE models SET kie_endpoint = 'hailuo/2-3-image-to-video-standard' WHERE slug = 'hailuo-23-t2v-std';

-- Sora2: missing version prefix
UPDATE models SET kie_endpoint = 'sora-2-text-to-video' WHERE slug = 'sora2';
UPDATE models SET kie_endpoint = 'sora-2-image-to-video' WHERE slug = 'sora2-i2v';
UPDATE models SET kie_endpoint = 'sora-2-pro-text-to-video' WHERE slug = 'sora2-pro-t2v';
UPDATE models SET kie_endpoint = 'sora-2-pro-image-to-video' WHERE slug = 'sora2-pro-i2v';
UPDATE models SET kie_endpoint = 'sora-watermark-remover' WHERE slug = 'sora2-watermark-remover';
UPDATE models SET kie_endpoint = 'sora-2-pro-storyboard' WHERE slug = 'sora2-storyboard';
UPDATE models SET kie_endpoint = 'sora-2-characters' WHERE slug = 'sora2-characters';
UPDATE models SET kie_endpoint = 'sora-2-characters-pro' WHERE slug = 'sora2-characters-pro';

-- Aleph: catalogue says POST /api/v1/aleph/generate with no model param
-- The kieEndpoint for dedicated models is the endpoint path, not a model name
UPDATE models SET kie_endpoint = 'aleph/generate' WHERE slug = 'aleph-video';

-- Veo3.1: catalogue says model=veo3
UPDATE models SET kie_endpoint = 'veo3' WHERE slug = 'veo31-video';

-- ═══════════════════════════════════════════════════════════════
-- CHAT MODELS (OpenAI-compatible)
-- ═══════════════════════════════════════════════════════════════

-- GPT models: no chat/ prefix
UPDATE models SET kie_endpoint = 'gpt-5-2' WHERE slug = 'gpt-52';
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55';
UPDATE models SET kie_endpoint = 'gpt-5-6-luna' WHERE slug = 'gpt-56-luna';
UPDATE models SET kie_endpoint = 'gpt-5-6-terra' WHERE slug = 'gpt-56-terra';
UPDATE models SET kie_endpoint = 'gpt-5-6-sol' WHERE slug = 'gpt-56-sol';

-- GPT Codex: wrong prefix
UPDATE models SET kie_endpoint = 'gpt-5-codex' WHERE slug = 'gpt-codex';

-- GPT Response models: no response/ prefix
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54-luna';
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54-terra';
UPDATE models SET kie_endpoint = 'gpt-5-4' WHERE slug = 'gpt-54-sol';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55-luna';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55-terra';
UPDATE models SET kie_endpoint = 'gpt-5-5' WHERE slug = 'gpt-55-sol';
UPDATE models SET kie_endpoint = 'gpt-5-6-luna' WHERE slug = 'gpt-56-luna-resp';
UPDATE models SET kie_endpoint = 'gpt-5-6-terra' WHERE slug = 'gpt-56-terra-resp';
UPDATE models SET kie_endpoint = 'gpt-5-6-sol' WHERE slug = 'gpt-56-sol-resp';

-- ═══════════════════════════════════════════════════════════════
-- CHAT MODELS (Anthropic)
-- ═══════════════════════════════════════════════════════════════

-- Claude models: no claude/ prefix + fix typos
UPDATE models SET kie_endpoint = 'claude-opus-4-7' WHERE slug = 'claude-opus-47';
UPDATE models SET kie_endpoint = 'claude-opus-4-8' WHERE slug = 'claude-opus-48';
UPDATE models SET kie_endpoint = 'claude-fable-5' WHERE slug = 'claude-fable-5';
UPDATE models SET kie_endpoint = 'claude-sonnet-5' WHERE slug = 'claude-sonnet-5';
UPDATE models SET kie_endpoint = 'claude-haiku-4-5' WHERE slug = 'claude-haiku-45';
UPDATE models SET kie_endpoint = 'claude-opus-4-5' WHERE slug = 'claude-opus-45';
UPDATE models SET kie_endpoint = 'claude-opus-4-6' WHERE slug = 'claude-opus-46';
UPDATE models SET kie_endpoint = 'claude-sonnet-4-5' WHERE slug = 'claude-sonnet-45';
UPDATE models SET kie_endpoint = 'claude-sonnet-4-6' WHERE slug = 'claude-sonnet-46';

-- ═══════════════════════════════════════════════════════════════
-- CHAT MODELS (Google)
-- ═══════════════════════════════════════════════════════════════

-- Gemini models: no gemini/ prefix, dot notation
UPDATE models SET kie_endpoint = 'gemini-2.5-pro' WHERE slug = 'gemini-25-pro';
UPDATE models SET kie_endpoint = 'gemini-3-pro' WHERE slug = 'gemini-3-pro';
UPDATE models SET kie_endpoint = 'gemini-3.1-pro' WHERE slug = 'gemini-31-pro';
UPDATE models SET kie_endpoint = 'gemini-2.5-flash' WHERE slug = 'gemini-25-flash';
UPDATE models SET kie_endpoint = 'gemini-3-flash' WHERE slug = 'gemini-3-flash';
UPDATE models SET kie_endpoint = 'gemini-3.5-flash' WHERE slug = 'gemini-35-flash';
UPDATE models SET kie_endpoint = 'gemini-3.5-flash-openai' WHERE slug = 'gemini-35-flash-openai';
UPDATE models SET kie_endpoint = 'gemini-3-flash-v1beta' WHERE slug = 'gemini-3-flash-v1beta';

-- Gemini TTS models: no gemini/ prefix, dot notation
UPDATE models SET kie_endpoint = 'gemini-3.1-flash-tts' WHERE slug = 'gemini-31-flash-tts';
UPDATE models SET kie_endpoint = 'gemini-2.5-pro-tts' WHERE slug = 'gemini-25-pro-tts';

-- Gemini OpenAI-compatible models: no gemini/ prefix, dot notation
UPDATE models SET kie_endpoint = 'gemini-2.5-pro' WHERE slug = 'gemini-25-pro-openai';
UPDATE models SET kie_endpoint = 'gemini-3-pro' WHERE slug = 'gemini-3-pro-openai';
UPDATE models SET kie_endpoint = 'gemini-3.1-pro' WHERE slug = 'gemini-31-pro-openai';
UPDATE models SET kie_endpoint = 'gemini-2.5-flash' WHERE slug = 'gemini-25-flash-openai';
UPDATE models SET kie_endpoint = 'gemini-3-flash' WHERE slug = 'gemini-3-flash-openai';
UPDATE models SET kie_endpoint = 'gemini-3-flash-v1beta' WHERE slug = 'gemini-3-flash-v1beta-openai';

-- ═══════════════════════════════════════════════════════════════
-- CHAT MODELS (Grok)
-- ═══════════════════════════════════════════════════════════════

-- Grok: dot notation
UPDATE models SET kie_endpoint = 'grok-4.3' WHERE slug = 'grok-43';
UPDATE models SET kie_endpoint = 'grok-4.5' WHERE slug = 'grok-45';

-- ═══════════════════════════════════════════════════════════════
-- Ensure all models have api_family set
-- ═══════════════════════════════════════════════════════════════
UPDATE models SET api_family = 'market_unified' WHERE api_family IS NULL;
