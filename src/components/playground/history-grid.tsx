import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { PriceDisplay } from "@/components/price-display";
import { proxiedUrl } from "@/lib/storage/r2";
import type { Result } from "@/routes/app.models.$slug";

type HistoryGridProps = {
  history: Result[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function HistoryGrid({ history, activeId, onSelect }: HistoryGridProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "group relative rounded-xl overflow-hidden border text-left transition",
            "aspect-square",
            activeId === item.id
              ? "border-amber ring-2 ring-amber/30"
              : "border-border hover:border-amber/40",
          )}
          style={
            item.resultUrl
              ? undefined
              : { background: `linear-gradient(135deg, var(--surface-2), var(--background))` }
          }
        >
          {item.resultUrl && (
            <img
              src={proxiedUrl(item.resultUrl)}
              alt={item.prompt}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
          {!item.resultUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition" />
          <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-mono text-background/90 bg-foreground/60 backdrop-blur px-1.5 py-0.5 rounded truncate">
            {item.prompt}
          </div>
          <div className="absolute top-1.5 right-1.5 rounded-full bg-foreground/60 backdrop-blur px-1.5 py-0.5 text-[9px] font-mono text-background/80">
            <PriceDisplay usd={item.cost} className="text-[9px]" />
          </div>
        </button>
      ))}
    </div>
  );
}
