import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { z } from "zod";
import { SignedIn, RedirectToSignIn } from "@neondatabase/auth-ui";
import { CanvasFlow } from "@/components/canvas/canvas-flow";
import { InspectorPanel } from "@/components/canvas/inspector-panel";
import { AgentPanel } from "@/components/canvas/agent-panel";
import { NodePicker } from "@/components/canvas/node-picker";
import { RunControls } from "@/components/canvas/run-controls";
import { PriceBadge } from "@/components/canvas/price-badge";
import { EmptyStateCard } from "@/components/canvas/empty-state-card";
import { useCanvasStore } from "@/lib/canvas-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Copy, Eye, History, Settings2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RunHistoryPanel } from "@/components/canvas/run-history-panel";

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

type Tab = "inspector" | "agent";

function CanvasPage() {
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
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("inspector");
  const [prefillPrompt, setPrefillPrompt] = useState<string | undefined>();
  const [historyOpen, setHistoryOpen] = useState(false);
  const selectedId = useCanvasStore((s) => s.selectedNodeId);
  const setSelected = useCanvasStore((s) => s.setSelectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const { workflowId } = Route.useSearch();
  const loadedRef = useRef(false);

  // Auto-switch to inspector when a node is selected
  useEffect(() => {
    if (selectedId) setTab("inspector");
  }, [selectedId]);

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

  const handleOpenAgent = useCallback((prompt: string) => {
    setPrefillPrompt(prompt);
    setTab("agent");
  }, []);

  const handleHighlightNodeAdd = useCallback(() => {
    // Briefly highlight the node-add button via a data attribute
    const btn = document.querySelector("[data-node-picker]") as HTMLElement | null;
    if (btn) {
      btn.setAttribute("data-highlighted", "true");
      setTimeout(() => btn.removeAttribute("data-highlighted"), 1500);
    }
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
            <ArrowLeft className="size-3.5" /> <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="hidden md:flex flex-col min-w-0">
            <div className="font-display text-base tracking-[-0.02em] truncate">Canvas</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Compose ton pipeline · {nodes.length} nœud{nodes.length > 1 ? "s" : ""}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <PriceBadge className="hidden sm:inline-flex" />
            <div data-node-picker>
              <NodePicker />
            </div>
            {workflowId && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-0/60 backdrop-blur px-2.5 h-9 text-xs text-muted-foreground hover:text-foreground hover:border-border-strong transition cursor-pointer"
                aria-label="Historique des runs"
              >
                <History className="size-3.5" />
                <span className="hidden sm:inline">Historique</span>
              </button>
            )}
            <RunControls />
          </div>
        </div>
      </header>

      {isMobile && (
        <div className="shrink-0 z-20 border-b border-border bg-amber/10 px-4 py-2 flex items-center gap-2 text-[11px]">
          <Eye className="size-3.5 text-amber shrink-0" />
          <span className="text-foreground/80">
            Mode lecture seule. Ouvre l'app sur desktop pour éditer le canvas.
          </span>
        </div>
      )}

      <ReactFlowProvider>
        <CanvasInnerWrapper
          workflowId={workflowId}
          loadedRef={loadedRef}
          prefillPrompt={prefillPrompt}
          setPrefillPrompt={setPrefillPrompt}
          tab={tab}
          setTab={setTab}
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
  tab,
  setTab,
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
  tab: Tab;
  setTab: (v: Tab) => void;
  historyOpen: boolean;
  setHistoryOpen: (v: boolean) => void;
  handleOpenAgent: (prompt: string) => void;
  handleHighlightNodeAdd: () => void;
  isMobile: boolean;
  showEmpty: boolean;
  selectedNodeIds: string[];
  duplicateBranch: (ids: string[]) => void;
}) {
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
      <div className="flex-1 min-h-0 flex">
        <div className="relative flex-1 min-w-0">
          <CanvasFlow />
          {showEmpty && (
            <EmptyStateCard
              onOpenAgent={(prompt) => {
                setPrefillPrompt(prompt);
                setTab("agent");
              }}
              onHighlightNodeAdd={() => {
                const btn = document.querySelector("[data-node-picker]") as HTMLElement | null;
                if (btn) {
                  btn.setAttribute("data-highlighted", "true");
                  setTimeout(() => btn.removeAttribute("data-highlighted"), 1500);
                }
              }}
            />
          )}
        </div>

        {!isMobile && (
          <aside className="shrink-0 w-[340px] border-l border-border bg-surface-0/60 backdrop-blur-md flex flex-col">
            <div className="flex items-center gap-1 border-b border-border px-2 py-2">
              <TabButton
                active={tab === "inspector"}
                onClick={() => setTab("inspector")}
                icon={<Settings2 className="size-3.5" />}
                label="Inspecteur"
              />
              <TabButton
                active={tab === "agent"}
                onClick={() => setTab("agent")}
                icon={<Wand2 className="size-3.5" />}
                label="Agent"
              />
              <div className="ml-auto">
                <PriceBadge className="h-7 px-2.5 text-[11px]" />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {tab === "inspector" ? (
                <InspectorPanel onClose={() => setSelected(null)} />
              ) : (
                <AgentPanel initialPrompt={prefillPrompt} workflowId={workflowId ?? null} />
              )}
            </div>
          </aside>
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
            Dupliquer{selectedNodeIds.length > 1 ? ` (${selectedNodeIds.length})` : ""}
          </button>
        </div>
      )}

      {/* Mobile node-add FAB */}
      {isMobile && (
        <div className="absolute right-3 bottom-3 z-20">
          <NodePicker className="!h-10 shadow-lg" />
        </div>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 h-8 text-xs transition cursor-pointer",
        active
          ? "bg-surface-2 text-foreground"
          : "text-muted-foreground hover:bg-surface-1/60 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
