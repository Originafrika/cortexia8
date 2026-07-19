/**
 * Agent logic for orchestrating graph building from natural language.
 *
 * This module:
 * 1. Accepts a natural language message
 * 2. Builds a system prompt with available models and operations
 * 3. Calls the configured LLM via kie.ai chat endpoint
 * 4. Parses JSON response for graph operations
 * 5. Validates operations against current graph state
 * 6. Shows confirmation if cumulative cost > threshold
 * 7. Executes via graphOps server function
 */

import { MODELS, type Model } from "./models";
import { kieApiBase } from "./kie-api/client";

// ── Types ─────────────────────────────────────────────────────────────────

export type AgentModel = "claude-sonnet-4-5" | "gpt-5-2";

export type GraphOperation =
  | { type: "ADD_NODE"; modelSlug: string; position?: { x: number; y: number } }
  | { type: "CONNECT_NODES"; source: string; target: string }
  | { type: "UPDATE_NODE"; nodeId: string; params: Record<string, unknown> }
  | { type: "REMOVE_NODE"; nodeId: string };

export type AgentResponse = {
  text: string;
  operations: GraphOperation[];
  estimatedCost: number;
  language: string;
};

export type AgentConfig = {
  model: AgentModel;
  maxTokens?: number;
  costThreshold?: number;
};

// ── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_COST_THRESHOLD = 0.5; // USD

// ── System Prompt Construction ────────────────────────────────────────────

function buildModelsSummary(): string {
  // Get unique models (by slug) and summarize them
  const uniqueModels = new Map<string, Model>();
  for (const m of MODELS) {
    if (!uniqueModels.has(m.slug)) {
      uniqueModels.set(m.slug, m);
    }
  }

  const lines: string[] = [];
  for (const m of uniqueModels.values()) {
    const price = m.priceUSD ?? m.tiers?.[0]?.priceUSD ?? 0;
    lines.push(
      `- ${m.slug}: ${m.name} (${m.category}) - ${m.blurb} [~$${price.toFixed(4)}]`
    );
  }
  return lines.join("\n");
}

function buildSystemPrompt(): string {
  const modelsSummary = buildModelsSummary();

  return `You are an AI assistant that helps users build media generation pipelines on a visual canvas.

## Your Role
Analyze the user's request and generate a sequence of graph operations to build the requested pipeline.

## Available Models (slugs for ADD_NODE)
${modelsSummary}

## Available Operations
You can use these operations in your response:

1. **ADD_NODE** - Add a model node to the canvas
   \`\`\`json
   { "type": "ADD_NODE", "modelSlug": "<slug>", "position": { "x": <number>, "y": <number> } }
   \`\`\`

2. **CONNECT_NODES** - Connect two nodes with an edge
   \`\`\`json
   { "type": "CONNECT_NODES", "source": "<node_id>", "target": "<node_id>" }
   \`\`\`

3. **UPDATE_NODE** - Update a node's parameters
   \`\`\`json
   { "type": "UPDATE_NODE", "nodeId": "<node_id>", "params": { "<key>": "<value>" } }
   \`\`\`

4. **REMOVE_NODE** - Remove a node from the canvas
   \`\`\`json
   { "type": "REMOVE_NODE", "nodeId": "<node_id>" }
   \`\`\`

## Response Format
You MUST respond with a JSON object in this exact format:
\`\`\`json
{
  "text": "<explanation of what you're building>",
  "operations": [
    { "type": "ADD_NODE", "modelSlug": "...", "position": { "x": 100, "y": 100 } },
    { "type": "ADD_NODE", "modelSlug": "...", "position": { "x": 350, "y": 100 } },
    { "type": "CONNECT_NODES", "source": "<id_from_previous_op>", "target": "<id_from_previous_op>" }
  ]
}
\`\`\`

## Important Rules
- Use ONLY model slugs from the available models list
- Position nodes logically (left-to-right for sequential workflows)
- Connect nodes in the order they should process data
- For node IDs in CONNECT_NODES, use the temporary IDs from ADD_NODE operations (op_index_0, op_index_1, etc.)
- Respond in the same language as the user's message
- Keep text responses concise and helpful
- Calculate estimated cost based on model prices

## Language Detection
Detect the user's language from their message and respond in that same language. Common languages: French (fr), English (en), Spanish (es), Portuguese (pt), etc.`;
}

// ── LLM API Calls ────────────────────────────────────────────────────────

