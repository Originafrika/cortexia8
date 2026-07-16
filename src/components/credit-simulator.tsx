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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SimModel = {
  key: string;
  name: string;
  category: "image" | "video" | "voice" | "text";
  icon: React.ElementType;
  unit: string;
  unitPriceUSD: number;
  suffix: string;
  max: number;
  step: number;
  defaultValue: number;
};

const ALL_MODELS: SimModel[] = [
  // Image
  { key: "qwen-image-2", name: "Qwen Image 2.0", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0378, suffix: "images / mois", max: 500, step: 5, defaultValue: 0 },
  { key: "seedream-5-pro", name: "Seedream 5.0 Pro", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0441, suffix: "images / mois", max: 500, step: 5, defaultValue: 40 },
  { key: "seedream-5-lite", name: "Seedream 5.0 Lite", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0347, suffix: "images / mois", max: 500, step: 5, defaultValue: 0 },
  { key: "nano-banana-2", name: "Nano Banana 2", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0504, suffix: "images / mois", max: 500, step: 5, defaultValue: 0 },
  { key: "nano-banana-2-lite", name: "Nano Banana 2 Lite", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0252, suffix: "images / mois", max: 500, step: 5, defaultValue: 0 },
  { key: "gpt-image-2", name: "GPT Image 2", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0378, suffix: "images / mois", max: 500, step: 5, defaultValue: 0 },
  { key: "wan-27-image", name: "Wan 2.7 Image", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0302, suffix: "images / mois", max: 500, step: 5, defaultValue: 0 },
  { key: "wan-27-image-pro", name: "Wan 2.7 Image Pro", category: "image", icon: ImageIcon, unit: "images", unitPriceUSD: 0.0756, suffix: "images / mois", max: 500, step: 5, defaultValue: 0 },
  // Video
  { key: "seedance-2-mini", name: "Seedance 2.0 Mini", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.0378, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "seedance-2-fast", name: "Seedance 2.0 Fast", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.0567, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "happyhorse-11", name: "HappyHorse-1.1", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.1418, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "kling-3-turbo", name: "Kling 3.0 Turbo", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.1134, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 25 },
  { key: "kling-3-standard", name: "Kling 3.0 Standard", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.126, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "kling-3-pro", name: "Kling 3.0 Pro", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.1701, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "kling-3-4k", name: "Kling 3.0 4K", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.4221, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "kling-3-motion", name: "Kling 3.0 Motion", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.126, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "grok-imagine-15", name: "Grok Video 1.5", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.0101, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "wan-27-video", name: "Wan 2.7 Video", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.1008, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "gemini-omni-video", name: "Gemini Omni Video", category: "video", icon: Film, unit: "clips", unitPriceUSD: 0.6615, suffix: "clips / mois", max: 50, step: 1, defaultValue: 0 },
  { key: "omnihuman-15", name: "OmniHuman 1.5", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.1701, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  { key: "volc-lip-sync", name: "Volcengine Lip Sync", category: "video", icon: Film, unit: "secondes", unitPriceUSD: 0.0504, suffix: "secondes / mois", max: 300, step: 5, defaultValue: 0 },
  // Voice
  { key: "eleven-v3", name: "ElevenLabs V3", category: "voice", icon: Mic, unit: "1k caractères", unitPriceUSD: 0.0882, suffix: "×1k car. / mois", max: 200, step: 2, defaultValue: 6 },
  // Text
  { key: "claude-sonnet-5", name: "Claude Sonnet 5", category: "text", icon: MessageSquare, unit: "M tokens", unitPriceUSD: 5.3865, suffix: "M tokens / mois", max: 20, step: 0.5, defaultValue: 0.8 },
  { key: "claude-opus-48", name: "Claude Opus 4.8", category: "text", icon: MessageSquare, unit: "M tokens", unitPriceUSD: 12.6, suffix: "M tokens / mois", max: 20, step: 0.5, defaultValue: 0 },
  { key: "claude-fable-5", name: "Claude Fable 5", category: "text", icon: MessageSquare, unit: "M tokens", unitPriceUSD: 25.2, suffix: "M tokens / mois", max: 20, step: 0.5, defaultValue: 0 },
  { key: "claude-haiku-45", name: "Claude Haiku 4.5", category: "text", icon: MessageSquare, unit: "M tokens", unitPriceUSD: 1.7955, suffix: "M tokens / mois", max: 20, step: 0.5, defaultValue: 0 },
];

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; refSub: { name: string; usd: number } }> = {
  image: { label: "Image", icon: ImageIcon, refSub: { name: "Midjourney Standard", usd: 30 } },
  video: { label: "Vidéo", icon: Film, refSub: { name: "Higgsfield Pro", usd: 39 } },
  voice: { label: "Voix", icon: Mic, refSub: { name: "ElevenLabs Starter", usd: 22 } },
  text: { label: "Texte", icon: MessageSquare, refSub: { name: "Claude Pro", usd: 20 } },
};

