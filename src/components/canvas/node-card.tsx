import { useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/lib/canvas-store";
import {
  categoryAccent,
  portColor,
  portLabel,
  portIcon,
  portColorClass,
  portsForCategory,
  type CanvasNode,
} from "@/lib/canvas-types";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Check,
  AlertTriangle,
  Play,
  Sparkles,
  RefreshCw,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { PriceDisplay } from "@/components/price-display";
import { getModel, type ModelCategory } from "@/lib/models";
import { getPrimaryParams, ParamField } from "@/components/canvas/node-params";
import { NodeParamsOverlay } from "@/components/canvas/node-params-overlay";
import { useT } from "@/lib/i18n";

export function NodeCard({ id, data, selected }: NodeProps<CanvasNode>) {
  const t = useT();
  const accent = categoryAccent(data.category);
  const ports = portsForCategory(data.category);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const setSelected = useCanvasStore((s) => s.setSelectedNodeId);
  const runNode = useCanvasStore((s) => s.runNode);
  const rerunNode = useCanvasStore((s) => s.rerunNode);
  const updateNodeParams = useCanvasStore((s) => s.updateNodeParams);
  const newNodeIds = useCanvasStore((s) => s.newNodeIds);
  const cascadeDelays = useCanvasStore((s) => s.cascadeDelays);

  const [expanded, setExpanded] = useState(false);
  const [showMoreOverlay, setShowMoreOverlay] = useState(false);

  const running = data.status === "running";
  const done = data.status === "done";
  const err = data.status === "error" || data.status === "failed";

  const isNew = newNodeIds.has(id);
  const delay = cascadeDelays.get(id) ?? 0;

  const draggingFromPort = useCanvasStore((s) => s.draggingFromPort);
  const isDragSource = draggingFromPort !== null;
  const inputPortType = ports.in[0];
  const isCompatible = isDragSource && draggingFromPort === inputPortType;

  const model = getModel(data.modelSlug);
  const primaryParams = model ? getPrimaryParams(model) : [];

  // Port icons
  const InputIcon = portIcon(ports.in[0]);
  const OutputIcon = portIcon(ports.out);
  const inputColorClass = portColorClass(ports.in[0]);
  const outputColorClass = portColorClass(ports.out);

  const handleExpandToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  }, []);

  const handleParamChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeParams(id, { [key]: value });
    },
    [id, updateNodeParams],
  );

  return (
    <>
      <motion.div
        initial={isNew ? { opacity: 0, scale: 0.8 } : false}
        animate={isNew ? { opacity: 1, scale: 1 } : undefined}
        transition={
          isNew
            ? { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }
            : undefined
        }
        onClick={(e) => {
          e.stopPropagation();
          setSelected(id);
        }}
        className={cn(
          "group w-[260px] rounded-xl border bg-surface-1",
          "transition-all duration-200",
          selected
            ? "border-border-strong ring-1 ring-border-strong shadow-lg"
            : "border-border hover:border-border-strong",
          isDragSource &&
            !isCompatible &&
            "opacity-30 scale-[0.97]",
          isDragSource &&
            isCompatible &&
            "ring-1 ring-emerald/50 shadow-[0_0_12px_2px_rgba(16,185,129,0.15)]",
        )}
      >
        {/* Input handle — visible icon, draggable for connections */}
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          isConnectable={!readOnly}
          className={cn(
            "!size-[22px] !rounded-full !bg-surface-2 !border !border-border",
            "!-left-4 !top-1/2 !-translate-y-1/2",
            "!cursor-grab !flex !items-center !justify-center",
            "!z-20",
            "hover:!border-border-strong hover:!bg-surface-3",
            "transition-all duration-200",
            isDragSource &&
              isCompatible &&
              "!border-emerald !bg-emerald/10 !scale-110",
            isDragSource &&
              !isCompatible &&
              "!opacity-30",
          )}
          title={portLabel(ports.in[0])}
        >
          <InputIcon className={cn("size-3 pointer-events-none", inputColorClass)} />
        </Handle>

        {/* Output handle — visible icon, draggable for connections */}
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          isConnectable={!readOnly}
          className={cn(
            "!size-[22px] !rounded-full !bg-surface-2 !border !border-border",
            "!-right-4 !top-1/2 !-translate-y-1/2",
            "!cursor-grab !flex !items-center !justify-center",
            "!z-20",
            "hover:!border-border-strong hover:!bg-surface-3",
            "transition-all duration-200",
            isDragSource &&
              !isCompatible &&
              "!opacity-30",
          )}
          title={portLabel(ports.out)}
        >
          <OutputIcon className={cn("size-3 pointer-events-none", outputColorClass)} />
        </Handle>

        {/* Header — clickable to expand */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-surface-2/50 transition-colors overflow-hidden"
          onClick={handleExpandToggle}
        >
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium truncate leading-tight">
              {data.modelName}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground truncate">
              {data.provider} · {data.category}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                useCanvasStore.getState().removeNode(id);
              }}
              className="sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-foreground transition p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={t("node.delete")}
            >
              ×
            </button>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.15 }}
              className="text-muted-foreground"
            >
              <ChevronDown className="size-3.5" />
            </motion.div>
          </div>
        </div>

        {/* Collapsed: Status + Price + Text preview */}
        {!expanded && (
          <div className="px-3 py-2 border-t border-border/40">
            <div className="flex items-center justify-between text-[11px]">
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
            {data.result?.kind === "text" && (
              <div className="mt-1.5 max-h-[60px] overflow-hidden rounded bg-surface-2/60 p-2 text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {data.result.text}
              </div>
            )}
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
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/40 bg-surface-0/40">
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
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-3 disabled:opacity-50 transition"
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
