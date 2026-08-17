import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { z } from "zod";
import { SignedIn, RedirectToSignIn } from "@neondatabase/auth-ui";
import { loadSession } from "@/lib/auth-store";
import { CanvasFlow } from "@/components/canvas/canvas-flow";
import { AgentPanel } from "@/components/canvas/agent-panel";
import { NodePicker } from "@/components/canvas/node-picker";
import { RunControls } from "@/components/canvas/run-controls";
import { PriceBadge } from "@/components/canvas/price-badge";
import { EmptyStateCard } from "@/components/canvas/empty-state-card";
import { useCanvasStore } from "@/lib/canvas-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Bot, Copy, Eye, History, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RunHistoryPanel } from "@/components/canvas/run-history-panel";
import { useT } from "@/lib/i18n";

const canvasSearchSchema = z.object({
  workflowId: z.number().optional(),
});

export const Route = createFileRoute("/canvas/")({
  head: () => ({
    meta: [{ title: "Cortexia — Canvas" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  validateSearch: canvasSearchSchema,
  component: CanvasPage,
});

function CanvasPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session?.user?.role === "admin") {
      setIsAdmin(true);
    }
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="text-muted-foreground mt-2">Canvas is only available to admin accounts.</p>
          <Link to="/app/models" className="mt-4 inline-block underline text-sm">
            Back to models
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <CanvasShell />
      </SignedIn>
      <RedirectToSignIn />
    </>
  );
}

function CanvasShell() {
  const t = useT();
  const isMobile = useIsMobile();
  const [agentOpen, setAgentOpen] = useState(false);
  const [prefillPrompt, setPrefillPrompt] = useState<string | undefined>();
  const [historyOpen, setHistoryOpen] = useState(false);
  const nodes = useCanvasStore((s) => s.nodes);
  const { workflowId } = Route.useSearch();
  const loadedRef = useRef(false);

  // Auto-save on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      useCanvasStore.getState().saveWorkflow();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleOpenAgent = useCallback((prompt: string) => {
    setPrefillPrompt(prompt);
    setAgentOpen(true);
  }, []);

  const [nodePickerOpen, setNodePickerOpen] = useState(false);

  const handleHighlightNodeAdd = useCallback(() => {
    setNodePickerOpen(true);
  }, []);

  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const duplicateBranch = useCanvasStore((s) => s.duplicateBranch);

  const showEmpty = nodes.length === 0 && workflowId == null;

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-background">
      <header className="shrink-0 z-30 border-b border-border bg-surface-0/70 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 h-14">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition shrink-0"
          >
            <ArrowLeft className="size-3.5" />{" "}
            <span className="hidden sm:inline">{t("canvas.back")}</span>
          </Link>
          <div className="hidden md:flex flex-col min-w-0">
            <input
              type="text"
              value={useCanvasStore((s) => s.workflowName) || "Canvas"}
              onChange={(e) => useCanvasStore.getState().renameWorkflow(e.target.value)}
              className="font-display text-base tracking-[-0.02em] bg-transparent border-none outline-none focus:ring-1 focus:ring-amber/50 rounded-md px-1 -ml-1 min-w-0 max-w-[300px]"
              maxLength={200}
            />
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("canvas.subtitle")} · {nodes.length} noeud{nodes.length > 1 ? "s" : ""}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <PriceBadge className="hidden sm:inline-flex" />
            <div data-node-picker>
              <NodePicker open={nodePickerOpen} onOpenChange={setNodePickerOpen} />
            </div>
            {workflowId && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-0/60 backdrop-blur px-2.5 h-9 text-xs text-muted-foreground hover:text-foreground hover:border-border-strong transition cursor-pointer"
                aria-label={t("run_history.title")}
              >
                <History className="size-3.5" />
                <span className="hidden sm:inline">{t("canvas.history")}</span>
              </button>
            )}
            <RunControls />
          </div>
        </div>
      </header>

      {isMobile && (
        <div className="shrink-0 z-20 border-b border-border bg-amber/10 px-4 py-2 flex items-center gap-2 text-[11px]">
          <Eye className="size-3.5 text-amber shrink-0" />
          <span className="text-foreground/80">{t("canvas.mobile_banner")}</span>
        </div>
      )}

      <ReactFlowProvider>
        <CanvasInnerWrapper
          workflowId={workflowId}
          loadedRef={loadedRef}
          prefillPrompt={prefillPrompt}
          setPrefillPrompt={setPrefillPrompt}
          agentOpen={agentOpen}
          setAgentOpen={setAgentOpen}
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          handleOpenAgent={handleOpenAgent}
          handleHighlightNodeAdd={handleHighlightNodeAdd}
          isMobile={isMobile}
          showEmpty={showEmpty}
          selectedNodeIds={selectedNodeIds}
          duplicateBranch={duplicateBranch}
        />
      </ReactFlowProvider>

      <RunHistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        workflowId={workflowId ?? null}
      />
    </div>
  );
}

