import { useCallback, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getWorkflowRuns, type WorkflowRun, type WorkflowRunNodeExec } from "@/lib/api/workflow-runs";
import { cn } from "@/lib/utils";
import {
  Check,
  AlertTriangle,
  Loader2,
  Clock,
  DollarSign,
  Layers,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string | number | null;
};

export function RunHistoryPanel({ open, onOpenChange, workflowId }: Props) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

  const fetchRuns = useCallback(async () => {
    if (workflowId == null || !open) return;
    setLoading(true);
    try {
      const res = await getWorkflowRuns({ data: { workflowId: Number(workflowId) } });
      setRuns(res.runs);
    } catch (err) {
      console.error("[run-history] fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [workflowId, open]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedRun(null);
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 pt-5 pb-3 border-b border-border">
          {selectedRun ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition"
                aria-label="Retour"
              >
                <ArrowLeft className="size-4" />
              </button>
              <SheetTitle className="text-base">Run #{selectedRun.id}</SheetTitle>
            </div>
          ) : (
            <>
              <SheetTitle className="text-base">Historique des runs</SheetTitle>
              <SheetDescription className="text-xs">
                {runs.length} run{runs.length !== 1 ? "s" : ""} pour ce workflow
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          {selectedRun ? (
            <RunDetail run={selectedRun} />
          ) : (
            <RunList
              runs={runs}
              loading={loading}
              onSelect={setSelectedRun}
            />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function RunList({
  runs,
  loading,
  onSelect,
}: {
  runs: WorkflowRun[];
  loading: boolean;
  onSelect: (run: WorkflowRun) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Clock className="size-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Aucun run pour ce workflow.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Lance une génération pour commencer l'historique.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {runs.map((run) => (
        <button
          key={run.id}
          type="button"
          onClick={() => onSelect(run)}
          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-surface-1/60 transition cursor-pointer"
        >
          <StatusIcon status={run.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Run #{run.id}</span>
              <StatusBadge status={run.status} />
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] text-muted-foreground font-mono">
                {formatDate(run.startedAt)}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Layers className="size-2.5" />
                {run.nodeCount}
              </span>
              {run.totalCostUsd > 0 && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <DollarSign className="size-2.5" />
                  ${run.totalCostUsd.toFixed(4)}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
        </button>
      ))}
    </div>
  );
}

function RunDetail({ run }: { run: WorkflowRun }) {
  const succeeded = run.nodes.filter((n) => n.status === "succeeded").length;
  const failed = run.nodes.filter((n) => n.status === "failed").length;

  return (
    <div className="p-4 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<Layers className="size-3.5" />}
          label="Nœuds"
          value={String(run.nodeCount)}
        />
        <StatCard
          icon={<Check className="size-3.5 text-emerald" />}
          label="Réussis"
          value={String(succeeded)}
          accent={succeeded > 0 ? "text-emerald" : undefined}
        />
        <StatCard
          icon={<DollarSign className="size-3.5" />}
          label="Coût"
          value={`$${run.totalCostUsd.toFixed(4)}`}
        />
      </div>

      {failed > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber/10 border border-amber/20 text-xs text-amber-soft">
          <AlertTriangle className="size-3.5 shrink-0" />
          {failed} nœud{failed > 1 ? "s" : ""} en échec
        </div>
      )}

      {/* Node executions */}
      <div className="space-y-1">
        <div className="px-1 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
          Exécutions des nœuds
        </div>
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {run.nodes.map((node) => (
            <NodeExecRow key={node.id} node={node} />
          ))}
          {run.nodes.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Aucune exécution enregistrée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NodeExecRow({ node }: { node: WorkflowRunNodeExec }) {
  return (
    <div className="px-3 py-2.5 bg-surface-0/40">
      <div className="flex items-center gap-2">
        <StatusDot status={node.status} />
        <span className="text-sm font-medium truncate flex-1">{node.modelName}</span>
        {node.costUsd > 0 && (
          <span className="text-[10px] text-muted-foreground font-mono">
            ${node.costUsd.toFixed(4)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1 ml-5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {node.status}
        </span>
        {node.startedAt && (
          <span className="text-[10px] text-muted-foreground/60">
            {formatDate(node.startedAt)}
          </span>
        )}
        {node.errorMessage && (
          <span className="text-[10px] text-amber-soft truncate max-w-[200px]">
            {node.errorMessage}
          </span>
        )}
      </div>
      {node.outputPreviewUrl && (
        <div className="mt-2 ml-5">
          <img
            src={node.outputPreviewUrl}
            alt=""
            className="h-16 w-16 rounded-md object-cover border border-border"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-0/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn("text-sm font-medium tabular-nums", accent)}>{value}</div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  const cls = "size-4 shrink-0";
  if (status === "running") return <Loader2 className={cn(cls, "animate-spin text-amber")} />;
  if (status === "completed" || status === "succeeded")
    return <Check className={cn(cls, "text-emerald")} />;
  if (status === "failed" || status === "error")
    return <AlertTriangle className={cn(cls, "text-amber-soft")} />;
  return <Clock className={cn(cls, "text-muted-foreground")} />;
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "succeeded" || status === "completed"
      ? "bg-emerald"
      : status === "failed"
        ? "bg-red-500"
        : status === "running"
          ? "bg-amber animate-pulse"
          : "bg-muted-foreground/40";
  return <span className={cn("size-2 rounded-full shrink-0", color)} />;
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "running"
      ? "bg-amber/20 text-amber-soft"
      : status === "completed" || status === "succeeded"
        ? "bg-emerald/20 text-emerald"
        : status === "failed"
          ? "bg-red-500/20 text-red-400"
          : "bg-surface-2 text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", cls)}>
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `il y a ${diffD}j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}
