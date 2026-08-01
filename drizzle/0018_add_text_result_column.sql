-- 0018: Add text_result column to run_node_executions.
-- Stores the raw text response from LLM/chat models (GPT, Claude, Gemini, etc.)
-- These models return text synchronously, not via webhook with a file URL.

ALTER TABLE run_node_executions ADD COLUMN IF NOT EXISTS text_result TEXT;
