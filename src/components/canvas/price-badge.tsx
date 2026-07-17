import { useCanvasStore } from "@/lib/canvas-store";
import { PriceDisplay } from "@/components/price-display";
import { Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function PriceBadge({ className }: { className?: string }) {
  const total = useCanvasStore((s) => s.totalCost());
  const count = useCanvasStore((s) => s.nodes.length);
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/70 px-3.5 h-9 text-sm",
        className,
      )}
      title={`Coût estimé du canvas · ${count} nœud${count > 1 ? "s" : ""}`}
    >
      <Wallet className="size-3.5 text-amber" />
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Total
      </span>
      <PriceDisplay usd={total} className="text-sm" emphasize />
      <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-surface-2/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
        <Sparkles className="size-2.5" /> {count} nœud{count > 1 ? "s" : ""}
      </span>
    </div>
  );
}
