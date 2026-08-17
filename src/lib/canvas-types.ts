import type { Model, ModelCategory } from "@/lib/models";
import type { Edge, Node } from "@xyflow/react";
import { Image as ImageIcon, Film, Music2, MessageSquare } from "lucide-react";

export type NodeStatus =
  "unconfigured" | "idle" | "ready" | "running" | "completed" | "done" | "error" | "failed";

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
    case "music":
      return { in: ["text"], out: "audio" };
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
      return "Video";
    case "audio":
      return "Audio";
    case "text":
      return "Text";
  }
}

/** Returns the Lucide icon component for a port type. */
export function portIcon(t: PortType) {
  switch (t) {
    case "image":
      return ImageIcon;
    case "video":
      return Film;
    case "audio":
      return Music2;
    case "text":
      return MessageSquare;
  }
}

/** Returns the Tailwind color class for a port type. */
export function portColorClass(t: PortType): string {
  switch (t) {
    case "image":
      return "text-amber";
    case "video":
      return "text-violet-400";
    case "audio":
      return "text-emerald";
    case "text":
      return "text-sky-400";
  }
}

/**
 * ElevenLabs-style: unified neutral node accent.
 * All nodes use the same clean, minimal background.
 * Category is shown as text label, not color.
 */
export function categoryAccent(_c: ModelCategory): {
  bg: string;
  border: string;
  text: string;
  pill: string;
  ring: string;
  IconBg: string;
  glow: string;
  leftBorder: string;
} {
  return {
    bg: "bg-surface-1",
    border: "border-border",
    text: "text-muted-foreground",
    pill: "bg-surface-2 text-muted-foreground",
    ring: "ring-border-strong",
    IconBg: "bg-surface-2",
    glow: "",
    leftBorder: "",
  };
}

/** Category-specific colors for the picker pills only. */
export function categoryPillColor(c: ModelCategory): string {
  switch (c) {
    case "image":
      return "bg-amber/15 text-amber-soft border-amber/30";
    case "video":
      return "bg-violet-500/15 text-violet-300 border-violet-500/30";
    case "audio":
      return "bg-emerald/15 text-emerald border-emerald/30";
    case "text":
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    case "music":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
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