async function callClaude(
  messages: Array<{ role: string; content: string }>,
  config: AgentConfig
): Promise<string> {
  const endpoint = `${kieApiBase()}/claude/v1/messages`;
  const body = {
    model: "claude-sonnet-4-5-20250514",
    messages,
    max_tokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
    stream: false,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.KIE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callGPT(
  messages: Array<{ role: string; content: string }>,
  config: AgentConfig
): Promise<string> {
  const endpoint = `${kieApiBase()}/openai/v1/chat/completions`;
  const body = {
    model: "gpt-5.2",
    messages,
    max_tokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
    stream: false,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.KIE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GPT API error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callLLM(
  messages: Array<{ role: string; content: string }>,
  config: AgentConfig
): Promise<string> {
  switch (config.model) {
    case "claude-sonnet-4-5":
      return callClaude(messages, config);
    case "gpt-5-2":
      return callGPT(messages, config);
    default:
      throw new Error(`Unsupported model: ${config.model}`);
  }
}

// ── Response Parsing ──────────────────────────────────────────────────────

function parseAgentResponse(raw: string): AgentResponse {
  // Try to extract JSON from the response
  let jsonStr = raw;

  // Look for JSON block in markdown code fence
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to parse
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // If parsing fails, try to find JSON object in the text
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        parsed = JSON.parse(objectMatch[0]);
      } catch {
        throw new Error("Failed to parse agent response as JSON");
      }
    } else {
      throw new Error("No JSON found in agent response");
    }
  }

  const text = typeof parsed.text === "string" ? parsed.text : "";
  const operations = Array.isArray(parsed.operations) ? parsed.operations : [];
  const language = detectLanguage(text);

  // Validate and transform operations
  const validatedOps: GraphOperation[] = [];
  let estimatedCost = 0;

  for (const op of operations) {
    if (!op || typeof op !== "object" || !op.type) continue;

    switch (op.type) {
      case "ADD_NODE": {
        if (typeof op.modelSlug !== "string") continue;
        const model = MODELS.find((m) => m.slug === op.modelSlug);
        if (!model) continue;

        const price = model.priceUSD ?? model.tiers?.[0]?.priceUSD ?? 0;
        estimatedCost += price;

        validatedOps.push({
          type: "ADD_NODE",
          modelSlug: op.modelSlug,
          position: op.position && typeof op.position === "object"
            ? { x: Number(op.position.x) || 0, y: Number(op.position.y) || 0 }
            : undefined,
        });
        break;
      }
      case "CONNECT_NODES": {
        if (typeof op.source !== "string" || typeof op.target !== "string") continue;
        validatedOps.push({
          type: "CONNECT_NODES",
          source: op.source,
          target: op.target,
        });
        break;
      }
      case "UPDATE_NODE": {
        if (typeof op.nodeId !== "string" || !op.params || typeof op.params !== "object") continue;
        validatedOps.push({
          type: "UPDATE_NODE",
          nodeId: op.nodeId,
          params: op.params as Record<string, unknown>,
        });
        break;
      }
      case "REMOVE_NODE": {
        if (typeof op.nodeId !== "string") continue;
        validatedOps.push({
          type: "REMOVE_NODE",
          nodeId: op.nodeId,
        });
        break;
      }
    }
  }

  return {
    text,
    operations: validatedOps,
    estimatedCost,
    language,
  };
}

function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const lowerText = text.toLowerCase();

  if (/\b(le|la|les|un|une|des|est|sont|je|tu|nous|vous|ils|elles|fait|faire|peut|doit|bonjour|merci)\b/.test(lowerText)) {
    return "fr";
  }
  if (/\b(the|is|are|was|were|have|has|had|can|will|would|could|should|hello|thanks|thank)\b/.test(lowerText)) {
    return "en";
  }
  if (/\b(el|la|los|las|es|son|estoy|tienes|podemos|puedo|hola|gracias)\b/.test(lowerText)) {
    return "es";
  }
  if (/\b(o|a|os|as|é|são|estou|tenho|podemos|posso|olá|obrigado)\b/.test(lowerText)) {
    return "pt";
  }

  return "en"; // Default to English
}

// ── Main Agent Function ───────────────────────────────────────────────────

export async function runAgent(
  userMessage: string,
  config: AgentConfig,
  currentGraphState?: {
    nodes: Array<{ id: string; slug: string }>;
    edges: Array<{ source: string; target: string }>;
  }
): Promise<AgentResponse> {
  // Build the user message with context
  let contextMessage = userMessage;

  if (currentGraphState && currentGraphState.nodes.length > 0) {
    const nodeContext = currentGraphState.nodes
      .map((n) => `- ${n.id}: ${n.slug}`)
      .join("\n");
    const edgeContext = currentGraphState.edges
      .map((e) => `- ${e.source} → ${e.target}`)
      .join("\n");

    contextMessage = `Current canvas state:
Nodes:
${nodeContext || "(empty)"}

Edges:
${edgeContext || "(empty)"}

User request: ${userMessage}`;
  }

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: contextMessage },
  ];

  const rawResponse = await callLLM(messages, config);
  return parseAgentResponse(rawResponse);
}

// ── Cost Validation ───────────────────────────────────────────────────────

export function shouldConfirmOperation(
  estimatedCost: number,
  threshold: number = DEFAULT_COST_THRESHOLD
): boolean {
  return estimatedCost > threshold;
}

// ── Export Constants ──────────────────────────────────────────────────────

export const AGENT_MODELS: Array<{ value: AgentModel; label: string }> = [
  { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { value: "gpt-5-2", label: "GPT 5.2" },
];

export const COST_THRESHOLD = DEFAULT_COST_THRESHOLD;
