import { Link } from "@tanstack/react-router";
import { PriceDisplay } from "@/components/price-display";
import { type Model, basePrice, unitLabel } from "@/lib/models";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ModelCardProps = {
  model: Model;
  compact?: boolean;
};

export function ModelCard({ model, compact = false }: ModelCardProps) {
  const t = useT();
  return (
    <Link
      to="/app/models/$slug"
      params={{ slug: model.slug }}
      className={cn(
        "group surface-gradient-border rounded-2xl bg-surface-1/60 backdrop-blur transition-all",
        "hover:bg-surface-1/80 hover:-translate-y-0.5",
        "hover:shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--amber)_25%,transparent)]",
        compact ? "p-4" : "p-5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-display tracking-[-0.02em] truncate",
              compact ? "text-base" : "text-lg"
            )}>
              {model.name}
            </span>
            {model.badge && <ModelBadge badge={model.badge} />}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {model.provider} · {model.category}
          </div>
        </div>
      </div>

      {!compact && (
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-2">
          {model.blurb}
        </p>
      )}

      <div className={cn(
        "flex items-baseline justify-between",
        compact ? "mt-2 pt-2" : "mt-4 pt-4",
        "border-t border-border"
      )}>
        <PriceDisplay
          usd={basePrice(model)}
          className={cn("font-display tracking-[-0.02em]", compact ? "text-lg" : "text-2xl")}
          emphasize
        />
        {!compact && (
          <span className="text-[11px] text-muted-foreground font-mono">
            {unitLabel(model)}
          </span>
        )}
      </div>
    </Link>
  );
}

function ModelBadge({ badge }: { badge: string }) {
  const t = useT();
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider",
        badge === "popular"
          ? "bg-amber/20 text-amber-soft"
          : badge === "new"
            ? "bg-emerald/20 text-emerald"
            : "bg-surface-3 text-muted-foreground"
      )}
    >
      {badge === "popular" ? t("models.badge_popular") : badge === "new" ? t("models.badge_new") : t("models.badge_pro")}
    </span>
  );
}
