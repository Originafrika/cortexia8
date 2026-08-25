import { CATALOGUE } from "./models-data";

export type AgentModel = string;

/**
 * The agent selector must never advertise an alias that is not present in the
 * catalogue and explicitly marked as faithful. Provider-specific model IDs are
 * resolved server-side from the same catalogue entry.
 */
export const AGENT_MODELS = CATALOGUE.filter(
  (model) =>
    model.active &&
    model.category === "text" &&
    model.fidelityStatus === "fidele" &&
    Boolean(model.apiFamily),
)
  .sort((a, b) => b.order - a.order)
  .map((model) => ({
    value: model.slug,
    label: `${model.name} · ${model.provider}`,
  }));

export const DEFAULT_AGENT_MODEL: AgentModel = AGENT_MODELS[0]?.value ?? "gpt-52";
