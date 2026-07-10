import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MODELS, basePrice, type Model } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

type Item = { id: string; model: Model; prompt: string; date: string; cost: number; ratio: string; tint: string };

const PROMPTS = [
  "Flacon ambré, marbre travertin, lumière naturelle",
  "Sneakers urbaines, plan matinal, énergie contenue",
  "Voix off teaser série, ton grave, français",
  "Storyboard émission cuisine à Dakar, 6 cases",
  "Portrait UGC beauté, éclairage doux",
  "Pub 15s café artisan, plan serré barista",
  "Mockup story pâtisserie fine",
  "Animation logo, transition ambre vers noir",
  "Voix commerciale radio, portugais chaleureux",
  "Plan drone plage brésilienne, coucher soleil",
  "Cinemagraph mode, robe qui bouge",
  "Illustration éditoriale, article business",
];

const TINTS = ["#3d2a1e", "#2a1e3d", "#1e3d2a", "#3d1e2a", "#2a3d1e", "#1e2a3d"];

function makeItems(): Item[] {
  const pool = MODELS.filter((m) => m.category !== "text");
  return Array.from({ length: 24 }).map((_, i) => {
    const m = pool[i % pool.length];
    return {
      id: `g-${i}`,
      model: m,
      prompt: PROMPTS[i % PROMPTS.length],
      date: `il y a ${i + 1}h`,
      cost: basePrice(m) * (m.unit === "second" ? 5 : 1),
      ratio: i % 5 === 0 ? "aspect-[9/16]" : i % 3 === 0 ? "aspect-[3/4]" : "aspect-square",
      tint: TINTS[i % TINTS.length],
    };
  });
}

function HistoryPage() {
  const [items] = useState(makeItems);
  const [selected, setSelected] = useState<Item | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Historique</div>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">Tout ce que tu as créé.</h1>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setSelected(it)}
            className={"mb-3 block w-full break-inside-avoid group relative overflow-hidden rounded-xl border border-border " + it.ratio}
            style={{ background: `linear-gradient(135deg, ${it.tint}, oklch(0.14 0 0))` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              <div className="text-[11px] font-mono text-amber-soft">{it.model.name}</div>
              <div className="text-xs text-foreground/90 line-clamp-1">{it.prompt}</div>
              <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>{it.date}</span>
                <PriceDisplay usd={it.cost} className="text-[10px]" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-surface-1 border-l border-border overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-surface-1/95 backdrop-blur">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Détail</div>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1 hover:bg-surface-2"><X className="size-4" /></button>
              </div>
              <div className={"m-4 rounded-xl " + selected.ratio} style={{ background: `linear-gradient(135deg, ${selected.tint}, oklch(0.14 0 0))` }} />
              <div className="px-4 pb-6">
                <div className="text-xs text-muted-foreground">Prompt</div>
                <div className="mt-1 text-foreground/90">{selected.prompt}</div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Modèle</div>
                    <div className="mt-1">{selected.model.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Coût</div>
                    <div className="mt-1"><PriceDisplay usd={selected.cost} /></div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div className="mt-1">{selected.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Catégorie</div>
                    <div className="mt-1 capitalize">{selected.model.category}</div>
                  </div>
                </div>
                <button className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition">
                  <RefreshCw className="size-4" /> Régénérer avec ces paramètres
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