function CanvasInnerWrapper({
  workflowId,
  loadedRef,
  prefillPrompt,
  setPrefillPrompt,
  agentOpen,
  setAgentOpen,
  historyOpen,
  setHistoryOpen,
  handleOpenAgent,
  handleHighlightNodeAdd,
  isMobile,
  showEmpty,
  selectedNodeIds,
  duplicateBranch,
}: {
  workflowId: number | null | undefined;
  loadedRef: React.MutableRefObject<boolean>;
  prefillPrompt: string | undefined;
  setPrefillPrompt: (v: string | undefined) => void;
  agentOpen: boolean;
  setAgentOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  historyOpen: boolean;
  setHistoryOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  handleOpenAgent: (prompt: string) => void;
  handleHighlightNodeAdd: () => void;
  isMobile: boolean;
  showEmpty: boolean;
  selectedNodeIds: string[];
  duplicateBranch: (ids: string[]) => void;
}) {
  const t = useT();
  const { fitView } = useReactFlow();
  const setSelected = useCanvasStore((s) => s.setSelectedNodeId);

  // Load workflow from DB if workflowId is in URL
  useEffect(() => {
    if (workflowId == null || loadedRef.current) return;
    loadedRef.current = true;
    const s = useCanvasStore.getState();
    s.loadWorkflow(workflowId).then(() => {
      const after = useCanvasStore.getState();
      if (after.nodes.length > 0) {
        fitView({ padding: 0.2, maxZoom: 1.1 });
      }
    });
  }, [workflowId, fitView]);

  return (
    <>
      <div className="flex-1 min-h-0 relative">
        <CanvasFlow />
        {showEmpty && (
          <EmptyStateCard
            onOpenAgent={(prompt) => {
              setPrefillPrompt(prompt);
              setAgentOpen(true);
            }}
            onHighlightNodeAdd={handleHighlightNodeAdd}
          />
        )}
      </div>

      {selectedNodeIds.length > 0 && !isMobile && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={() => duplicateBranch(selectedNodeIds)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1/90 backdrop-blur px-4 h-9 text-sm hover:border-amber/40 transition shadow-lg cursor-pointer"
          >
            <Copy className="size-3.5" />
            {t("canvas.duplicate")}
            {selectedNodeIds.length > 1 ? ` (${selectedNodeIds.length})` : ""}
          </button>
        </div>
      )}

      {/* Mobile node-add FAB */}
      {isMobile && (
        <div className="absolute right-3 bottom-3 z-20">
          <NodePicker className="!h-10 shadow-lg" />
        </div>
      )}

      {/* Floating Agent toggle button */}
      {!isMobile && (
        <button
          type="button"
          onClick={() => setAgentOpen((v) => !v)}
          className={cn(
            "absolute bottom-4 right-4 z-20 inline-flex items-center justify-center size-11 rounded-full border shadow-lg transition cursor-pointer",
            agentOpen
              ? "bg-amber text-primary-foreground border-amber/40"
              : "bg-surface-1/90 backdrop-blur border-border hover:border-amber/40 text-muted-foreground hover:text-foreground",
          )}
          aria-label={t("canvas.tab.agent")}
        >
          <Bot className="size-5" />
        </button>
      )}

      {/* Agent slide-in panel */}
      {agentOpen && (
        <div className="absolute inset-y-0 right-0 z-40 flex" style={{ top: 0 }}>
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setAgentOpen(false)}
          />
          <div className="relative ml-auto w-[380px] h-full bg-surface-0 border-l border-border shadow-2xl flex flex-col rounded-l-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-end px-3 py-2 border-b border-border">
              <button
                type="button"
                onClick={() => setAgentOpen(false)}
                className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground transition cursor-pointer"
                aria-label={t("canvas.tab.agent")}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <AgentPanel initialPrompt={prefillPrompt} workflowId={workflowId ?? null} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
