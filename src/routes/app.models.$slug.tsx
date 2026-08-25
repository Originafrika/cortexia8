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
import { loadSession, isAdmin } from "@/lib/auth-store";
import { PromptBar } from "@/components/playground/prompt-bar";
import { ResultView } from "@/components/playground/result-view";
import { HistoryGrid } from "@/components/playground/history-grid";
import { SimilarModels } from "@/components/playground/similar-models";
import { useAppStore } from "@/lib/app-store";
import {
  listSessions,
  createSession,
  appendMessage,
  deleteSession,
  getSession,
  type ChatSession,
  type ChatMessage,
} from "@/lib/chat-sessions";
import { ChatSessionSidebar } from "@/components/playground/chat-session-sidebar";
import { ChatThread } from "@/components/playground/chat-thread";
import { ChatInput } from "@/components/playground/chat-input";

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

export type ActiveGeneration = {
  id: string;
  status: Status;
  progress: number;
  error: string | null;
  runId: number | null;
  prompt: string;
};

export type Result = {
  id: string;
  model: Model;
  prompt: string;
  cost: number;
  resultUrl: string | null;
  textContent: string | null;
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

  // Public users may only open models that passed the catalogue verification gate.
  const adminOnly =
    model.category === "text" || model.category === "audio" || model.category === "music";
  const unverified = model.fidelityStatus !== "fidele";
  if ((adminOnly || unverified) && !isAdmin()) {
    return (
      <div className="grid place-items-center h-full">
        <div className="text-center">
          <AlertTriangle className="mx-auto size-8 text-amber" />
          <h2 className="mt-4 font-display text-2xl">{t("playground.admin_only")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("playground.admin_only_desc")}</p>
          <Link
            to="/app/models"
            className="mt-4 inline-block text-amber-soft hover:underline text-sm"
          >
            {t("playground.back")}
          </Link>
        </div>
      </div>
    );
  }

  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<Record<string, unknown>>(() => initState(model));

  useEffect(() => {
    setPrompt("");
    setActiveGens(new Map());
    setHistory([]);
    setActiveId(null);
    setState(initState(model));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.slug]);

  const [activeGens, setActiveGens] = useState<Map<string, ActiveGeneration>>(new Map());
  const activeCount = activeGens.size;
  const MAX_CONCURRENT = 3;
  const [history, setHistory] = useState<Result[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timersRef = useRef<Map<string, number[]>>(new Map());
  const galleryRef = useRef<HTMLDivElement>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Chat session state (text models only)
  const isTextModel = model.category === "text";
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  // Load sessions on mount for text models
  useEffect(() => {
    if (!isTextModel) return;
    const sessions = listSessions(model.slug);
    if (sessions.length > 0) {
      setActiveSession(sessions[0]);
      setChatMessages(sessions[0].messages);
    } else {
      setActiveSession(null);
      setChatMessages([]);
    }
  }, [model.slug, isTextModel]);

  // Global store for persistence
  const storeAddGen = useAppStore((s) => s.addGeneration);
  const storeUpdateGen = useAppStore((s) => s.updateGeneration);
  const storeRemoveGen = useAppStore((s) => s.removeGeneration);
  const storeAddHistory = useAppStore((s) => s.addToHistory);
  const storeSetBalance = useAppStore((s) => s.setBalance);

  const currentPrice = useMemo(() => estimatePrice(model, state), [model, state]);
  const hasPrompt = model.params.some(
    (p) =>
      p.kind === "prompt" ||
      (p.kind === "longtext" && (p.key === "prompt" || model.category === "text")),
  );
  const active = history.find((h) => h.id === activeId) ?? null;

  const canGenerate = useMemo(() => {
    for (const p of model.params) {
      if (!p.required) continue;
      if (
        p.kind === "prompt" ||
        (p.kind === "longtext" && (p.key === "prompt" || model.category === "text"))
      ) {
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
    if (p.kind === "longtext" && (p.key === "prompt" || model.category === "text")) return false;
    // Exclude advanced params when not showing advanced
    if (!showAdvanced && "advanced" in p && p.advanced) return false;
    return true;
  });

  function clearGenTimers(genId: string) {
    const genTimers = timersRef.current.get(genId) ?? [];
    genTimers.forEach((t) => window.clearTimeout(t));
    timersRef.current.delete(genId);
  }
  function clearAllTimers() {
    for (const [, genTimers] of timersRef.current) {
      genTimers.forEach((t) => window.clearTimeout(t));
    }
    timersRef.current.clear();
  }

  function handleNewSession() {
    const session = createSession(model.slug);
    setActiveSession(session);
    setChatMessages([]);
    setSidebarRefreshKey((k) => k + 1);
  }

  function handleSelectSession(session: ChatSession) {
    setActiveSession(session);
    setChatMessages(session.messages);
  }

  function handleDeleteSession(sessionId: string) {
    deleteSession(model.slug, sessionId);
    setSidebarRefreshKey((k) => k + 1);
    if (activeSession?.id === sessionId) {
      const remaining = listSessions(model.slug);
      if (remaining.length > 0) {
        setActiveSession(remaining[0]);
        setChatMessages(remaining[0].messages);
      } else {
        setActiveSession(null);
        setChatMessages([]);
      }
    }
  }

  function handleGenerate() {
    if (activeCount >= MAX_CONCURRENT) return;
    console.log(`[Generate] Starting generation for model: ${model.slug}`);

    const missingFields: string[] = [];
    for (const p of model.params) {
      if (!p.required) continue;
      if (
        p.kind === "prompt" ||
        (p.kind === "longtext" && (p.key === "prompt" || model.category === "text"))
      ) {
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
      const errGenId = `err_${crypto.randomUUID()}`;
      setActiveGens((prev) =>
        new Map(prev).set(errGenId, {
          id: errGenId,
          status: "error",
          progress: 0,
          error: `${t("playground.missing_fields")} ${missingFields.join(", ")}`,
          runId: null,
          prompt: prompt.trim(),
        }),
      );
      return;
    }

    clearAllTimers();

    const genId = `gen_${crypto.randomUUID()}`;
    setActiveGens((prev) =>
      new Map(prev).set(genId, {
        id: genId,
        status: "loading",
        progress: 0,
        error: null,
        runId: null,
        prompt: prompt.trim(),
      }),
    );

    const input: Record<string, unknown> = { ...state };
    // For text models in chat mode, build messages from conversation history
    if (isTextModel) {
      let session = activeSession;
      if (!session) {
        session = createSession(model.slug, prompt.trim());
        setActiveSession(session);
        setSidebarRefreshKey((k) => k + 1);
      }

      // Append user message to session
      appendMessage(model.slug, session.id, {
        role: "user",
        content: prompt.trim(),
      });

      // Build messages array from conversation history
      const updatedSession = getSession(model.slug, session.id);
      const historyMessages = (updatedSession?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      input.messages = historyMessages;
      setChatMessages(updatedSession?.messages ?? []);
      setSidebarRefreshKey((k) => k + 1);
    } else {
      // Non-text models: existing behavior
      const promptParam = model.params.find((p) => p.kind === "prompt" || p.kind === "longtext");
      const promptKey = promptParam && "key" in promptParam ? (promptParam as any).key : "prompt";
      if (prompt.trim()) input[promptKey] = prompt.trim();
    }

    generate({ data: { modelSlug: model.slug, input, sessionToken: loadSession()?.token } })
      .then((res) => {
        console.log(`[Generate] Success: runId=${res.runId}, cost=${res.estimatedCostUsd}`);
        const newResult: Result = {
          id: res.runId.toString(),
          model,
          prompt: prompt.trim() || t("playground.no_prompt"),
          cost: res.estimatedCostUsd || currentPrice,
          resultUrl: null,
          textContent: res.textContent ?? null,
          runId: res.runId,
          state: { ...state },
          timestamp: new Date(),
        };
        setHistory((prev) => [newResult, ...prev]);
        setActiveId(newResult.id);

        // For text models: append assistant response to conversation
        if (isTextModel && res.textContent && activeSession) {
          appendMessage(model.slug, activeSession.id, {
            role: "assistant",
            content: res.textContent,
            cost: res.estimatedCostUsd,
            model: model.slug,
          });
          const updated = getSession(model.slug, activeSession.id);
          if (updated) {
            setChatMessages(updated.messages);
            setSidebarRefreshKey((k) => k + 1);
          }
        }

        // Chat models return status "succeeded" with textContent — no polling needed.
        if (res.status === "succeeded" && res.textContent) {
          setActiveGens((prev) => {
            const next = new Map(prev);
            next.delete(genId);
            return next;
          });
          requestAnimationFrame(() => {
            galleryRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          });
          return;
        }

        setActiveGens((prev) => {
          const next = new Map(prev);
          const gen = next.get(genId);
          if (gen) next.set(genId, { ...gen, runId: res.runId, progress: 10 });
          return next;
        });

        let pollCount = 0;
        const maxPolls = 300;
        const poll = () => {
          pollCount++;
          if (pollCount > maxPolls) {
            console.error(
              `[Generate] Timeout: genId=${genId}, runId=${res.runId}, model=${model.slug}, polls=${pollCount}`,
            );
            setActiveGens((prev) => {
              const next = new Map(prev);
              const gen = next.get(genId);
              if (gen) next.set(genId, { ...gen, status: "error", error: t("playground.timeout") });
              return next;
            });
            return;
          }
          generationStatus({ data: { id: res.runId, sessionToken: loadSession()?.token } })
            .then((statusRes) => {
              const node = statusRes.nodes[0];
              if (!node) return;
              const pct =
                statusRes.status === "success" || statusRes.status === "succeeded"
                  ? 100
                  : Math.min(10 + pollCount, 95);

              setActiveGens((prev) => {
                const next = new Map(prev);
                const gen = next.get(genId);
                if (gen) next.set(genId, { ...gen, progress: pct });
                return next;
              });

              if (
                statusRes.status === "success" ||
                statusRes.status === "succeeded" ||
                ((node.status === "success" || node.status === "succeeded") &&
                  (node.asset || node.textContent))
              ) {
                console.log(
                  `[Generate] Success via poll: genId=${genId}, runId=${res.runId}, model=${model.slug}, status=${statusRes.status}, nodeStatus=${node.status}, hasAsset=${!!node.asset}, hasText=${!!node.textContent}`,
                );
                const url = node.asset?.previewUrl || node.asset?.storageUrl || null;
                setHistory((prev) =>
                  prev.map((r) =>
                    r.id === newResult.id
                      ? { ...r, resultUrl: url, textContent: node.textContent ?? r.textContent }
                      : r,
                  ),
                );
                setActiveGens((prev) => {
                  const next = new Map(prev);
                  next.delete(genId);
                  return next;
                });
                requestAnimationFrame(() => {
                  galleryRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                });
                return;
              }

              if (
                statusRes.status === "error" ||
                statusRes.status === "failed" ||
                node.status === "error" ||
                node.status === "failed"
              ) {
                console.error(
                  `[Generate] Task failed: genId=${genId}, runId=${res.runId}, model=${model.slug}, status=${statusRes.status}, nodeStatus=${node.status}, error=${node.errorMessage || "unknown"}, kieTaskId=${node.kieTaskId}`,
                );
                setActiveGens((prev) => {
                  const next = new Map(prev);
                  const gen = next.get(genId);
                  if (gen)
                    next.set(genId, {
                      ...gen,
                      status: "error",
                      error: node.errorMessage || t("playground.gen_error"),
                    });
                  return next;
                });
                return;
              }

              const genTimers = timersRef.current.get(genId) ?? [];
              genTimers.push(window.setTimeout(poll, 2000));
              timersRef.current.set(genId, genTimers);
            })
            .catch((pollErr) => {
              console.error(
                `[Generate] Poll error: genId=${genId}, runId=${res.runId}, poll=${pollCount}, error=`,
                pollErr,
              );
              const genTimers = timersRef.current.get(genId) ?? [];
              genTimers.push(window.setTimeout(poll, 2000));
              timersRef.current.set(genId, genTimers);
            });
        };
        const genTimers = timersRef.current.get(genId) ?? [];
        genTimers.push(window.setTimeout(poll, 2000));
        timersRef.current.set(genId, genTimers);
      })
      .catch((err) => {
        console.error(
          `[Generate] Failed: model=${model.slug}, prompt="${prompt.trim().slice(0, 80)}", error=`,
          err,
        );
        if (err?.message) console.error(`[Generate] Error message: ${err.message}`);
        if (err?.stack) console.error(`[Generate] Stack: ${err.stack}`);
        setActiveGens((prev) => {
          const next = new Map(prev);
          const gen = next.get(genId);
          if (gen)
            next.set(genId, {
              ...gen,
              status: "error",
              error: err?.message || t("playground.gen_impossible"),
            });
          return next;
        });
      });
  }

  useEffect(() => () => clearAllTimers(), []);

  return (
    <div
      className={cn("flex flex-col", isModal ? "h-[min(80dvh,720px)]" : "h-[calc(100dvh-3.5rem)]")}
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

      {/* Content area - conditional for text models vs others */}
      {isTextModel ? (
        <div className="flex flex-1 min-h-0">
          {/* Session sidebar */}
          <ChatSessionSidebar
            modelSlug={model.slug}
            activeSessionId={activeSession?.id ?? null}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            refreshKey={sidebarRefreshKey}
          />

          {/* Chat thread + input */}
          <div className="flex flex-col flex-1 min-h-0">
            <ChatThread messages={chatMessages} />
            <ChatInput
              model={model}
              iconParams={iconParams}
              state={state}
              setState={setState}
              prompt={prompt}
              setPrompt={setPrompt}
              onSend={handleGenerate}
              isGenerating={activeGens.size > 0}
              currentPrice={currentPrice}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Gallery / result area for non-text models */}
          <div ref={galleryRef} className="flex-1 min-h-0 overflow-y-auto">
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

              {/* Loading cards for all active generations */}
              {Array.from(activeGens.values()).map(
                (gen) =>
                  gen.status === "loading" && (
                    <div key={gen.id} className="mb-6">
                      <LoadingCard model={model} progress={gen.progress} />
                    </div>
                  ),
              )}

              {/* Error messages from active generations */}
              {Array.from(activeGens.values()).map(
                (gen) =>
                  gen.status === "error" &&
                  gen.error && (
                    <div
                      key={gen.id}
                      className="mb-6 rounded-2xl border border-amber/40 bg-amber/5 p-4 flex items-start gap-3"
                    >
                      <AlertTriangle className="size-4 text-amber shrink-0 mt-0.5" />
                      <div className="text-sm text-foreground/80 flex-1">{gen.error}</div>
                      <button
                        onClick={() => {
                          setActiveGens((prev) => {
                            const next = new Map(prev);
                            next.delete(gen.id);
                            return next;
                          });
                        }}
                        aria-label="Dismiss error"
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ),
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
                <HistoryGrid history={history} activeId={activeId} onSelect={setActiveId} />
              ) : (
                activeCount === 0 && !active && <EmptyState model={model} />
              )}

              <SimilarModels model={model} />
            </div>
          </div>

          {/* Fixed prompt bar for non-text models */}
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
                activeCount={activeCount}
                maxConcurrent={MAX_CONCURRENT}
                currentPrice={currentPrice}
                showAdvanced={showAdvanced}
                onToggleAdvanced={() => setShowAdvanced((v) => !v)}
                canGenerate={canGenerate}
              />
            </div>
          </div>
        </>
      )}
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
    if (p.kind === "longtext") init[p.key] = "";
    if (p.kind === "prompt") init[p.key] = "";
  });
  return init;
}

function LoadingCard({
  model,
  progress,
  onCancel,
}: {
  model: Model;
  progress: number;
  onCancel?: () => void;
}) {
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
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{model.blurb}</p>
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
