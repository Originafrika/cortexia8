export type Capability =
  "workflows" | "canvas" | "developers" | "agent" | "text" | "audio" | "music";

export type CapabilityState = "ready" | "beta" | "disabled";

type CapabilityConfig = {
  clientEnvKey: string;
  serverEnvKey: string;
  defaultState: CapabilityState;
};

const CONFIG: Record<Capability, CapabilityConfig> = {
  workflows: {
    clientEnvKey: "VITE_CAPABILITY_WORKFLOWS",
    serverEnvKey: "CAPABILITY_WORKFLOWS",
    defaultState: "disabled",
  },
  canvas: {
    clientEnvKey: "VITE_CAPABILITY_CANVAS",
    serverEnvKey: "CAPABILITY_CANVAS",
    defaultState: "disabled",
  },
  developers: {
    clientEnvKey: "VITE_CAPABILITY_DEVELOPERS",
    serverEnvKey: "CAPABILITY_DEVELOPERS",
    defaultState: "disabled",
  },
  agent: {
    clientEnvKey: "VITE_CAPABILITY_AGENT",
    serverEnvKey: "CAPABILITY_AGENT",
    defaultState: "disabled",
  },
  text: {
    clientEnvKey: "VITE_CAPABILITY_TEXT",
    serverEnvKey: "CAPABILITY_TEXT",
    defaultState: "disabled",
  },
  audio: {
    clientEnvKey: "VITE_CAPABILITY_AUDIO",
    serverEnvKey: "CAPABILITY_AUDIO",
    defaultState: "disabled",
  },
  music: {
    clientEnvKey: "VITE_CAPABILITY_MUSIC",
    serverEnvKey: "CAPABILITY_MUSIC",
    defaultState: "disabled",
  },
};

function parseState(value: unknown, fallback: CapabilityState): CapabilityState {
  if (value === "ready" || value === "beta" || value === "disabled") return value;
  if (value === "true" || value === "1") return "ready";
  if (value === "false" || value === "0") return "disabled";
  return fallback;
}

function readEnv(clientKey: string, serverKey: string): unknown {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
  if (viteEnv && clientKey in viteEnv) return viteEnv[clientKey];
  if (typeof process !== "undefined" && process.env) {
    return process.env[serverKey] ?? process.env[clientKey];
  }
  return undefined;
}

export function capabilityState(capability: Capability): CapabilityState {
  const config = CONFIG[capability];
  return parseState(readEnv(config.clientEnvKey, config.serverEnvKey), config.defaultState);
}

export function isCapabilityEnabled(capability: Capability): boolean {
  return capabilityState(capability) !== "disabled";
}

export function capabilityForCategory(category: string): Capability | null {
  if (category === "text") return "text";
  if (category === "audio") return "audio";
  if (category === "music") return "music";
  return null;
}

export function capabilityLabel(capability: Capability): string {
  switch (capability) {
    case "workflows":
      return "Workflows";
    case "canvas":
      return "Canvas";
    case "developers":
      return "Developer API";
    case "agent":
      return "Agent mode";
    case "text":
      return "Text models";
    case "audio":
      return "Voice and audio";
    case "music":
      return "Music models";
  }
}
