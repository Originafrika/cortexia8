import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getModel, basePrice, unitLabel, type Model, type ParamSpec } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/models/$slug")({
  loader: ({ params }) => {
    const m = getModel(params.slug);
    if (!m) throw notFound();
    return { model: m };
  },
  component: ModelPlayground,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Modèle introuvable.</h1>
      <Link to="/app/models" className="mt-4 inline-flex text-amber-soft hover:underline">Retour au catalogue</Link>
    </div>
  ),
});

function ModelPlayground() {
  const { model } = Route.useLoaderData();
  const [advanced, setAdvanced] = useState(false);
  const [state, setState] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    model.params.forEach((p: ParamSpec) => {
      if (p.kind === "slider") init[p.key] = p.default;
      if (p.kind === "select") init[p.key] = p.options[0];
      if (p.kind === "toggle") init[p.key] = !!p.default;
    });
    return init;
  });

  const currentPrice = useMemo(() => estimatePrice(model, state), [model, state]);

  const simple: ParamSpec[] = model.params.filter((p: ParamSpec) => !("advanced" in p) || !p.advanced);
  const adv: ParamSpec[] = model.params.filter((p: ParamSpec) => "advanced" in p && !!p.advanced);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
      <Link to="/app/models" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Catalogue
      </Link>

      <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{model.provider} · {model.category}</div>
          <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">{model.name}</h1>
          <p className="mt-1 text-muted-foreground max-w-xl">{model.blurb}</p>
        </div>
        <div className="text-right">
          <PriceDisplay usd={currentPrice} className="font-display text-3xl tracking-[-0.02em]" emphasize />
          <div className="text-xs text-muted-foreground font-mono">{unitLabel(model)}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Paramètres</div>
            <div className="flex items-center gap-1 rounded-full border border-border bg-surface-2/60 p-0.5 text-xs">
              <button onClick={() => setAdvanced(false)} className={"rounded-full px-3 py-1 transition " + (!advanced ? "bg-amber text-primary-foreground" : "text-muted-foreground")}>Simple</button>
              <button onClick={() => setAdvanced(true)} className={"rounded-full px-3 py-1 transition " + (advanced ? "bg-amber text-primary-foreground" : "text-muted-foreground")}>Avancé</button>
            </div>
          </div>
          <div className="space-y-5">
            {simple.map((p: ParamSpec, i: number) => <Field key={i} p={p} state={state} setState={setState} />)}
            <motion.div
              initial={false}
              animate={{ height: advanced ? "auto" : 0, opacity: advanced ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-5"
            >
              {adv.map((p: ParamSpec, i: number) => <Field key={i} p={p} state={state} setState={setState} />)}
            </motion.div>
          </div>
          <button className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition">
            <Play className="size-4" /> Générer — <PriceDisplay usd={currentPrice} className="text-sm" />
          </button>
        </div>

        <div>
          <div className="surface-gradient-border rounded-2xl bg-surface-1/60 aspect-square grid place-items-center overflow-hidden">
            <div className="text-center px-6">
              <Sparkles className="size-6 mx-auto text-amber" />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Zone de résultat</div>
              <div className="mt-1 text-sm text-foreground/70">Ton rendu apparaîtra ici après génération.</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Exemples</div>
            <div className="grid grid-cols-3 gap-2">
              {["#3d2a1e", "#1e2a3d", "#2a3d1e"].map((c, i) => (
                <div key={i} className="aspect-square rounded-lg border border-border" style={{ background: `linear-gradient(135deg, ${c}, transparent)` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ p, state, setState }: { p: ParamSpec; state: Record<string, unknown>; setState: (fn: (s: Record<string, unknown>) => Record<string, unknown>) => void }) {
  if (p.kind === "prompt") {
    return (
      <label className="block">
        <div className="text-xs text-muted-foreground mb-1.5">{p.label}</div>
        <textarea
          rows={3}
          placeholder={p.placeholder}
          className="w-full rounded-xl border border-border bg-surface-0/60 px-4 py-3 text-sm outline-none focus:border-amber/50"
        />
      </label>
    );
  }
  if (p.kind === "upload") {
    return (
      <label className="block">
        <div className="text-xs text-muted-foreground mb-1.5">{p.label}</div>
        <div className="rounded-xl border border-dashed border-border bg-surface-0/40 px-4 py-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-amber/40">
          Glisse un fichier ou clique pour choisir
        </div>
      </label>
    );
  }
  if (p.kind === "select") {
    const val = state[p.key] as string;
    return (
      <div>
        <div className="text-xs text-muted-foreground mb-1.5">{p.label}</div>
        <div className="flex flex-wrap gap-1.5">
          {p.options.map((o) => (
            <button
              key={o}
              onClick={() => setState((s) => ({ ...s, [p.key]: o }))}
              className={
                "rounded-full border px-3 py-1 text-xs transition " +
                (val === o ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border text-muted-foreground hover:text-foreground")
              }
            >{o}</button>
          ))}
        </div>
      </div>
    );
  }
  if (p.kind === "slider") {
    const val = state[p.key] as number;
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{p.label}</span>
          <span className="font-mono tabular text-xs">{val}{p.suffix || ""}</span>
        </div>
        <input
          type="range"
          min={p.min} max={p.max} step={p.step} value={val}
          onChange={(e) => setState((s) => ({ ...s, [p.key]: parseFloat(e.target.value) }))}
          className="w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3"
        />
      </div>
    );
  }
  if (p.kind === "seed") {
    return (
      <label className="block">
        <div className="text-xs text-muted-foreground mb-1.5">{p.label}</div>
        <input placeholder="aléatoire" className="w-full rounded-xl border border-border bg-surface-0/60 px-4 py-2 text-sm font-mono outline-none focus:border-amber/50" />
      </label>
    );
  }
  if (p.kind === "toggle") {
    const val = !!state[p.key];
    return (
      <label className="flex items-center justify-between gap-4">
        <span className="text-sm">{p.label}</span>
        <button
          onClick={() => setState((s) => ({ ...s, [p.key]: !val }))}
          className={"relative h-5 w-9 rounded-full transition " + (val ? "bg-amber" : "bg-surface-3")}
        >
          <span className={"absolute top-0.5 size-4 rounded-full bg-background transition-transform " + (val ? "translate-x-4" : "translate-x-0.5")} />
        </button>
      </label>
    );
  }
  return null;
}

function estimatePrice(m: Model, state: Record<string, unknown>): number {
  let unit = basePrice(m);
  if (m.tiers) {
    const res = state.resolution as string | undefined;
    const found = m.tiers.find((t) => t.label === res);
    if (found) unit = found.priceUSD;
  }
  if (m.unit === "second") {
    const d = (state.duration as number) || 5;
    return unit * d;
  }
  return unit;
}
