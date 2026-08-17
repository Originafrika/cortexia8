import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NodeParams } from "@/components/canvas/node-params";
import { PriceDisplay } from "@/components/price-display";
import { getModel } from "@/lib/models";
import { useCanvasStore } from "@/lib/canvas-store";
import { useT } from "@/lib/i18n";
import { Play } from "lucide-react";

interface NodeParamsOverlayProps {
  nodeId: string;
  modelSlug: string;
  params: Record<string, unknown>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeParamsOverlay({
  nodeId,
  modelSlug,
  params,
  open,
  onOpenChange,
}: NodeParamsOverlayProps) {
  const t = useT();
  const model = getModel(modelSlug);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const runNode = useCanvasStore((s) => s.runNode);
  const updateNodeParams = useCanvasStore((s) => s.updateNodeParams);

  if (!model) return null;

  function handleChange(key: string, value: unknown) {
    updateNodeParams(nodeId, { [key]: value });
  }

  function handleRun() {
    runNode(nodeId);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="grid place-items-center size-7 rounded-lg bg-surface-2 text-muted-foreground shrink-0">
              <span className="text-xs font-medium">{model.name[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{model.name}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                {model.provider} · {model.category}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <NodeParams model={model} params={params} onChange={handleChange} disabled={readOnly} />
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          <PriceDisplay usd={model.priceUSD ?? 0} className="text-sm" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t("node.close")}
            </Button>
            <Button
              size="sm"
              onClick={handleRun}
              disabled={readOnly}
              className="bg-amber text-primary-foreground hover:bg-amber/90"
            >
              <Play className="size-3.5" /> {t("node.action.run")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
