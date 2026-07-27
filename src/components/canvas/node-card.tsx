import { useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/lib/canvas-store";
import { categoryAccent, portColor, portLabel, portsForCategory, type CanvasNode } from "@/lib/canvas-types";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Film, Music2, MessageSquare, Loader2, Check, AlertTriangle, Play, Sparkles, RefreshCw, PlayCircle, ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { PriceDisplay } from "@/components/price-display";
import { getModel, type ModelCategory } from "@/lib/models";
import { getPrimaryParams, ParamField } from "@/components/canvas/node-params";
import { NodeParamsOverlay } from "@/components/canvas/node-params-overlay";
import { useT } from "@/lib/i18n";

const CATEGORY_ICON: Record<ModelCategory, typeof ImageIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music2,
  text: MessageSquare,
  music: Music2,
};

export function NodeCard({ id, data, selected }: NodeProps<CanvasNode>) {
  const t = useT();
  const accent = categoryAccent(data.category);
  const ports = portsForCategory(data.category);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const setSelected = useCanvasStore((s) => s.setSelectedNodeId);
  const runNode = useCanvasStore((s) => s.runNode);
  const rerunNode = useCanvasStore((s) => s.rerunNode);
  const runFromNode = useCanvasStore((s) => s.runFromNode);
  const removeNode = useCanvasStore((s) => s.removeNode);
  const updateNodeParams = useCanvasStore((s) => s.updateNodeParams);
  const newNodeIds = useCanvasStore((s) => s.newNodeIds);
  const cascadeDelays = useCanvasStore((s) => s.cascadeDelays);

  const [expanded, setExpanded] = useState(false);
  const [showMoreOverlay, setShowMoreOverlay] = useState(false);

  const Icon = CATEGORY_ICON[data.category];
  const running = data.status === "running";
  const done = data.status === "done";
  const err = data.status === "error";

  const isNew = newNodeIds.has(id);
  const delay = cascadeDelays.get(id) ?? 0;

  const draggingFromPort = useCanvasStore((s) => s.draggingFromPort);
  const isDragSource = draggingFromPort !== null;
  const inputPortType = ports.in[0];
  const isCompatible = isDragSource && draggingFromPort === inputPortType;

  const model = getModel(data.modelSlug);
  const primaryParams = model ? getPrimaryParams(model) : [];

  const handleExpandToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  }, []);

  const handleParamChange = useCallback((key: string, value: unknown) => {
    updateNodeParams(id, { [key]: value });
  }, [id, updateNodeParams]);

  return (
    <>
      <motion.div
        initial={isNew ? { opacity: 0, scale: 0.8 } : false}
        animate={isNew ? { opacity: 1, scale: 1 } : undefined}
        transition={isNew ? { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setSelected(id);
        }}
        className={cn(
          "group w-[280px] rounded-2xl border bg-surface-1/85 backdrop-blur overflow-hidden border-l-[3px]",
          "transition-all duration-200",
          accent.leftBorder,
          selected
            ? `${accent.border} ring-2 ${accent.ring} ${accent.glow}`
            : `border-border/60 hover:border-border-strong`,
          isDragSource && !isCompatible && "opacity-30 scale-[0.97]",
          isDragSource && isCompatible && "ring-2 ring-emerald/50 shadow-[0_0_20px_4px_oklch(0.65_0.19_160_/_0.25)]",
          running && "animate-pulse-slow",
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
            width: isDragSource ? (isCompatible ? 16 : 8) : 12,
            height: isDragSource ? (isCompatible ? 16 : 8) : 12,
            border: isDragSource
              ? isCompatible
                ? `3px solid ${portColor(ports.in[0])}`
                : "2px solid var(--background)"
              : "2px solid var(--background)",
            boxShadow: isDragSource && isCompatible
              ? `0 0 12px 4px ${portColor(ports.in[0])}80, 0 0 24px 8px ${portColor(ports.in[0])}40`
              : isDragSource
                ? "none"
                : undefined,
            opacity: isDragSource && !isCompatible ? 0.25 : 1,
            transition: "all 0.2s ease",
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
        <div
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 cursor-pointer",
            accent.bg,
          )}
          onClick={handleExpandToggle}
        >
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
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNode(id);
              }}
              className="sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-foreground transition p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={t("node.delete")}
            >
              ×
            </button>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground"
            >
              <ChevronDown className="size-3.5" />
            </motion.div>
          </div>
        </div>

        {/* Collapsed: Status + Price */}
        {!expanded && (
          <div className="px-3 py-2 flex items-center justify-between text-[11px]">
            {running ? (
              <span className="flex items-center gap-1.5 text-amber-soft">
                <Loader2 className="size-3 animate-spin" />
                {data.step || "..."}
              </span>
            ) : done ? (
              <span className="flex items-center gap-1.5 text-emerald">
                <Check className="size-3" /> {t("node.status.ready")}
              </span>
            ) : err ? (
              <span className="flex items-center gap-1.5 text-amber-soft">
                <AlertTriangle className="size-3" /> {t("node.status.error")}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="size-3" /> {t("node.status.idle")}
              </span>
            )}
            <PriceDisplay usd={data.priceUSD} className="text-[10px]" />
          </div>
        )}

        {/* Expanded: Inline Params */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-2 space-y-2 border-t border-border/40">
                <div className="pt-2 space-y-2">
                  {primaryParams.map((p, i) => (
                    <ParamField
                      key={i}
                      p={p}
                      value={data.params}
                      onChange={handleParamChange}
                      disabled={readOnly}
                      compact
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: Actions */}
        <div className={cn(
          "flex items-center justify-between px-3 py-1.5 border-t border-border/40 bg-surface-0/40",
          expanded && "border-t border-border/40",
        )}>
          <div className="flex items-center gap-1">
            {running && (
              <div className="h-1 w-12 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full bg-gradient-to-r from-amber to-amber-soft transition-[width] duration-200"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            )}
            {!running && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runNode(id);
                }}
                disabled={readOnly || done}
                className="inline-flex items-center gap-1 rounded-full bg-amber/90 px-2.5 py-1 text-[10px] font-medium text-primary-foreground hover:bg-amber disabled:opacity-50 transition"
              >
                <Play className="size-2.5" /> {t("node.action.run")}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {done && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rerunNode(id);
                }}
                disabled={readOnly}
                className="inline-flex items-center gap-1 rounded-full bg-emerald/90 px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-emerald disabled:opacity-50 transition"
              >
                <RefreshCw className="size-2.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreOverlay(true);
              }}
              disabled={!model}
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-3 disabled:opacity-50 transition"
              title={t("node.more")}
            >
              <MoreHorizontal className="size-2.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full params overlay */}
      {showMoreOverlay && model && (
        <NodeParamsOverlay
          nodeId={id}
          modelSlug={data.modelSlug}
          params={data.params}
          open={showMoreOverlay}
          onOpenChange={setShowMoreOverlay}
        />
      )}
    </>
  );
}
