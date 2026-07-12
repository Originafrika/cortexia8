import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getModel, basePrice, unitLabel, type Model, type ParamSpec } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import {
  ArrowLeft,
  Play,
  Sparkles,
  RefreshCw,
  Download,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/models/$slug")({
  loader: ({ params }) => {
    const m = getModel(params.slug);
    if (!m) throw notFound();
    return { model: m };
  },
  component: ModelPlayground,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <AlertTriangle className="mx-auto size-8 text-amber" />
      <h1 className="mt-4 font-display text-3xl">Une erreur est survenue.</h1>
      <p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
      <Link to="/app/models" className="mt-6 inline-flex text-amber-soft hover:underline">
        Retour au catalogue
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Modèle introuvable.</h1>
      <Link to="/app/models" className="mt-4 inline-flex text-amber-soft hover:underline">
        Retour au catalogue
      </Link>
    </div>
  ),
});

type Status = "idle" | "loading" | "success" | "error";

type Result = {
  model: Model;
  prompt: string;
  cost: number;
  tint: string;
  ratio: string;
};

const TINTS = ["#3d2a1e", "#2a1e3d", "#1e3d2a", "#3d1e2a", "#2a3d1e", "#1e2a3d"];

function ModelPlayground() {
  const { model } = Route.useLoaderData();
  return <ModelPlaygroundContent model={model} />;
}

