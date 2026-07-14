import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getModel, basePrice, unitLabel, MODELS, type Model, type ParamSpec, modelsByCategory } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import {
  ArrowLeft,
  Play,
  Sparkles,
  RefreshCw,
  Download,
  AlertTriangle,
  Loader2,
  MoreVertical,
  ChevronDown,
  Upload,
  MessageSquare,
  Lightbulb,
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
  id: string;
  model: Model;
  prompt: string;
  cost: number;
  tint: string;
  ratio: string;
  state: Record<string, unknown>;
  timestamp: Date;
};

const TINTS = ["#3d2a1e", "#2a1e3d", "#1e3d2a", "#3d1e2a", "#2a3d1e", "#1e2a3d"];

function ModelPlayground() {
  const { model } = Route.useLoaderData();
  return <ModelPlaygroundContent model={model} />;
}

const FAOS: Record<string, { q: string; r: string }[]> = {
  image: [
    { q: "Quels sont les meilleurs modèles image ?", r: "Seedream 5.0 Pro pour le texte dans l'image, Nano Banana 2 pour l'édition conversationnelle, GPT Image 2 pour la typographie." },
    { q: "Puis-je utiliser ma propre image comme référence ?", r: "Oui, upload une image de référence dans le champ dédié. Les formats JPG, PNG et WebP sont supportés." },
    { q: "Quelle résolution choisir ?", r: "1K pour les tests, 2K pour le web, 4K pour l'impression. Le prix augmente avec la résolution." },
  ],
  video: [
    { q: "Quelle durée de vidéo puis-je générer ?", r: "De 2 à 10 secondes selon le modèle. Seedance et Kling sont les plus rapides pour des vidéos courtes." },
    { q: "Puis-je ajouter du son ?", r: "Oui, active l'option Audio dans les paramètres avancés. Kling 3.0 Standard et Pro incluent l'audio synchronisé." },
    { q: "Quel format pour l'image de départ ?", r: "JPG, PNG ou WebP. L'image sera redimensionnée automatiquement." },
  ],
  audio: [
    { q: "Quelles voix sont disponibles ?", r: "Plusieurs voix par langue : français (Amara, Julien), anglais (Wei), portugais (Rio). D'autres langues sont disponibles." },
    { q: "Combien de caractères puis-je générer ?", r: "Pas de limite stricte. Le prix est calculé par tranche de 1000 caractères." },
    { q: "Puis-je contrôler le style vocal ?", r: "Oui, les paramètres Stabilité et Style dans les options avancées permettent d'ajuster le rendu." },
  ],
  text: [
    { q: "Quel modèle choisir pour du texte long ?", r: "Claude Fable 5 pour la narration, Claude Opus 4.8 pour l'analyse stratégique." },
    { q: "Quel est le moins cher ?", r: "Gemini 2.5 Flash est le plus économique à 0,113 $/M tokens en entrée." },
    { q: "Puis-je utiliser un prompt système ?", r: "Oui, le champ Prompt système + message permet de définir le contexte avant votre message." },
  ],
};

