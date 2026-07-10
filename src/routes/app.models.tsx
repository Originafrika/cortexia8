import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MODELS, basePrice, unitLabel, type ModelCategory, type Model } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/models")({
  component: ModelsCatalog,
});

const CATS: { key: ModelCategory | "all"; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "image", label: "Image" },
  { key: "video", label: "Vidéo" },
  { key: "audio", label: "Voix" },
  { key: "text", label: "Texte" },
];

function ModelsCatalog() {
  const [cat, setCat] = useState<ModelCategory | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return MODELS.filter((m) => (cat === "all" || m.category === cat) &&
      (q.trim() === "" || m.name.toLowerCase().includes(q.toLowerCase()) || m.provider.toLowerCase().includes(q.toLowerCase())));
  }, [cat, q]);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Catalogue</div>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-[-0.03em]">Tous les modèles disponibles.</h1>
          <p className="mt-2 text-muted-foreground">Prix affichés déjà majorés — pas de surprise à la facturation.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kling, Claude, ElevenLabs…"
            className="rounded-full border border-border bg-surface-1/70 pl-9 pr-4 py-2 text-sm w-64 focus:border-amber/40"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATS.map((c) => {
          const active = cat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                active ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border bg-surface-1/50 text-muted-foreground hover:text-foreground hover:border-border-strong"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => <ModelCard key={m.slug} m={m} />)}
      </div>
      {filtered.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">Aucun modèle ne correspond.</div>
      )}
    </div>
  );
}

function ModelCard({ m }: { m: Model }) {
  return (
    <Link
      to="/app/models/$slug"
      params={{ slug: m.slug }}
      className="group surface-gradient-border rounded-2xl bg-surface-1/60 backdrop-blur p-5 hover:bg-surface-1/80 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_oklch(0.78_0.16_70_/_0.25)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-[-0.01em]">{m.name}</span>
            {m.badge && (
              <span className={
                "rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider " +
                (m.badge === "popular" ? "bg-amber/20 text-amber-soft" : m.badge === "new" ? "bg-emerald/20 text-emerald" : "bg-surface-3 text-muted-foreground")
              }>{m.badge === "popular" ? "Populaire" : m.badge === "new" ? "Nouveau" : "Pro"}</span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {m.provider} · {m.category}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-2">{m.blurb}</p>
      <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
        <PriceDisplay usd={basePrice(m)} className="font-display text-2xl tracking-[-0.02em]" emphasize />
        <span className="text-[11px] text-muted-foreground font-mono">{unitLabel(m)}</span>
      </div>
    </Link>
  );
}
