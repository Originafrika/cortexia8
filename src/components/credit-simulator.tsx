import { useState } from "react";
import { PriceDisplay } from "./price-display";
import { useCurrency, formatMoney } from "@/lib/currency";
import { Image as ImageIcon, Film, Mic, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { key: string; label: string; icon: React.ElementType; unit: string; unitPriceUSD: number; suffix: string; max: number; step: number; helper: string };

const CATEGORIES: Category[] = [
  { key: "image",  label: "Images",     icon: ImageIcon,     unit: "images",         unitPriceUSD: 0.05,    suffix: "images / mois",       max: 500,   step: 5,    helper: "Seedream Pro 1K en moyenne." },
  { key: "video",  label: "Vidéo",      icon: Film,          unit: "secondes",       unitPriceUSD: 0.12,    suffix: "secondes / mois",     max: 600,   step: 5,    helper: "Kling 3 Turbo 1080p." },
  { key: "voice",  label: "Voix",       icon: Mic,           unit: "1000 caractères",unitPriceUSD: 0.088,   suffix: "×1 000 car. / mois",  max: 200,   step: 2,    helper: "ElevenLabs V3." },
  { key: "text",   label: "Texte",      icon: MessageSquare, unit: "M tokens",       unitPriceUSD: 5.4,     suffix: "M tokens / mois",     max: 20,    step: 0.5,  helper: "Claude Sonnet 5 en sortie." },
];

/** Typical monthly cost of a bundled SaaS across categories. Mocked. */
const CLASSIC_MONTHLY_USD = 89;

export function CreditSimulator({ compact }: { compact?: boolean }) {
  const [values, setValues] = useState<Record<string, number>>({ image: 40, video: 25, voice: 6, text: 0.8 });
  const total = CATEGORIES.reduce((sum, c) => sum + values[c.key] * c.unitPriceUSD, 0);
  const c = useCurrency();
  const savings = Math.max(0, CLASSIC_MONTHLY_USD - total);

  return (
    <div className={cn(
      "surface-gradient-border rounded-3xl bg-surface-1/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]",
      compact ? "" : "grid gap-8 md:grid-cols-[1.15fr,1fr]"
    )}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Simulateur</div>
            <h3 className="mt-1 font-display text-2xl tracking-[-0.02em]">Compose ton mois type.</h3>
          </div>
        </div>
        <div className="space-y-6">
          {CATEGORIES.map((cat) => {
            const val = values[cat.key];
            const sub = val * cat.unitPriceUSD;
            const Icon = cat.icon;
            return (
              <div key={cat.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <label className="flex items-center gap-2.5 text-sm">
                    <span className="grid place-items-center size-7 rounded-lg bg-surface-2 border border-border">
                      <Icon className="size-3.5 text-amber-soft" />
                    </span>
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-muted-foreground text-xs">{cat.helper}</span>
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
                <input
                  type="range"
                  min={0}
                  max={cat.max}
                  step={cat.step}
                  value={val}
                  onChange={(e) => setValues((v) => ({ ...v, [cat.key]: parseFloat(e.target.value) }))}
                  className="mt-3 w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3 cursor-pointer"
                  aria-label={cat.label}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn("flex flex-col justify-between gap-6", compact && "mt-8")}>
        <div className="rounded-2xl border border-border bg-surface-0/60 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Ton mois avec Cortexia
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <PriceDisplay usd={total} className="font-display text-[clamp(2.5rem,6vw,4rem)] tracking-[-0.03em] leading-none" emphasize />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Facturé à la génération. Pas de mensualité fixe.
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Avec un abonnement classique
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-mono tabular text-2xl text-muted-foreground line-through">
                {formatMoney(CLASSIC_MONTHLY_USD, c)}
              </span>
              <span className="text-xs text-muted-foreground">/ mois — que tu génères ou pas</span>
            </div>
            <p className="mt-4 text-sm text-foreground/85 leading-relaxed">
              Higgsfield te fait payer <span className="font-mono tabular text-foreground">{formatMoney(CLASSIC_MONTHLY_USD, c)}</span> même
              les jours où tu ne crées rien. Nous non. Tu économises{" "}
              <span className="text-amber font-medium tabular font-mono">{formatMoney(savings, c)}</span> ce mois-ci.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground/80">
          Prix indicatifs — les tarifs exacts par modèle vivent dans le catalogue.
        </div>
      </div>
    </div>
  );
}