function ModelPlaygroundContent({
  model,
  isModal = false,
}: {
  model: Model;
  isModal?: boolean;
}) {
  const [currentModel, setCurrentModel] = useState<Model>(model);
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
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setCurrentModel(model);
  }, [model]);

  useEffect(() => {
    setPrompt("");
    setStatus("idle");
    setResult(null);
    setHistory([]);
    setSelectedHistoryItem(null);
    setError(null);
    setProgress(0);
    setFiles([]);
    const init: Record<string, unknown> = {};
    currentModel.params.forEach((p: ParamSpec) => {
      if (p.kind === "slider") init[p.key] = p.default;
      if (p.kind === "select") init[p.key] = p.options[0];
      if (p.kind === "toggle") init[p.key] = !!p.default;
    });
    setState(init);
  }, [currentModel.slug]);

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const timers = useRef<number[]>([]);

  const currentPrice = useMemo(() => estimatePrice(currentModel, state), [currentModel, state]);

  const simple: ParamSpec[] = currentModel.params.filter(
    (p: ParamSpec) => !("advanced" in p) || !p.advanced,
  );
  const adv: ParamSpec[] = currentModel.params.filter(
    (p: ParamSpec) => "advanced" in p && !!p.advanced,
  );

  const faq = FAOS[currentModel.category] ?? FAOS.image;

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function loadHistoryItem(item: Result) {
    setPrompt(item.prompt);
    setState(item.state);
    setResult(item);
    setSelectedHistoryItem(item);
    setStatus("success");
    setError(null);
  }

  function regenerateItem(item: Result) {
    setPrompt(item.prompt);
    setState(item.state);
    setCurrentModel(item.model);
    setTimeout(() => {
      generate();
    }, 80);
  }

  function loadReferenceItem(item: Result) {
    setPrompt(item.prompt);
    setState(item.state);
    setCurrentModel(item.model);
  }

  function generate() {
    if (status === "loading") return;
    if (
      currentModel.params.some((p: ParamSpec) => p.kind === "prompt") &&
      prompt.trim().length < 3
    ) {
      setStatus("error");
      setError("Ajoute un prompt d'au moins quelques mots pour lancer la génération.");
      return;
    }
    clearTimers();
    setStatus("loading");
    setError(null);
    setProgress(0);
    setSelectedHistoryItem(null);
    const duration =
      currentModel.category === "video"
        ? 4200
        : currentModel.category === "audio"
          ? 2600
          : currentModel.category === "text"
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
        const newResult: Result = {
          id: Math.random().toString(36).substring(7),
          model: currentModel,
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
          state: { ...state },
          timestamp: new Date(),
        };
        setResult(newResult);
        setSelectedHistoryItem(newResult);
        setHistory((prev) => [newResult, ...prev]);
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
          : "w-full px-4 sm:px-6 py-4 lg:h-[calc(100vh-3.5rem)]",
      )}
    >
      {!isModal && (
        <div className="shrink-0 mb-4">
          <Link
            to="/app/models"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Catalogue
          </Link>
        </div>
      )}

      <div className="lg:flex lg:gap-6 lg:h-[calc(100%-2rem)]">
        <div className="lg:w-[420px] lg:shrink-0 lg:sticky lg:top-0 lg:self-start lg:max-h-full lg:flex lg:flex-col">
          <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-5 lg:flex lg:flex-col lg:h-full">
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

            <div className="space-y-4 flex-1 overflow-y-auto pr-1 min-h-0">
              {simple.map((p: ParamSpec, i: number) => (
                <Field
                  key={i}
                  p={p}
                  state={state}
                  setState={setState}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  currentModel={currentModel}
                  setCurrentModel={setCurrentModel}
                  files={files}
                  setFiles={setFiles}
                />
              ))}

              {adv.length > 0 && (
                <div>
                  <button
                    onClick={() => setAdvanced((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2/40 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
                  >
                    <span>Paramètres avancés ({adv.length})</span>
                    <ChevronDown
                      className={cn("size-3.5 transition", advanced && "rotate-180")}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {advanced && (
                      <motion.div
                        key="advanced"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden space-y-4 pt-3"
                      >
                        {adv.map((p: ParamSpec, i: number) => (
                          <Field
                            key={i}
                            p={p}
                            state={state}
                            setState={setState}
                            prompt={prompt}
                            setPrompt={setPrompt}
                            currentModel={currentModel}
                            setCurrentModel={setCurrentModel}
                            files={files}
                            setFiles={setFiles}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="mt-4 shrink-0 pt-4 border-t border-border">
              <button
                onClick={generate}
                disabled={status === "loading"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
          </div>
        </div>

        <div className="flex-1 lg:overflow-y-auto lg:min-h-0 mt-6 lg:mt-0 space-y-6 pb-8">
          <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {currentModel.provider} · {currentModel.category}
            </div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl tracking-[-0.03em] text-amber-soft">
              {currentModel.name}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm max-w-xl">
              {currentModel.blurb}
            </p>
            <div className="mt-3">
              <PriceDisplay
                usd={currentPrice}
                className="font-display text-2xl tracking-[-0.02em]"
                emphasize
              />
              <span className="text-xs text-muted-foreground font-mono ml-1">
                {unitLabel(currentModel)}
              </span>
            </div>
          </div>

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
            history={history}
            onSelectHistory={loadHistoryItem}
            onRegenerateItem={regenerateItem}
            onSetPrompt={setPrompt}
            onLoadReference={loadReferenceItem}
            selectedHistoryItem={selectedHistoryItem}
            setSelectedHistoryItem={setSelectedHistoryItem}
          />

          {history.length === 0 && status === "idle" && (
            <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="size-4 text-amber" />
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Questions fréquentes
                </div>
              </div>
              <div className="space-y-3">
                {faq.slice(0, 3).map((item, i) => (
                  <details key={i} className="group">
                    <summary className="flex cursor-pointer items-start gap-2 text-sm text-foreground/80 hover:text-foreground list-none">
                      <Lightbulb className="size-3.5 mt-0.5 shrink-0 text-amber/60" />
                      <span>{item.q}</span>
                    </summary>
                    <p className="mt-2 ml-5.5 text-xs text-muted-foreground leading-relaxed">
                      {item.r}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
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
  history,
  onSelectHistory,
  onRegenerateItem,
  onSetPrompt,
  onLoadReference,
  selectedHistoryItem,
  setSelectedHistoryItem,
}: {
  status: Status;
  progress: number;
  error: string | null;
  result: Result | null;
  model: Model;
  onRetry: () => void;
  onReset: () => void;
  history: Result[];
  onSelectHistory: (item: Result) => void;
  onRegenerateItem?: (item: Result) => void;
  onSetPrompt?: (v: string) => void;
  onLoadReference?: (item: Result) => void;
  selectedHistoryItem: Result | null;
  setSelectedHistoryItem: (item: Result | null) => void;
}) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const isFocusedView = selectedHistoryItem !== null && status !== "loading";

  if (status === "loading") {
    return (
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden relative grid place-items-center aspect-square">
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
      </div>
    );
  }

  if (isFocusedView) {
    const item = selectedHistoryItem;
    const ratioClass = item.ratio ?? "aspect-square";
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedHistoryItem(null)}
            className="inline-flex items-center gap-1.5 text-xs text-amber-soft hover:underline cursor-pointer"
          >
            ← Retour aux générations
          </button>
          <div className="text-[10px] font-mono text-muted-foreground">
            Modèle utilisé : {item.model.name}
          </div>
        </div>

        <div
          className={
            "surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden relative grid place-items-center " +
            ratioClass
          }
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${item.tint}, oklch(0.14 0 0))` }}
          >
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div className="rounded-full bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-mono uppercase tracking-wider">
                {item.model.category}
              </div>
              <div className="rounded-full bg-black/60 backdrop-blur px-2 py-1">
                <PriceDisplay usd={item.cost} className="text-[10px]" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-4 space-y-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Prompt
            </div>
            <div className="mt-1 text-sm text-foreground/90">{item.prompt}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onRegenerateItem && (
              <button
                onClick={() => onRegenerateItem(item)}
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/40 px-3 py-2 text-xs hover:border-amber/40 transition cursor-pointer"
              >
                <RefreshCw className="size-3.5" /> Régénérer
              </button>
            )}
            {onSetPrompt && (
              <button
                onClick={() => {
                  onSetPrompt(item.prompt);
                }}
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber/30 bg-amber/5 px-3 py-2 text-xs hover:bg-amber/10 transition text-amber-soft cursor-pointer"
              >
                <Sparkles className="size-3.5" /> Prendre comme réf
              </button>
            )}
            <button className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-95 transition cursor-pointer">
              <Download className="size-3.5" /> Télécharger
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Grille de session ({history.length})
          </div>
          <button
            onClick={onReset}
            className="text-xs text-amber-soft hover:underline cursor-pointer"
          >
            + Nouvelle génération
          </button>
        </div>
      )}

      {history.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {history.map((item) => {
            const isMenuOpen = activeMenuId === item.id;
            return (
              <div
                key={item.id}
                className="relative aspect-square rounded-xl border border-border overflow-hidden group hover:border-amber/40 transition duration-200"
                style={{ background: `linear-gradient(135deg, ${item.tint}, oklch(0.14 0 0))` }}
              >
                <button
                  onClick={() => onSelectHistory(item)}
                  className="absolute inset-0 w-full h-full text-left cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-white bg-black/70 px-2 py-1 rounded shadow">
                      Ouvrir
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-[9px] font-mono text-white/90 bg-black/60 backdrop-blur px-1.5 py-1 rounded truncate">
                    {item.prompt}
                  </div>
                </button>

                <div className="absolute top-1.5 right-1.5 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : item.id);
                    }}
                    className="p-1 rounded-lg bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition cursor-pointer"
                  >
                    <MoreVertical className="size-3.5" />
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute right-0 mt-1 w-32 rounded-lg bg-surface-2 border border-border shadow-xl p-1 text-xs text-foreground"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectHistory(item);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer"
                        >
                          Ouvrir
                        </button>
                        {onRegenerateItem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegenerateItem(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer text-amber-soft"
                          >
                            Régénérer
                          </button>
                        )}
                        {onLoadReference && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLoadReference(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer text-amber-soft"
                          >
                            Prendre comme réf
                          </button>
                        )}
                        {onSetPrompt && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetPrompt(item.prompt);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer"
                          >
                            Utiliser Prompt
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Simulé : téléchargement lancé.");
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer"
                        >
                          Télécharger
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden relative grid place-items-center aspect-square">
            <div className="text-center px-6">
              <Sparkles className="size-6 mx-auto text-amber" />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Zone de résultat
              </div>
              <div className="mt-1 text-sm text-foreground/70">
                Ton rendu apparaîtra ici après génération.
              </div>
            </div>
          </div>

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
  currentModel,
  setCurrentModel,
  files,
  setFiles,
}: {
  p: ParamSpec;
  state: Record<string, unknown>;
  setState: (fn: (s: Record<string, unknown>) => Record<string, unknown>) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  currentModel?: Model;
  setCurrentModel?: (m: Model) => void;
  files?: File[];
  setFiles?: (f: File[]) => void;
}) {
  if (p.kind === "prompt") {
    return (
      <label className="block">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{p.label}</span>
          {setCurrentModel && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-mono">Modèle:</span>
              <select
                value={currentModel?.slug}
                onChange={(e) => {
                  const found = MODELS.find((m) => m.slug === e.target.value);
                  if (found) setCurrentModel(found);
                }}
                className="bg-surface-3 border border-border text-[11px] rounded px-1.5 py-0.5 outline-none focus:border-amber text-foreground cursor-pointer"
              >
                <optgroup label="Images">
                  {MODELS.filter((m) => m.category === "image").map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Vidéos">
                  {MODELS.filter((m) => m.category === "video").map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Audios">
                  {MODELS.filter((m) => m.category === "audio").map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="LLM / Texte">
                  {MODELS.filter((m) => m.category === "text").map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}
        </div>
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
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="block">
        <div className="text-xs text-muted-foreground mb-1.5">{p.label}</div>
        <input
          ref={inputRef}
          type="file"
          accept={p.accepts}
          multiple={p.multiple}
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            if (selected.length > 0) {
              setFiles?.(p.multiple ? [...(files || []), ...selected] : selected);
            }
          }}
          className="hidden"
        />
        <div
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-dashed border-border bg-surface-0/40 px-4 py-5 text-center cursor-pointer hover:border-amber/40 transition"
        >
          {files && files.length > 0 ? (
            <div className="space-y-1">
              {files.map((f, i) => (
                <div key={i} className="text-xs text-foreground/80 truncate">
                  {f.name}
                </div>
              ))}
              <div className="text-[10px] text-amber-soft">
                {p.multiple ? "Ajouter d'autres fichiers" : "Changer de fichier"}
              </div>
            </div>
          ) : (
            <div>
              <Upload className="size-5 mx-auto text-muted-foreground mb-1" />
              <div className="text-sm text-muted-foreground">
                Glisse un fichier ou clique pour choisir
              </div>
              {p.accepts && (
                <div className="text-[10px] text-muted-foreground/60 mt-1">
                  {p.accepts.replace(/\*/g, "")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
