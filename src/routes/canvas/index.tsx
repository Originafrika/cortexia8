import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { SignedIn, RedirectToSignIn } from "@neondatabase/auth-ui";
import { CanvasFlow } from "@/components/canvas/canvas-flow";
import { InspectorPanel } from "@/components/canvas/inspector-panel";
import { AgentPanel } from "@/components/canvas/agent-panel";
import { NodePicker } from "@/components/canvas/node-picker";
import { RunControls } from "@/components/canvas/run-controls";
import { PriceBadge } from "@/components/canvas/price-badge";
import { useCanvasStore } from "@/lib/canvas-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Eye, Settings2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODELS } from "@/lib/models";

export const Route = createFileRoute("/canvas/")({
  head: () => ({
    meta: [{ title: "Cortexia — Canvas" }, { name: "robots", content: "noindex,nofollow" }],
  }),
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
  const selectedId = useCanvasStore((s) => s.selectedNodeId);
  const setSelected = useCanvasStore((s) => s.setSelectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);

  // Auto-switch to inspector when a node is selected
  useEffect(() => {
    if (selectedId) setTab("inspector");
  }, [selectedId]);

  // Seed a tiny demo graph the first time the page mounts
  useEffect(() => {
    const s = useCanvasStore.getState();
    if (s.nodes.length === 0 && MODELS.length > 0) {
      s.addNode("seedream-5-pro", { x: 220, y: 220 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <NodePicker />
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
        <div className="flex-1 min-h-0 flex">
          <div className="relative flex-1 min-w-0">
            <CanvasFlow />
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
                  <AgentPanel />
                )}
              </div>
            </aside>
          )}
        </div>

        {isMobile && (
          <div className="absolute right-3 bottom-3 z-20">
            <NodePicker className="!h-10 shadow-lg" />
          </div>
        )}
      </ReactFlowProvider>
    </div>
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
