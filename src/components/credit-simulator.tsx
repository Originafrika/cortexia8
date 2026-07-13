import { useMemo, useState } from "react";
import { PriceDisplay } from "./price-display";
import { useCurrency, formatMoney } from "@/lib/currency";
import { useT } from "@/lib/i18n";
import {
  Image as ImageIcon,
  Film,
  Mic,
  MessageSquare,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  key: string;
  label: string;
  icon: React.ElementType;
  /** Displayed usage unit ("images", "secondes"…). */
  unit: string;
  /** USD per unit. */
  unitPriceUSD: number;
  suffix: string;
  max: number;
  step: number;
  helper: string;
  /** Reference subscription that would cover this category, monthly USD. */
  refPlan: { name: string; usd: number };
};

const CATEGORIES: Category[] = [
  {
    key: "image",
    label: "Images",
    icon: ImageIcon,
    unit: "images",
    unitPriceUSD: 0.05,
    suffix: "images / mois",
    max: 1000,
    step: 5,
    helper: "Seedream Pro 1K en moyenne.",
    refPlan: { name: "Midjourney Standard", usd: 30 },
  },
  {
    key: "video",
    label: "Vidéo",
    icon: Film,
    unit: "secondes",
    unitPriceUSD: 0.12,
    suffix: "secondes / mois",
    max: 1200,
    step: 5,
    helper: "Kling 3 Turbo 1080p.",
    refPlan: { name: "Higgsfield Pro", usd: 39 },
  },
  {
    key: "voice",
    label: "Voix",
    icon: Mic,
    unit: "1000 caractères",
    unitPriceUSD: 0.088,
    suffix: "×1 000 car. / mois",
    max: 400,
    step: 2,
    helper: "ElevenLabs V3.",
    refPlan: { name: "ElevenLabs Starter", usd: 22 },
  },
  {
    key: "text",
    label: "Texte",
    icon: MessageSquare,
    unit: "M tokens",
    unitPriceUSD: 5.4,
    suffix: "M tokens / mois",
    max: 40,
    step: 0.5,
    helper: "Claude Sonnet 5 en sortie.",
    refPlan: { name: "Claude Pro", usd: 20 },
  },
];

const DEFAULT_VALUES: Record<string, number> = { image: 40, video: 25, voice: 6, text: 0.8 };

export function CreditSimulator({ compact }: { compact?: boolean }) {
  const t = useT();
  const [values, setValues] = useState<Record<string, number>>(DEFAULT_VALUES);
  const c = useCurrency();

  const total = useMemo(
    () => CATEGORIES.reduce((sum, cat) => sum + values[cat.key] * cat.unitPriceUSD, 0),
    [values],
  );

  // Reference basket: total monthly cost of the equivalent stacked subscriptions
  // — always computed against the same categories the user is simulating.
  const referenceMonthly = useMemo(
    () => CATEGORIES.reduce((sum, cat) => sum + cat.refPlan.usd, 0),
    [],
  );

  const diff = referenceMonthly - total;
  // Three states — never a zero display.
  //   "save"     : Cortexia much cheaper
  //   "near"     : within 20% of the subscription cost
  //   "over"     : Cortexia now costs more than the reference basket
  const state: "save" | "near" | "over" =
    diff > referenceMonthly * 0.2 ? "save" : diff >= 0 ? "near" : "over";

  return (
    <div
      className={cn(
        "surface-gradient-border rounded-3xl bg-surface-1/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]",
        compact ? "" : "grid gap-8 md:grid-cols-[1.15fr,1fr]",
      )}
    >
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("sim.eyebrow_card")}
            </div>
            <h3 className="mt-1 font-display text-2xl tracking-[-0.02em]">{t("sim.compose")}</h3>
          </div>
        </div>
        <div className="space-y-6">
          {CATEGORIES.map((cat) => {
            const val = values[cat.key];
            const sub = val * cat.unitPriceUSD;
            // Value on the slider where Cortexia cost equals the reference plan
            const breakEven = cat.refPlan.usd / cat.unitPriceUSD;
            const breakEvenPct = Math.min(100, (breakEven / cat.max) * 100);
            const Icon = cat.icon;
            return (
              <div key={cat.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <label className="flex items-center gap-2.5 text-sm">
                    <span className="grid place-items-center size-7 rounded-lg bg-surface-2 border border-border">
                      <Icon className="size-3.5 text-amber-soft" />
                    </span>
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-muted-foreground text-xs hidden sm:inline">
                      {cat.helper}
                    </span>
                  </label>
                  <div className="text-right">
                    <div className="font-mono tabular text-sm text-foreground/90">
                      {cat.step < 1 ? val.toFixed(1) : Math.round(val)}
                      <span className="text-muted-foreground ml-1 text-[11px]">{cat.suffix}</span>
                    </div>
                    <div className="font-mono tabular text-[11px] text-muted-foreground">
                      {formatMoney(sub, c)}
                    </div>
                  </div>
                </div>
                <div className="relative mt-3">
                  <input
                    type="range"
                    min={0}
                    max={cat.max}
                    step={cat.step}
                    value={val}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [cat.key]: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3 cursor-pointer"
                    aria-label={cat.label}
                  />
                  {/* Break-even threshold marker */}
                  {breakEvenPct < 98 && (
                    <div
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-px bg-amber-soft/80"
                      style={{ left: `calc(${breakEvenPct}% - 0.5px)` }}
                      title={t("sim.threshold_marker")}
                    />
                  )}
                </div>
                {val > breakEven && (
                  <div className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-amber-soft/80">
                    <AlertTriangle className="size-3" />
                    {t("sim.threshold_marker")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn("flex flex-col justify-between gap-6", compact && "mt-8")}>
        <div className="rounded-2xl border border-border bg-surface-0/60 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("sim.your_month")}
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <PriceDisplay
              usd={total}
              className="font-display text-[clamp(2.5rem,6vw,4rem)] tracking-[-0.03em] leading-none"
              emphasize
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{t("sim.charged")}</div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("sim.classic")}
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span
                className={cn(
                  "font-mono tabular text-2xl",
                  state === "over" ? "text-foreground" : "text-muted-foreground line-through",
                )}
              >
                {formatMoney(referenceMonthly, c)}
              </span>
              <span className="text-xs text-muted-foreground">/ mois — même sans rien générer</span>
            </div>

            {state === "save" && (
              <p className="mt-4 text-sm text-foreground/85 leading-relaxed">
                {t("sim.you_save")}{" "}
                <span className="text-amber font-medium tabular font-mono">
                  {formatMoney(diff, c)}
                </span>{" "}
                {t("sim.this_month")}
              </p>
            )}
            {state === "near" && (
              <p className="mt-4 text-sm text-foreground/85 leading-relaxed inline-flex items-start gap-2">
                <Sparkles className="size-4 text-amber-soft mt-0.5 shrink-0" />
                <span>{t("sim.close_note")}</span>
              </p>
            )}
            {state === "over" && (
              <p className="mt-4 text-sm text-foreground/85 leading-relaxed">
                {t("sim.threshold_note")}
              </p>
            )}
          </div>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground/80">
          Basé sur un panier de référence : {CATEGORIES.map((cat) => cat.refPlan.name).join(" · ")}.
        </div>
      </div>
    </div>
  );
}
