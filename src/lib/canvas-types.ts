import type { Model, ModelCategory } from "@/lib/models";
import type { Edge, Node } from "@xyflow/react";

export type NodeStatus =
  | "unconfigured"
  | "idle"
  | "ready"
  | "running"
  | "completed"
  | "done"
  | "error"
  | "failed";

export type PortType = "image" | "video" | "audio" | "text";

export type NodeResult =
  | { kind: "image"; url: string }
  | { kind: "video"; url: string }
  | { kind: "audio"; url: string }
  | { kind: "text"; text: string };

export type CanvasNodeData = {
  modelSlug: string;
  modelName: string;
  provider: string;
  category: ModelCategory;
  status: NodeStatus;
  progress: number;
  step: string;
  params: Record<string, unknown>;
  result: NodeResult | null;
  priceUSD: number;
  /** When was the node last run successfully. ISO string. */
  lastRunAt: string | null;
  [key: string]: unknown;
};

export type CanvasNode = Node<CanvasNodeData>;
export type CanvasEdge = Edge<{ media?: PortType }>;

/** Maps a model category to the port type it produces and accepts. */
export function portsForCategory(cat: ModelCategory): { in: PortType[]; out: PortType } {
  switch (cat) {
    case "image":
      return { in: ["image"], out: "image" };
    case "video":
      return { in: ["image"], out: "video" };
    case "audio":
      return { in: ["text"], out: "audio" };
    case "text":
      return { in: ["text"], out: "text" };
  }
}

export function portColor(t: PortType): string {
  switch (t) {
    case "image":
      return "#f59e0b";
    case "video":
      return "#a78bfa";
    case "audio":
      return "#10b981";
    case "text":
      return "#60a5fa";
  }
}

export function portLabel(t: PortType): string {
  switch (t) {
    case "image":
      return "Image";
    case "video":
      return "Vidéo";
    case "audio":
      return "Audio";
    case "text":
      return "Texte";
  }
}

export function categoryAccent(c: ModelCategory): {
  bg: string;
  border: string;
  text: string;
  pill: string;
  ring: string;
  IconBg: string;
} {
  switch (c) {
    case "image":
      return {
        bg: "bg-amber/10",
        border: "border-amber/30",
        text: "text-amber-soft",
        pill: "bg-amber/20 text-amber-soft",
        ring: "ring-amber/40",
        IconBg: "from-amber to-amber-soft",
      };
    case "video":
      return {
        bg: "bg-violet-500/10",
        border: "border-violet-500/30",
        text: "text-violet-300",
        pill: "bg-violet-500/20 text-violet-200",
        ring: "ring-violet-400/40",
        IconBg: "from-violet-500 to-violet-400",
      };
    case "audio":
      return {
        bg: "bg-emerald/10",
        border: "border-emerald/30",
        text: "text-emerald",
        pill: "bg-emerald/20 text-emerald",
        ring: "ring-emerald/40",
        IconBg: "from-emerald to-emerald/70",
      };
    case "text":
      return {
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        text: "text-sky-300",
        pill: "bg-sky-500/20 text-sky-200",
        ring: "ring-sky-400/40",
        IconBg: "from-sky-500 to-sky-400",
      };
  }
}

export function estimateNodePrice(m: Model, state: Record<string, unknown>): number {
  let unit = m.priceUSD ?? m.tiers?.[0]?.priceUSD ?? m.io?.outputUSD ?? 0;
  if (m.tiers) {
    const res = state.resolution as string | undefined;
    const found = m.tiers.find((t) => t.label === res);
    if (found) unit = found.priceUSD;
  }
  if (m.unit === "second") {
    const d = (state.duration as number) || 5;
    return unit * d;
  }
  return unit;
}
