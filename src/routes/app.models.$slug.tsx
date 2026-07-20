import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getModel, basePrice, unitLabel, MODELS, type Model, type ParamSpec } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import {
  ArrowLeft,
  ArrowUp,
  Sparkles,
  RefreshCw,
  Download,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Ratio,
  Palette,
  Clock,
  Dice5,
  Volume2,
  Upload,
  SlidersHorizontal,
  Settings2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { generate } from "@/lib/api/generate";
import { generationStatus } from "@/lib/api/generation-status";

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
  resultUrl: string | null;
  runId: number | null;
  state: Record<string, unknown>;
  timestamp: Date;
};

function iconForParam(key: string, kind: ParamSpec["kind"]) {
  if (kind === "upload") return Upload;
  if (kind === "seed") return Dice5;
  if (key === "ratio") return Ratio;
  if (key === "resolution") return ImageIcon;
  if (key === "style") return Palette;
  if (key === "duration") return Clock;
  if (key === "audio" || key === "voice" || key === "lang") return Volume2;
  return SlidersHorizontal;
}


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
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<Record<string, unknown>>(() => initState(model));

  useEffect(() => {
    setPrompt("");
    setStatus("idle");
    setHistory([]);
    setError(null);
    setProgress(0);
    setActiveId(null);
    setState(initState(model));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.slug]);

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentPrice = useMemo(() => estimatePrice(model, state), [model, state]);
  const hasPrompt = model.params.some((p) => p.kind === "prompt");
  const active = history.find((h) => h.id === activeId) ?? null;

  const canGenerate = useMemo(() => {
    for (const p of model.params) {
      if (!p.required) continue;
      if (p.kind === "prompt") {
        if (prompt.trim().length < 3) return false;
      } else if (p.kind === "upload") {
        const val = state[p.key ?? ""] ?? [];
        if (!Array.isArray(val) || val.length === 0) return false;
      } else if ("key" in p && p.key) {
        const val = state[p.key];
        if (val === undefined || val === null || val === "") return false;
      }
    }
    return true;
  }, [model.params, prompt, state]);

  const iconParams = model.params.filter((p) => {
    if (p.kind === "prompt") return false;
    if (!showAdvanced && "advanced" in p && p.advanced) return false;
    return true;
  });

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function handleGenerate() {
    if (status === "loading") return;

    const missingFields: string[] = [];
    for (const p of model.params) {
      if (!p.required) continue;
      if (p.kind === "prompt") {
        if (prompt.trim().length < 3) missingFields.push(p.label);
      } else if (p.kind === "upload") {
        const val = state[p.key ?? ""] ?? [];
        if (!Array.isArray(val) || val.length === 0) missingFields.push(p.label);
      } else if ("key" in p && p.key) {
        const val = state[p.key];
        if (val === undefined || val === null || val === "") missingFields.push(p.label);
      }
    }
    if (missingFields.length > 0) {
      setStatus("error");
      setError(`Champs requis manquants : ${missingFields.join(", ")}`);
      return;
    }

    clearTimers();
    setStatus("loading");
    setError(null);
    setProgress(0);

    const input: Record<string, unknown> = { ...state };
    if (prompt.trim()) input.prompt = prompt.trim();

    generate({ modelSlug: model.slug, input })
      .then((res) => {
        const newResult: Result = {
          id: res.runId.toString(),
          model,
          prompt: prompt.trim() || "(sans prompt)",
          cost: res.estimatedCostUsd || currentPrice,
          resultUrl: null,
          runId: res.runId,
          state: { ...state },
          timestamp: new Date(),
        };
        setHistory((prev) => [newResult, ...prev]);
        setActiveId(newResult.id);
        setProgress(10);

        let pollCount = 0;
        const maxPolls = 300;
        const poll = () => {
          pollCount++;
          if (pollCount > maxPolls) {
            setStatus("error");
            setError("La génération a pris trop de temps. Réessaie plus tard.");
            return;
          }
          generationStatus({ id: res.runId })
            .then((statusRes) => {
              const node = statusRes.nodes[0];
              if (!node) return;
              const pct = statusRes.status === "success" ? 100 : Math.min(10 + pollCount, 95);
              setProgress(pct);

              if (statusRes.status === "success" || (node.status === "success" && node.asset)) {
                const url = node.asset?.previewUrl || node.asset?.storageUrl || null;
                setHistory((prev) =>
                  prev.map((r) =>
                    r.id === newResult.id ? { ...r, resultUrl: url } : r,
                  ),
                );
                setStatus("success");
                setProgress(100);
                requestAnimationFrame(() => {
                  galleryRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                });
                return;
              }

              if (statusRes.status === "error" || node.status === "error") {
                setStatus("error");
                setError(node.errorMessage || "Une erreur est survenue pendant la génération.");
                return;
              }

              timers.current.push(window.setTimeout(poll, 2000));
            })
            .catch(() => {
              timers.current.push(window.setTimeout(poll, 2000));
            });
        };
        timers.current.push(window.setTimeout(poll, 2000));
      })
      .catch((err) => {
        setStatus("error");
        setError(err?.message || "Impossible de lancer la génération.");
      });
  }

  useEffect(() => () => clearTimers(), []);

  return (
    <div
      className={cn(
        "flex flex-col",
        isModal ? "h-[min(80dvh,720px)]" : "h-[calc(100dvh-3.5rem)]",
      )}
    >
      {/* Top bar */}
      {!isModal && (
        <div className="shrink-0 border-b border-border/60 bg-surface-0/40 backdrop-blur">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-3 flex items-center gap-4">
            <Link
              to="/app/models"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="size-3.5" /> Catalogue
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 min-w-0">
                <h1 className="font-display text-lg tracking-[-0.02em] truncate">{model.name}</h1>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground truncate">
                  {model.provider}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <PriceDisplay
                usd={currentPrice}
                className="font-display text-lg tracking-[-0.02em]"
                emphasize
              />
              <div className="text-[10px] text-muted-foreground font-mono">{unitLabel(model)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery / result area */}
      <div
        ref={galleryRef}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6">
          {/* Active result hero */}
          {active && (
            <div className="mb-6">
              <ActiveResultView
                result={active}
                onRegenerate={() => {
                  setPrompt(active.prompt);
                  setState(active.state);
                  setActiveId(null);
                  setTimeout(handleGenerate, 40);
                }}
              />
            </div>
          )}

          {/* Loading placeholder pinned at top when generating */}
          {status === "loading" && (
            <div className="mb-6">
              <LoadingCard model={model} progress={progress} />
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 rounded-2xl border border-amber/40 bg-amber/5 p-4 flex items-start gap-3">
              <AlertTriangle className="size-4 text-amber shrink-0 mt-0.5" />
              <div className="text-sm text-foreground/80 flex-1">{error}</div>
              <button
                onClick={() => {
                  setStatus("idle");
                  setError(null);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* History header */}
          {history.length > 0 && (
            <div className="mb-3 flex items-baseline justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Générations · {history.length}
              </div>
              <button
                onClick={() => {
                  setHistory([]);
                  setActiveId(null);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Effacer
              </button>
            </div>
          )}

          {/* History grid */}
          {history.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    "group relative rounded-xl overflow-hidden border text-left transition",
                    "aspect-square",
                    activeId === item.id
                      ? "border-amber ring-2 ring-amber/30"
                      : "border-border hover:border-amber/40",
                  )}
                  style={
                    item.resultUrl
                      ? undefined
                      : { background: `linear-gradient(135deg, #2a1e3d, oklch(0.14 0 0))` }
                  }
                >
                  {item.resultUrl && (
                    <img
                      src={item.resultUrl}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!item.resultUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-mono text-white/90 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded truncate">
                    {item.prompt}
                  </div>
                  <div className="absolute top-1.5 right-1.5 rounded-full bg-black/60 backdrop-blur px-1.5 py-0.5 text-[9px] font-mono text-white/80">
                    <PriceDisplay usd={item.cost} className="text-[9px]" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            status !== "loading" && !active && <EmptyState model={model} />
          )}

          <SimilarModels model={model} />
        </div>
      </div>

      {/* Fixed prompt bar */}
      <div className="shrink-0 border-t border-border/60 bg-surface-0/70 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
          <PromptBar
            model={model}
            iconParams={iconParams}
            state={state}
            setState={setState}
            prompt={prompt}
            setPrompt={setPrompt}
            hasPrompt={hasPrompt}
            onGenerate={handleGenerate}
            status={status}
            progress={progress}
            currentPrice={currentPrice}
            showAdvanced={showAdvanced}
            onToggleAdvanced={() => setShowAdvanced((v) => !v)}
            canGenerate={canGenerate}
          />
        </div>
      </div>
    </div>
  );
}

function initState(model: Model): Record<string, unknown> {
  const init: Record<string, unknown> = {};
  model.params.forEach((p) => {
    if (p.kind === "slider") init[p.key] = p.default;
    if (p.kind === "select") init[p.key] = p.options[0];
    if (p.kind === "toggle") init[p.key] = !!p.default;
    if (p.kind === "seed") init[p.key] = undefined;
    if (p.kind === "upload") init[p.key] = [];
  });
  return init;
}

function PromptBar({
  model,
  iconParams,
  state,
  setState,
  prompt,
  setPrompt,
  hasPrompt,
  onGenerate,
  status,
  progress,
  currentPrice,
  showAdvanced,
  onToggleAdvanced,
  canGenerate,
}: {
  model: Model;
  iconParams: ParamSpec[];
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  prompt: string;
  setPrompt: (v: string) => void;
  hasPrompt: boolean;
  onGenerate: () => void;
  status: Status;
  progress: number;
  currentPrice: number;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  canGenerate: boolean;
}) {
  const promptSpec = model.params.find((p) => p.kind === "prompt");
  const placeholder =
    (promptSpec && "placeholder" in promptSpec && promptSpec.placeholder) ||
    "Décris ce que tu veux générer…";

  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/70 p-3">
      {hasPrompt ? (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onGenerate();
            }
          }}
          rows={2}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          Configure les paramètres ci-dessous, puis génère.
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {iconParams.map((p, i) => (
          <ParamIconButton key={i} p={p} state={state} setState={setState} />
        ))}

        {model.params.some((p) => "advanced" in p && p.advanced) && (
          <button
            type="button"
            onClick={onToggleAdvanced}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border h-8 px-2.5 text-[11px] transition cursor-pointer",
              showAdvanced
                ? "border-amber/60 bg-amber/10 text-amber-soft"
                : "border-border bg-surface-2/40 text-muted-foreground hover:text-foreground hover:border-border-strong",
            )}
          >
            <Settings2 className="size-3" />
            <span className="hidden sm:inline">{showAdvanced ? "Advanced" : "Simple"}</span>
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <span>Coût</span>
            <PriceDisplay usd={currentPrice} className="text-[11px] text-foreground" />
          </div>
          <button
            onClick={onGenerate}
            disabled={status === "loading" || !canGenerate}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber px-4 h-9 text-sm font-medium text-primary-foreground hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="hidden sm:inline">{progress}%</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Générer</span>
                <ArrowUp className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ParamIconButton({
  p,
  state,
  setState,
}: {
  p: ParamSpec;
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  const key = "key" in p ? p.key : p.kind;
  const Icon = iconForParam(key, p.kind);
  const label = p.label;

  // Compact value preview
  let preview: string | null = null;
  if (p.kind === "select") preview = String(state[p.key] ?? "");
  else if (p.kind === "slider")
    preview = `${state[p.key] ?? p.default}${p.suffix ?? ""}`;
  else if (p.kind === "toggle") preview = state[p.key] ? "On" : null;

  const uploadCount = p.kind === "upload" ? ((state[p.key] as File[]) ?? []).length : 0;

  const isActive =
    (p.kind === "toggle" && !!state[p.key]) ||
    (p.kind === "select" && p.options[0] !== state[p.key]) ||
    (p.kind === "slider" && state[p.key] !== p.default) ||
    (p.kind === "upload" && uploadCount > 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border h-8 px-2.5 text-xs transition cursor-pointer",
            isActive
              ? "border-amber/60 bg-amber/10 text-amber-soft"
              : "border-border bg-surface-2/40 text-muted-foreground hover:text-foreground hover:border-border-strong",
          )}
          title={label}
        >
          <Icon className="size-3.5" />
          {preview && (
            <span className="font-mono text-[10px] uppercase tracking-wider">{preview}</span>
          )}
          {p.kind === "upload" && uploadCount > 0 && (
            <span className="inline-flex items-center justify-center size-4 rounded-full bg-amber text-[9px] font-bold text-primary-foreground">
              {uploadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 bg-surface-1/95 backdrop-blur border-border"
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon className="size-4 text-amber" />
          <div className="text-xs font-medium">{label}</div>
        </div>
        <ParamEditor p={p} state={state} setState={setState} />
      </PopoverContent>
    </Popover>
  );
}

function UploadParamEditor({
  p,
  state,
  setState,
}: {
  p: ParamSpec;
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  const files = (state[p.key] as File[]) ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    setState((s) => ({
      ...s,
      [p.key]: p.multiple ? [...((s[p.key] as File[]) ?? []), ...newFiles] : newFiles,
    }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function removeFile(index: number) {
    setState((s) => ({
      ...s,
      [p.key]: ((s[p.key] as File[]) ?? []).filter((_, i) => i !== index),
    }));
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "rounded-xl border px-3 py-6 text-center text-xs cursor-pointer transition",
          files.length === 0 && !isDragOver ? "border-dashed" : "border-solid",
          files.length > 0 || isDragOver
            ? "border-amber/60 bg-amber/5 text-amber-soft"
            : "border-border bg-surface-0/40 text-muted-foreground hover:border-amber/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={p.accepts}
          multiple={p.multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {files.length > 0 ? (
          <div className="space-y-1">
            <Upload className="size-4 mx-auto text-amber" />
            <span>
              {files.length} fichier{files.length > 1 ? "s" : ""} sélectionné{files.length > 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <span>Glisse un fichier ou clique pour choisir</span>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-surface-2/40 px-2.5 py-1.5 text-[11px]">
              <span className="truncate text-foreground">{f.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParamEditor({
  p,
  state,
  setState,
}: {
  p: ParamSpec;
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  if (p.kind === "upload") {
    return <UploadParamEditor p={p} state={state} setState={setState} />;
  }
  if (p.kind === "select") {
    const val = state[p.key] as string;
    return (
      <div className="flex flex-wrap gap-1.5">
        {p.options.map((o) => (
          <button
            key={o}
            onClick={() => setState((s) => ({ ...s, [p.key]: o }))}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition cursor-pointer",
              val === o
                ? "border-amber/60 bg-amber/15 text-amber-soft"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (p.kind === "slider") {
    const val = state[p.key] as number;
    return (
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">
            {p.min}
            {p.suffix ?? ""} – {p.max}
            {p.suffix ?? ""}
          </span>
          <span className="font-mono text-xs">
            {val}
            {p.suffix ?? ""}
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
    const val = state[p.key] as number | undefined;
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={val ?? ""}
          placeholder="aléatoire"
          onChange={(e) =>
            setState((s) => ({
              ...s,
              [p.key]: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
            }))
          }
          className="w-full rounded-xl border border-border bg-surface-0/60 px-3 py-2 text-xs font-mono outline-none focus:border-amber/50"
        />
        <button
          type="button"
          onClick={() => setState((s) => ({ ...s, [p.key]: Math.floor(Math.random() * 0xffffffff) }))}
          className="shrink-0 rounded-xl border border-border bg-surface-0/60 px-3 py-2 text-xs hover:border-amber/50 hover:bg-amber/5 transition"
          title="Seed aléatoire"
        >
          🎲
        </button>
      </div>
    );
  }
  if (p.kind === "toggle") {
    const val = !!state[p.key];
    return (
      <button
        onClick={() => setState((s) => ({ ...s, [p.key]: !val }))}
        className="w-full flex items-center justify-between rounded-lg bg-surface-2/40 px-3 py-2 cursor-pointer"
      >
        <span className="text-xs">{p.label}</span>
        <span
          className={cn(
            "relative h-5 w-9 rounded-full transition",
            val ? "bg-amber" : "bg-surface-3",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-4 rounded-full bg-background transition-transform",
              val ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </span>
      </button>
    );
  }
  return null;
}

function LoadingCard({ model, progress }: { model: Model; progress: number }) {
  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden">
      <div className="relative aspect-video max-h-[45dvh] grid place-items-center">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,oklch(0.78_0.16_70_/_0.18)_50%,transparent_80%)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]" />
        <div className="relative text-center">
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

function ActiveResultView({
  result,
  onRegenerate,
}: {
  result: Result;
  onRegenerate: () => void;
}) {
  const hasResult = !!result.resultUrl;
  const isImage = result.model.category === "image";
  const isVideo = result.model.category === "video";
  const isAudio = result.model.category === "audio";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div className="flex items-center justify-center min-w-0">
        <div
          className={cn(
            "surface-gradient-border rounded-2xl overflow-hidden relative",
            "h-[min(58dvh,520px)] max-w-full w-auto",
            !hasResult && "aspect-square",
          )}
          style={
            hasResult
              ? undefined
              : { background: `linear-gradient(135deg, #2a1e3d, oklch(0.14 0 0))` }
          }
        >
          {hasResult && isImage && (
            <img
              src={result.resultUrl!}
              alt={result.prompt}
              className="w-full h-full object-contain"
            />
          )}
          {hasResult && isVideo && (
            <video
              src={result.resultUrl!}
              controls
              className="w-full h-full object-contain"
            />
          )}
          {hasResult && isAudio && (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
              <audio src={result.resultUrl!} controls className="w-full max-w-xs" />
            </div>
          )}
          {!hasResult && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <div className="rounded-full bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-mono uppercase tracking-wider truncate">
              {result.model.category}
            </div>
            <div className="rounded-full bg-black/60 backdrop-blur px-2 py-1 shrink-0">
              <PriceDisplay usd={result.cost} className="text-[10px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 min-w-0">
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Prompt
          </div>
          <div className="mt-1.5 text-sm text-foreground/90 leading-relaxed line-clamp-4">
            {result.prompt}
          </div>
        </div>
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-2">
            Paramètres
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.state).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                <Settings2 className="size-3" /> {k}: {String(v)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/40 px-3 py-2 text-xs hover:border-amber/40 transition cursor-pointer"
          >
            <RefreshCw className="size-3.5" /> Régénérer
          </button>
          {hasResult && (
            <a
              href={result.resultUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-95 transition"
            >
              <Download className="size-3.5" /> Télécharger
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ model }: { model: Model }) {
  return (
    <div className="mt-8 grid place-items-center text-center py-16">
      <div className="grid place-items-center size-14 rounded-2xl bg-surface-2 border border-border mb-4">
        <Sparkles className="size-6 text-amber" />
      </div>
      <div className="font-display text-2xl tracking-[-0.02em]">Prêt à générer.</div>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {model.blurb}
      </p>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Écris ton prompt en bas · Ctrl/⌘ + Entrée pour lancer
      </div>
    </div>
  );
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

function SimilarModels({ model }: { model: Model }) {
  const similar = useMemo(
    () =>
      MODELS.filter((m) => m.category === model.category && m.slug !== model.slug).slice(0, 6),
    [model.category, model.slug],
  );

  if (similar.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
        Modèles similaires
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((m) => (
          <Link
            key={m.slug}
            to="/app/models/$slug"
            params={{ slug: m.slug }}
            className="group surface-gradient-border rounded-2xl bg-surface-1/60 backdrop-blur p-4 hover:bg-surface-1/80 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_oklch(0.78_0.16_70_/_0.25)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base tracking-[-0.01em] truncate">{m.name}</span>
                  {m.badge && (
                    <span
                      className={
                        "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider " +
                        (m.badge === "popular"
                          ? "bg-amber/20 text-amber-soft"
                          : m.badge === "new"
                            ? "bg-emerald/20 text-emerald"
                            : "bg-surface-3 text-muted-foreground")
                      }
                    >
                      {m.badge === "popular" ? "Populaire" : m.badge === "new" ? "Nouveau" : "Pro"}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {m.provider}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-baseline justify-between">
              <PriceDisplay
                usd={basePrice(m)}
                className="font-display text-xl tracking-[-0.02em]"
                emphasize
              />
              <span className="text-[10px] text-muted-foreground font-mono">{unitLabel(m)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