const DEFAULT_VALUES: Record<string, number> = Object.fromEntries(
  ALL_MODELS.map((m) => [m.key, m.defaultValue]),
);

function ModelSlider({ model, value, onChange }: { model: SimModel; value: number; onChange: (v: number) => void }) {
  const c = useCurrency();
  const cost = value * model.unitPriceUSD;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground/90">{model.name}</span>
        <div className="text-right">
          <div className="font-mono tabular text-sm text-foreground/90">
            {model.step < 1 ? value.toFixed(1) : Math.round(value)}
            <span className="text-muted-foreground ml-1 text-[11px]">{model.suffix}</span>
          </div>
          <div className="font-mono tabular text-[11px] text-muted-foreground">
            {formatMoney(cost, c)}
          </div>
        </div>
      </div>
      <div className="relative mt-2">
        <input
          type="range"
          min={0}
          max={model.max}
          step={model.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3 cursor-pointer"
          aria-label={model.name}
        />
      </div>
    </div>
  );
}

export function CreditSimulator({ compact }: { compact?: boolean }) {
  const t = useT();
  const [values, setValues] = useState<Record<string, number>>(DEFAULT_VALUES);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const c = useCurrency();

  const total = useMemo(
    () => ALL_MODELS.reduce((sum, m) => sum + (values[m.key] || 0) * m.unitPriceUSD, 0),
    [values],
  );

  const categories = useMemo(() => {
    const groups: Record<string, SimModel[]> = {};
    for (const m of ALL_MODELS) {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    }
    return groups;
  }, []);

  const referenceMonthly = useMemo(
    () => Object.values(CATEGORY_META).reduce((sum, cat) => sum + cat.refSub.usd, 0),
    [],
  );

  const diff = referenceMonthly - total;
  const state: "save" | "near" | "over" =
    diff > referenceMonthly * 0.2 ? "save" : diff >= 0 ? "near" : "over";

  const hasUsage = Object.values(values).some((v) => v > 0);

  const toggleCat = (cat: string) => setExpanded((p) => ({ ...p, [cat]: !p[cat] }));

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
          {Object.entries(categories).map(([catKey, models]) => {
            const meta = CATEGORY_META[catKey];
            if (!meta) return null;
            const catTotal = models.reduce((sum, m) => sum + (values[m.key] || 0) * m.unitPriceUSD, 0);
            const activeModels = models.filter((m) => (values[m.key] || 0) > 0);
            const inactiveModels = models.filter((m) => (values[m.key] || 0) === 0);
            const isExpanded = expanded[catKey] ?? false;
            const hasInactive = inactiveModels.length > 0;

            return (
              <div key={catKey}>
                <button
                  onClick={() => hasInactive && toggleCat(catKey)}
                  className={cn(
                    "flex items-center gap-2 w-full mb-3 group",
                    hasInactive && "cursor-pointer"
                  )}
                >
                  <span className="grid place-items-center size-6 rounded-md bg-surface-2 border border-border">
                    <meta.icon className="size-3 text-amber-soft" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {meta.label}
                  </span>
                  {catTotal > 0 && (
                    <span className="font-mono text-[11px] text-foreground/70 tabular ml-2">
                      {formatMoney(catTotal, c)}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground/60">
                    {activeModels.length > 0 && `${activeModels.length} actifs`}
                  </span>
                  {hasInactive && (
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground/60 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </button>

                <div className="space-y-4">
                  {/* Active models always shown */}
                  {activeModels.map((m) => (
                    <ModelSlider
                      key={m.key}
                      model={m}
                      value={values[m.key] || 0}
                      onChange={(v) => setValues((prev) => ({ ...prev, [m.key]: v }))}
                    />
                  ))}

                  {/* Inactive models shown when expanded */}
                  {isExpanded &&
                    inactiveModels.map((m) => (
                      <ModelSlider
                        key={m.key}
                        model={m}
                        value={values[m.key] || 0}
                        onChange={(v) => setValues((prev) => ({ ...prev, [m.key]: v }))}
                      />
                    ))}
                </div>
              </div>
            );
          })}
          {!hasUsage && (
            <p className="text-sm text-muted-foreground italic">
              {t("sim.compose")}
            </p>
          )}
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
              <span className="text-xs text-muted-foreground">/ mois, meme sans rien generer</span>
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
          Bas sur un panier de reference : {Object.values(CATEGORY_META).map((c) => c.refSub.name).join(" . ")}.
        </div>
      </div>
    </div>
  );
}
