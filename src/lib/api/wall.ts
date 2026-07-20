import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/lib/db";
import type { WallItem, WallKind, UseCase } from "@/lib/wall-data";

type AssetRow = {
  id: number;
  model_slug: string | null;
  type: string;
  storage_url: string;
  preview_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

function mapRowToWallItem(row: AssetRow): WallItem {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;

  const kind: WallKind = (meta.kind as WallKind) ?? resolveKind(row.type);
  const useCase: UseCase = (meta.useCase as UseCase) ?? "ugc";
  const model = (meta.model as string) ?? row.model_slug ?? "Unknown";
  const prompt = (meta.prompt as string) ?? "";
  const modelSlug = row.model_slug ?? "unknown";
  const url = row.preview_url ?? row.storage_url;

  const span = (meta.span as WallItem["span"]) ?? "md";

  const item: WallItem = {
    id: `db-${row.id}`,
    kind,
    useCase,
    model,
    prompt,
    modelSlug,
    image: url,
    span,
  };

  if (kind === "video" || kind === "voice" || kind === "music") {
    item.video = url;
  }

  if (kind === "voice" || kind === "music") {
    item.audio = {
      title: (meta.audioTitle as string) ?? prompt.slice(0, 40),
      duration: (meta.audioDuration as string) ?? "0:00",
    };
  }

  return item;
}

function resolveKind(type: string): WallKind {
  switch (type) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "audio":
      return "music";
    default:
      return "image";
  }
}

export const getPublicWallAssets = createServerFn({ method: "GET" })
  .validator(() => {})
  .handler(async () => {
    try {
      const rows = (await sql`
        SELECT id, model_slug, type, storage_url, preview_url, metadata, created_at
        FROM assets
        WHERE is_public_wall = true
        ORDER BY created_at DESC
        LIMIT 100
      `) as AssetRow[];

      return rows.map(mapRowToWallItem);
    } catch {
      return [] as WallItem[];
    }
  });
