import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "@/lib/canvas-store";
import { categoryAccent, portColor, portLabel, portsForCategory, type CanvasNode } from "@/lib/canvas-types";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Film, Music2, MessageSquare, Loader2, Check, AlertTriangle, Play, Sparkles } from "lucide-react";
import { PriceDisplay } from "@/components/price-display";
import type { ModelCategory } from "@/lib/models";

const CATEGORY_ICON: Record<ModelCategory, typeof ImageIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music2,
  text: MessageSquare,
  music: Music2,
};

export function NodeCard({ id, data, selected }: NodeProps<CanvasNode>) {
  const accent = categoryAccent(data.category);
  const ports = portsForCategory(data.category);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const setSelected = useCanvasStore((s) => s.setSelectedNodeId);
  const runNode = useCanvasStore((s) => s.runNode);
  const removeNode = useCanvasStore((s) => s.removeNode);

  const Icon = CATEGORY_ICON[data.category];
  const running = data.status === "running";
  const done = data.status === "done";
  const err = data.status === "error";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelected(id);
      }}
      className={cn(
        "group w-[260px] rounded-2xl border bg-surface-1/85 backdrop-blur overflow-hidden",
        "transition-all surface-gradient-border",
        selected
          ? `${accent.border} ring-2 ${accent.ring} shadow-[0_18px_60px_-18px_oklch(0.78_0.16_70_/_0.30)]`
          : `${accent.border} hover:border-border-strong`,
      )}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        isConnectable={!readOnly}
        style={{
          background: portColor(ports.in[0]),
          width: 12,
          height: 12,
          border: "2px solid var(--background)",
        }}
        title={portLabel(ports.in[0])}
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        isConnectable={!readOnly}
        style={{
          background: portColor(ports.out),
          width: 12,
          height: 12,
          border: "2px solid var(--background)",
        }}
        title={portLabel(ports.out)}
      />

      {/* Header */}
      <div className={cn("flex items-center gap-2.5 px-3 py-2.5 border-b border-border/60", accent.bg)}>
        <div
          className={cn(
            "grid place-items-center size-7 rounded-lg bg-gradient-to-br text-primary-foreground shrink-0",
            accent.IconBg,
          )}
        >
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium truncate leading-tight">{data.modelName}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground truncate">
            {data.provider} · {data.category}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition p-1"
          aria-label="Supprimer le nœud"
        >
          ×
        </button>
      </div>

      {/* Body / status / result */}
      <div className="px-3 py-2.5">
        {running ? (
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin text-amber" />
                {data.step || "…"}
              </span>
              <span className="tabular text-foreground/80">{data.progress}%</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-gradient-to-r from-amber to-amber-soft transition-[width] duration-200"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        ) : done && data.result ? (
          <ResultPreview category={data.category} result={data.result} />
        ) : err ? (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-soft">
            <AlertTriangle className="size-3" /> Échec
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3" /> Prêt
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                runNode(id);
              }}
              disabled={readOnly}
              className="inline-flex items-center gap-1 rounded-full bg-amber/90 px-2 py-0.5 text-[10px] font-medium text-primary-foreground hover:bg-amber disabled:opacity-50 transition"
            >
              <Play className="size-2.5" /> Lancer
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/40 bg-surface-0/40">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {data.status === "done" ? (
            <span className="inline-flex items-center gap-1 text-emerald">
              <Check className="size-2.5" /> Prêt
            </span>
          ) : data.status === "running" ? (
            <span className="text-amber-soft">En cours</span>
          ) : (
            "En attente"
          )}
        </span>
        <PriceDisplay
          usd={data.priceUSD}
          className={cn("text-[10px]", done && "text-foreground")}
          emphasize={done}
        />
      </div>
    </div>
  );
}

function ResultPreview({
  category,
  result,
}: {
  category: ModelCategory;
  result: NonNullable<CanvasNode["data"]["result"]>;
}) {
  if (category === "image" && result.kind === "image") {
    return (
      <div className="rounded-lg overflow-hidden border border-border bg-surface-0/40 aspect-video">
        <img src={result.url} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  if (category === "video" && result.kind === "video") {
    return (
      <div
        className="rounded-lg overflow-hidden border border-border bg-surface-0/40 aspect-video relative"
        style={{
          background: `linear-gradient(135deg, oklch(0.45 0.18 290), oklch(0.18 0.01 60))`,
        }}
      >
        <div className="absolute inset-0 grid place-items-center">
          <div className="size-10 rounded-full bg-black/40 backdrop-blur grid place-items-center border border-white/10">
            <Play className="size-4 text-white fill-white" />
          </div>
        </div>
      </div>
    );
  }
  if (category === "audio" && result.kind === "audio") {
    return (
      <div className="rounded-lg border border-border bg-surface-0/40 px-2.5 py-2 flex items-center gap-2">
        <div className="grid place-items-center size-6 rounded-full bg-emerald/20 text-emerald">
          <Music2 className="size-3" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Voix prête</div>
        <div className="ml-auto flex items-end gap-[2px] h-3">
          {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8].map((h, i) => (
            <span
              key={i}
              className="w-[2px] bg-emerald rounded-full"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      </div>
    );
  }
  if (category === "text" && result.kind === "text") {
    return (
      <div className="rounded-lg border border-border bg-surface-0/40 px-2.5 py-2 text-[11px] text-foreground/85 line-clamp-3">
        {result.text}
      </div>
    );
  }
  return null;
}