export function ModelPlaygroundContent({
  model,
  isModal = false,
}: {
  model: Model;
  isModal?: boolean;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    model.params.forEach((p: ParamSpec) => {
      if (p.kind === "slider") init[p.key] = p.default;
      if (p.kind === "select") init[p.key] = p.options[0];
      if (p.kind === "toggle") init[p.key] = !!p.default;
    });
    return init;
  });

  // Reset when navigating between models
  useEffect(() => {
    setPrompt("");
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
    const init: Record<string, unknown> = {};
    model.params.forEach((p: ParamSpec) => {
      if (p.kind === "slider") init[p.key] = p.default;
      if (p.kind === "select") init[p.key] = p.options[0];
      if (p.kind === "toggle") init[p.key] = !!p.default;
    });
    setState(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.slug]);

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const timers = useRef<number[]>([]);

  const currentPrice = useMemo(() => estimatePrice(model, state), [model, state]);

  const simple: ParamSpec[] = model.params.filter(
    (p: ParamSpec) => !("advanced" in p) || !p.advanced,
  );
  const adv: ParamSpec[] = model.params.filter((p: ParamSpec) => "advanced" in p && !!p.advanced);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function generate() {
    if (status === "loading") return;
    if (model.params.some((p: ParamSpec) => p.kind === "prompt") && prompt.trim().length < 3) {
      setStatus("error");
      setError("Ajoute un prompt d'au moins quelques mots pour lancer la génération.");
      return;
    }
    clearTimers();
    setStatus("loading");
    setError(null);
    setProgress(0);
    // Realistic duration by category
    const duration =
      model.category === "video"
        ? 4200
        : model.category === "audio"
          ? 2600
          : model.category === "text"
            ? 1800
            : 2200;
    const steps = 40;
    for (let i = 1; i <= steps; i++) {
      timers.current.push(
        window.setTimeout(
          () => {
            setProgress(Math.round((i / steps) * 100));
          },
          (duration / steps) * i,
        ),
      );
    }
    timers.current.push(
      window.setTimeout(() => {
        setStatus("success");
        setResult({
          model,
          prompt: prompt || "(sans prompt)",
          cost: currentPrice,
          tint: TINTS[Math.floor(Math.random() * TINTS.length)],
          ratio:
            (state.ratio as string) === "9:16"
              ? "aspect-[9/16]"
              : (state.ratio as string) === "16:9"
                ? "aspect-video"
                : (state.ratio as string) === "3:4"
                  ? "aspect-[3/4]"
                  : (state.ratio as string) === "4:3"
                    ? "aspect-[4/3]"
                    : "aspect-square",
        });
      }, duration + 60),
    );
  }

  useEffect(() => () => clearTimers(), []);

  return (
    <div
      className={cn(
        "mx-auto",
        isModal
          ? "p-0"
          : "max-w-6xl px-5 sm:px-8 py-6 lg:h-[calc(100vh-3.5rem)] lg:flex lg:flex-col lg:overflow-hidden",
      )}
    >
      {!isModal && (
        <div className="shrink-0">
          <Link
            to="/app/models"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Catalogue
          </Link>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {model.provider} · {model.category}
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl tracking-[-0.03em] truncate">
                {model.name}
              </h1>
              <p className="mt-1 text-muted-foreground max-w-xl text-xs truncate">{model.blurb}</p>
            </div>
            <div className="text-right shrink-0">
              <PriceDisplay
                usd={currentPrice}
                className="font-display text-2xl sm:text-3xl tracking-[-0.02em]"
                emphasize
              />
              <div className="text-xs text-muted-foreground font-mono">{unitLabel(model)}</div>
            </div>
          </div>
        </div>
      )}

      {isModal && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between shrink-0 mb-6">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {model.provider} · {model.category}
            </div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl tracking-[-0.03em] truncate">
              {model.name}
            </h1>
            <p className="mt-1 text-muted-foreground max-w-xl text-xs truncate">{model.blurb}</p>
          </div>
          <div className="text-right shrink-0">
            <PriceDisplay
              usd={currentPrice}
              className="font-display text-2xl sm:text-3xl tracking-[-0.02em]"
              emphasize
            />
            <div className="text-xs text-muted-foreground font-mono">{unitLabel(model)}</div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "mt-6 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]",
          isModal
            ? "lg:h-[60vh] lg:overflow-hidden"
            : "lg:flex-1 lg:min-h-0 lg:overflow-hidden pb-4",
        )}
      >
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Paramètres
            </div>
            {adv.length > 0 && (
              <div className="flex items-center gap-1 rounded-full border border-border bg-surface-2/60 p-0.5 text-xs">
                <button
                  onClick={() => setAdvanced(false)}
                  className={
                    "rounded-full px-3 py-1 transition cursor-pointer " +
                    (!advanced ? "bg-amber text-primary-foreground" : "text-muted-foreground")
                  }
                >
                  Simple
                </button>
                <button
                  onClick={() => setAdvanced(true)}
                  className={
                    "rounded-full px-3 py-1 transition cursor-pointer " +
                    (advanced ? "bg-amber text-primary-foreground" : "text-muted-foreground")
                  }
                >
                  Avancé
                </button>
              </div>
            )}
          </div>
          <div className="space-y-5 flex-1 lg:overflow-y-auto pr-1">
            {simple.map((p: ParamSpec, i: number) => (
              <Field
                key={i}
                p={p}
                state={state}
                setState={setState}
                prompt={prompt}
                setPrompt={setPrompt}
              />
            ))}
            <motion.div
              initial={false}
              animate={{ height: advanced ? "auto" : 0, opacity: advanced ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-5"
            >
              {adv.map((p: ParamSpec, i: number) => (
                <Field
                  key={i}
                  p={p}
                  state={state}
                  setState={setState}
                  prompt={prompt}
                  setPrompt={setPrompt}
                />
              ))}
            </motion.div>
          </div>

          <button
            onClick={generate}
            disabled={status === "loading"}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Génération… {progress}%
              </>
            ) : (
              <>
                <Play className="size-4" /> Générer —{" "}
                <PriceDisplay usd={currentPrice} className="text-sm" />
              </>
            )}
          </button>
        </div>

        <div className="lg:h-full lg:overflow-y-auto pr-1 space-y-6">
          <ResultPanel
            status={status}
            progress={progress}
            error={error}
            result={result}
            model={model}
            onRetry={generate}
            onReset={() => {
              setStatus("idle");
              setResult(null);
              setError(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ResultPanel({
  status,
  progress,
  error,
  result,
  model,
  onRetry,
  onReset,
}: {
  status: Status;
  progress: number;
  error: string | null;
  result: Result | null;
  model: Model;
  onRetry: () => void;
  onReset: () => void;
}) {
  const ratioClass = result?.ratio ?? "aspect-square";
  return (
    <div className="space-y-4">
      <div
        className={
          "surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden relative grid place-items-center " +
          ratioClass
        }
      >
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center px-6"
            >
              <Sparkles className="size-6 mx-auto text-amber" />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Zone de résultat
              </div>
              <div className="mt-1 text-sm text-foreground/70">
                Ton rendu apparaîtra ici après génération.
              </div>
            </motion.div>
          )}
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,oklch(0.78_0.16_70_/_0.18)_50%,transparent_80%)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]" />
              <div className="absolute inset-0 grid place-items-center text-center px-6">
                <div>
                  <Loader2 className="size-6 mx-auto text-amber animate-spin" />
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {model.category === "video"
                      ? "Rendu vidéo"
                      : model.category === "audio"
                        ? "Synthèse vocale"
                        : model.category === "text"
                          ? "Rédaction"
                          : "Rendu image"}
                  </div>
                  <div className="mt-1 text-sm text-foreground/80">{progress}%</div>
                  <div className="mt-3 mx-auto w-40 h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-amber transition-[width] duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center px-6"
            >
              <AlertTriangle className="size-6 mx-auto text-amber" />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
                Échec
              </div>
              <div className="mt-1 text-sm text-foreground/80 max-w-xs mx-auto">{error}</div>
              <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-3 py-1.5 text-xs text-amber-soft hover:bg-amber/20 transition cursor-pointer"
              >
                <RefreshCw className="size-3.5" /> Réessayer
              </button>
            </motion.div>
          )}
          {status === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${result.tint}, oklch(0.14 0 0))` }}
            >
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div className="rounded-full bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-mono uppercase tracking-wider">
                  {model.category}
                </div>
                <div className="rounded-full bg-black/60 backdrop-blur px-2 py-1">
                  <PriceDisplay usd={result.cost} className="text-[10px]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === "success" && result && (
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-4 space-y-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Prompt
            </div>
            <div className="mt-1 text-sm text-foreground/90 line-clamp-3">{result.prompt}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/40 px-3 py-2 text-xs hover:border-amber/40 transition cursor-pointer"
            >
              <RefreshCw className="size-3.5" /> Régénérer
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-95 transition cursor-pointer">
              <Download className="size-3.5" /> Télécharger
            </button>
          </div>
          <button
            onClick={onReset}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Nouvelle génération
          </button>
        </div>
      )}

      {status === "idle" && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Exemples
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["#3d2a1e", "#1e2a3d", "#2a3d1e"].map((c, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border border-border"
                style={{ background: `linear-gradient(135deg, ${c}, transparent)` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  p,
  state,
  setState,
  prompt,
  setPrompt,
}: {
  p: ParamSpec;
  state: Record<string, unknown>;
  setState: (fn: (s: Record<string, unknown>) => Record<string, unknown>) => void;
  prompt: string;
  setPrompt: (v: string) => void;
}) {
  if (p.kind === "prompt") {
    return (
      <label className="block">
        <div className="text-xs text-muted-foreground mb-1.5">{p.label}</div>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={p.placeholder}
          className="w-full rounded-xl border border-border bg-surface-0/60 px-4 py-3 text-sm outline-none focus:border-amber/50 resize-none"
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
                "rounded-full border px-3 py-1 text-xs transition cursor-pointer " +
                (val === o
                  ? "border-amber/60 bg-amber/15 text-amber-soft"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {o}
            </button>
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
          <span className="font-mono tabular text-xs">
            {val}
            {p.suffix || ""}
          </span>
        </div>
        <input
          type="range"
          min={p.min}
          max={p.max}
          step={p.step}
          value={val}
          onChange={(e) => setState((s) => ({ ...s, [p.key]: parseFloat(e.target.value) }))}
          className="w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3 cursor-pointer"
        />
      </div>
    );
  }
  if (p.kind === "seed") {
    return (
      <label className="block">
        <div className="text-xs text-muted-foreground mb-1.5">{p.label}</div>
        <input
          placeholder="aléatoire"
          className="w-full rounded-xl border border-border bg-surface-0/60 px-4 py-2 text-sm font-mono outline-none focus:border-amber/50"
        />
      </label>
    );
  }
  if (p.kind === "toggle") {
    const val = !!state[p.key];
    return (
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <span className="text-sm">{p.label}</span>
        <button
          onClick={() => setState((s) => ({ ...s, [p.key]: !val }))}
          className={
            "relative h-5 w-9 rounded-full transition cursor-pointer " +
            (val ? "bg-amber" : "bg-surface-3")
          }
        >
          <span
            className={
              "absolute top-0.5 size-4 rounded-full bg-background transition-transform " +
              (val ? "translate-x-4" : "translate-x-0.5")
            }
          />
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
