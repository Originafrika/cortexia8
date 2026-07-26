import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Workflow, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { listWorkflows, createWorkflow, type WorkflowListItem } from "@/lib/api/workflows";
import { loadSession } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/app/workflows")({
  component: WorkflowsPage,
});

function formatRelative(dateStr: string | null, t: (key: string) => string): string {
  if (!dateStr) return t("workflows.never_run");
  const d = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t("time.now");
  if (diffMin < 60) return t("time.minutes").replace("{n}", String(diffMin));
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t("time.hours").replace("{n}", String(diffH));
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return t("time.days").replace("{n}", String(diffD));
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function WorkflowsPage() {
  const t = useT();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const session = loadSession();
    console.log("[workflows] useEffect — session:", session ? { token: session.token.slice(0, 12) + "...", user: session.user.email } : "NULL");
    listWorkflows({ data: { sessionToken: session?.token } })
      .then((wf) => {
        console.log("[workflows] listWorkflows result:", wf.length, "workflows");
        setWorkflows(wf);
      })
      .catch((err) => {
        console.error("[workflows] listWorkflows FAILED:", err);
        setWorkflows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    console.log("[workflows] handleCreate called");
    const session = loadSession();
    console.log("[workflows] handleCreate session:", session ? { token: session.token.slice(0, 12) + "...", user: session.user.email } : "NULL");
    setCreating(true);
    try {
      const result = await createWorkflow({ data: { sessionToken: session?.token } });
      console.log("[workflows] createWorkflow result:", result);
      navigate({ to: "/canvas", search: { workflowId: result.id } });
    } catch (err) {
      console.error("[workflows] createWorkflow FAILED:", err);
      setCreating(false);
      toast.error(t("workflows.create_error"));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("workflows.title")}
          </div>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
            {t("workflows.subtitle")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("workflows.desc")}
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
          {t("workflows.new")}
        </button>
      </div>

      {loading ? (
        <div className="mt-16 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" />
          {t("workflows.loading")}
        </div>
      ) : workflows.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <div className="grid place-items-center size-16 mx-auto rounded-2xl border border-border bg-surface-1/60 mb-4">
            <Workflow className="size-7 text-muted-foreground/60" />
          </div>
          <div className="font-display text-2xl mb-2">{t("workflows.empty")}</div>
          <div className="text-sm">
            {t("workflows.empty_desc")}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <Link
              key={wf.id}
              to="/canvas"
              search={{ workflowId: wf.id }}
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
                      ? t("workflows.status.active")
                      : wf.status === "error"
                        ? t("workflows.status.error")
                        : t("workflows.status.idle")}
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
                    ? t("workflows.status.active")
                    : wf.status === "error"
                      ? t("workflows.status.error")
                      : t("workflows.status.idle")}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {formatRelative(wf.lastRunAt, t)}
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
                      ? t("workflows.run_success")
                      : wf.lastRunStatus === "failed"
                        ? t("workflows.run_failed")
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
