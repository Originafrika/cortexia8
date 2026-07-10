import { Marquee } from "./marquee";
import { MODELS, basePrice, unitLabel, type Model } from "@/lib/models";
import { PriceDisplay } from "./price-display";

function ModelPill({ m }: { m: Model }) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-border bg-surface-1/60 backdrop-blur px-4 py-3 min-w-[240px] hover:border-amber/40 transition-colors">
      <div className="grid place-items-center size-9 rounded-xl bg-surface-2 border border-border">
        <span className="font-display text-sm tracking-tight">
          {m.name.slice(0, 1)}
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{m.name}</div>
        <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">{m.category}</div>
      </div>
      <div className="ml-auto text-right">
        <PriceDisplay usd={basePrice(m)} className="text-xs" />
        <div className="text-[10px] text-muted-foreground">{unitLabel(m)}</div>
      </div>
    </div>
  );
}

export function ModelsMarquee() {
  const items = MODELS.slice(0, 20);
  return (
    <Marquee speed={60}>
      {items.map((m) => <ModelPill key={m.slug} m={m} />)}
    </Marquee>
  );
}
