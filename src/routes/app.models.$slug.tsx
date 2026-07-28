import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getModel, basePrice, unitLabel, type Model, type ParamSpec } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import {
  ArrowLeft,
  Sparkles,
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
  MessageSquare,
  Ban,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generate } from "@/lib/api/generate";
import { generationStatus } from "@/lib/api/generation-status";
import { useT } from "@/lib/i18n";
import { loadSession } from "@/lib/auth-store";
import { PromptBar } from "@/components/playground/prompt-bar";
import { ResultView } from "@/components/playground/result-view";
import { HistoryGrid } from "@/components/playground/history-grid";
import { SimilarModels } from "@/components/playground/similar-models";

export const Route = createFileRoute("/app/models/$slug")({
  loader: ({ params }) => {
    const m = getModel(params.slug);
    if (!m) throw notFound();
    return { model: m };
  },
  component: ModelPlayground,
  errorComponent: ModelErrorComponent,
  notFoundComponent: ModelNotFoundComponent,
});

function ModelErrorComponent({ error }: { error: Error }) {
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <AlertTriangle className="mx-auto size-8 text-amber" />
      <h1 className="mt-4 font-display text-3xl">{t("playground.error")}</h1>
      <p className="mt-2 text-muted-foreground text-sm">{error.message}</p>
      <Link to="/app/models" className="mt-6 inline-flex text-amber-soft hover:underline">
        {t("playground.back")}
      </Link>
    </div>
  );
}

function ModelNotFoundComponent() {
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">{t("playground.not_found")}</h1>
      <Link to="/app/models" className="mt-4 inline-flex text-amber-soft hover:underline">
        {t("playground.back")}
      </Link>
    </div>
  );
}

export type Status = "idle" | "loading" | "success" | "error";

export type Result = {
  id: string;
  model: Model;
  prompt: string;
  cost: number;
  resultUrl: string | null;
  runId: number | null;
  state: Record<string, unknown>;
  timestamp: Date;
};

export function iconForParam(key: string, kind: ParamSpec["kind"]) {
  // Secondary text params (not the main prompt)
  if (key === "negative_prompt") return Ban;
  if (key === "lyrics" || key === "script" || key === "description") return MessageSquare;
  
  // Other param types
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
  const t = useT();
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
  const hasPrompt = model.params.some((p) => 
    (p.kind === "prompt") || (p.kind === "longtext" && p.key === "prompt")
  );
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
    // Exclude main prompt (goes in textarea)
    if (p.kind === "prompt") return false;
    if (p.kind === "longtext" && p.key === "prompt") return false;
    // Exclude advanced params when not showing advanced
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
      setError(`${t("playground.missing_fields")} ${missingFields.join(", ")}`);
      return;
    }

    clearTimers();
    setStatus("loading");
    setError(null);
    setProgress(0);

    const input: Record<string, unknown> = { ...state };
    const promptParam = model.params.find((p) => p.kind === "prompt" || p.kind === "longtext");
    const promptKey = promptParam && "key" in promptParam ? (promptParam as any).key : "prompt";
    if (prompt.trim()) input[promptKey] = prompt.trim();

    generate({ data: { modelSlug: model.slug, input, sessionToken: loadSession()?.token } })
      .then((res) => {
        const newResult: Result = {
          id: res.runId.toString(),
          model,
          prompt: prompt.trim() || t("playground.no_prompt"),
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
            setError(t("playground.timeout"));
            return;
          }
          generationStatus({ data: { id: res.runId, sessionToken: loadSession()?.token } })
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
                setError(node.errorMessage || t("playground.gen_error"));
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
        setError(err?.message || t("playground.gen_impossible"));
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
              <ArrowLeft className="size-3.5" /> {t("playground.catalog")}
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
              <ResultView
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
                aria-label="Dismiss error"
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
                {t("playground.generations")} · {history.length}
              </div>
              <button
                onClick={() => {
                  setHistory([]);
                  setActiveId(null);
                }}
                aria-label="Clear history"
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t("playground.clear")}
              </button>
            </div>
          )}

          {/* History grid */}
          {history.length > 0 ? (
            <HistoryGrid
              history={history}
              activeId={activeId}
              onSelect={setActiveId}
            />
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



function LoadingCard({ model, progress }: { model: Model; progress: number }) {
  const t = useT();
  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden">
      <div className="relative aspect-video max-h-[45dvh] grid place-items-center">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,color-mix(in_oklab,var(--amber)_18%,transparent)_50%,transparent_80%)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]" />
        <div className="relative text-center">
          <Loader2 className="size-6 mx-auto text-amber animate-spin" />
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {model.category === "video"
              ? t("playground.render_video")
              : model.category === "audio"
                ? t("playground.render_audio")
                : model.category === "text"
                  ? t("playground.render_text")
                  : t("playground.render_image")}
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



function EmptyState({ model }: { model: Model }) {
  const t = useT();
  return (
    <div className="mt-8 grid place-items-center text-center py-16">
      <div className="grid place-items-center size-14 rounded-2xl bg-surface-2 border border-border mb-4">
        <Sparkles className="size-6 text-amber" />
      </div>
      <div className="font-display text-2xl tracking-[-0.02em]">{t("playground.ready")}</div>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {model.blurb}
      </p>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {t("playground.ready_desc")}
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
