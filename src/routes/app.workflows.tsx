import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Workflow, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { listWorkflows, createWorkflow, type WorkflowListItem } from "@/lib/api/workflows";

export const Route = createFileRoute("/app/workflows")({
  component: WorkflowsPage,
});

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Jamais exécuté";
  const d = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD}j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function WorkflowsPage() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listWorkflows({ data: undefined })
      .then(setWorkflows)
      .catch(() => setWorkflows([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const { id } = await createWorkflow({ data: {} });
      navigate({ to: "/canvas/$id", params: { id: String(id) } });
    } catch {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Workflows
          </div>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
            Tous vos workflows.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Créez et gérez vos pipelines d'automatisation.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/15 px-4 py-2 text-sm font-medium text-amber-soft transition cursor-pointer",
            "hover:bg-amber/25 disabled:opacity-50",
          )}
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Nouveau workflow
        </button>
      </div>

      {loading ? (
        <div className="mt-16 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" />
          Chargement…
        </div>
      ) : workflows.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <div className="grid place-items-center size-16 mx-auto rounded-2xl border border-border bg-surface-1/60 mb-4">
            <Workflow className="size-7 text-muted-foreground/60" />
          </div>
          <div className="font-display text-2xl mb-2">Aucun workflow.</div>
          <div className="text-sm">
            Créez votre premier workflow pour commencer à automatiser.
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <Link
              key={wf.id}
              to="/canvas/$id"
              params={{ id: String(wf.id) }}
              className="group surface-gradient-border rounded-2xl bg-surface-1/60 backdrop-blur p-5 hover:bg-surface-1/80 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_oklch(0.78_0.16_70_/_0.25)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg tracking-[-0.01em] truncate">
                      {wf.name}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {wf.status === "running"
                      ? "En cours"
                      : wf.status === "error"
                        ? "Erreur"
                        : "Inactif"}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider",
                    wf.status === "running"
                      ? "bg-amber/20 text-amber-soft"
                      : wf.status === "error"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-surface-3 text-muted-foreground",
                  )}
                >
                  {wf.status === "running"
                    ? "Actif"
                    : wf.status === "error"
                      ? "Erreur"
                      : "Idle"}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {formatRelative(wf.lastRunAt)}
                </div>
                {wf.lastRunStatus && (
                  <span
                    className={cn(
                      "text-[9px] font-mono uppercase tracking-wider",
                      wf.lastRunStatus === "success"
                        ? "text-emerald"
                        : wf.lastRunStatus === "failed"
                          ? "text-red-400"
                          : "text-muted-foreground",
                    )}
                  >
                    {wf.lastRunStatus === "success"
                      ? "Succès"
                      : wf.lastRunStatus === "failed"
                        ? "Échec"
                        : wf.lastRunStatus}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
