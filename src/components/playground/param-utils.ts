import {
  Ban,
  Clock,
  Dice5,
  Image as ImageIcon,
  MessageSquare,
  Palette,
  Ratio,
  SlidersHorizontal,
  Upload,
  Volume2,
} from "lucide-react";
import type { ParamSpec } from "@/lib/models";

export function iconForParam(key: string, kind: ParamSpec["kind"]) {
  // Secondary text params (not the main prompt)
  if (key === "negative_prompt") return Ban;
  if (key === "lyrics" || key === "script" || key === "description") return MessageSquare;

  // Other param types
  if (kind === "upload") return Upload;
  if (kind === "seed") return Dice5;
  if (key === "ratio") return Ratio;
  if (key === "resolution") return ImageIcon;
  if (key === "style") return Palette;
  if (key === "duration") return Clock;
  if (key === "audio" || key === "voice" || key === "lang") return Volume2;
  return SlidersHorizontal;
}
