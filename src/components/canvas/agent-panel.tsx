import { useState, useEffect, useRef } from "react";
import { useCanvasStore } from "@/lib/canvas-store";
import {
  Sparkles,
  Send,
  Check,
  Loader2,
  Wand2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { runAgent, AGENT_MODELS, type AgentModel, type AgentResponse } from "@/lib/agent";
import {
  createConversation,
  saveMessage,
  getConversationByWorkflow,
} from "@/lib/api/agent-conversations";
import {
  applyAgentPlan,
  COST_CONFIRM_THRESHOLD,
  type AgentApplyResponse,
} from "@/lib/api/agent-apply";
import { agentRun } from "@/lib/api/agent-run";
import { loadSession } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";

const STORAGE_KEY_AGENT_MODEL = "cortexia-agent-model";
const STORAGE_KEY_PERMISSION_MODE = "cortexia-agent-permission-mode";

type PermissionMode = "approve_each" | "auto_run" | "auto_under_threshold";

const STARTERS = [
  "Un mockup produit puis une vidéo UGC à partir de l'image.",
  "Une voix off française pour le teaser, et un storyboard 6 cases.",
  "Génère un plan éditorial, puis anime-le en 5 secondes.",
];

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  proposedPlan?: AgentResponse;
};

export function AgentPanel({
  className,
  initialPrompt,
  workflowId,
}: {
  className?: string;
  initialPrompt?: string;
  workflowId?: number | null;
}) {
  const t = useT();
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ text: string; tone: "info" | "ok" | "muted" | "warn" }[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AgentModel>("claude-sonnet-45");
  const [permissionMode, setPermissionMode] = useState<PermissionMode>("auto_under_threshold");
  const [pendingOperations, setPendingOperations] = useState<AgentResponse | null>(null);
  const [pendingLaunch, setPendingLaunch] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);

  // Conversation state
  const conversationIdRef = useRef<number | null>(null);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  const conversationLoadedRef = useRef(false);

  // Load saved model from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AGENT_MODEL);
    if (saved && AGENT_MODELS.some((m) => m.value === saved)) {
      setSelectedModel(saved as AgentModel);
    }
  }, []);

  // Save model to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AGENT_MODEL, selectedModel);
  }, [selectedModel]);

  // Load saved permission mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PERMISSION_MODE);
    if (
      saved &&
      (saved === "approve_each" || saved === "auto_run" || saved === "auto_under_threshold")
    ) {
      setPermissionMode(saved as PermissionMode);
    }
  }, []);

  // Save permission mode to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PERMISSION_MODE, permissionMode);
  }, [permissionMode]);

  // Load existing conversation for this workflow on mount
  useEffect(() => {
    if (workflowId == null || conversationLoadedRef.current) return;
    conversationLoadedRef.current = true;

    getConversationByWorkflow({ data: { workflowId, sessionToken: loadSession()?.token } })
      .then((conv) => {
        if (conv && conv.id) {
          conversationIdRef.current = conv.id;
          conversationHistoryRef.current = conv.messages.map((m) => ({
            role: m.role,
            content: m.content,
            proposedPlan: m.proposedPlan ?? undefined,
          }));
        }
      })
      .catch(() => {
        // Silently ignore — conversation will be created on first message
      });
  }, [workflowId]);

  if (readOnly) return null;

  function pushLog(text: string, tone: "info" | "ok" | "muted" | "warn" = "info") {
    setLog((l) => [...l, { text, tone }]);
  }

  async function executeWithConfirmation(response: AgentResponse, launch = false) {
    if (workflowId == null) {
      pushLog(`Erreur: aucun workflow associé.`, "warn");
      return;
    }

    // Auto-run mode: skip confirmation entirely
    if (permissionMode === "auto_run") {
      await executeOperations(response, launch);
      return;
    }

    const serverOps = response.operations.map((op) => {
      switch (op.type) {
        case "ADD_NODE":
          return { op: "ADD_NODE" as const, modelSlug: op.modelSlug, position: op.position };
        case "CONNECT_NODES":
          return { op: "CONNECT_NODES" as const, source: op.source, target: op.target };
        case "UPDATE_NODE":
          return { op: "UPDATE_NODE" as const, nodeId: op.nodeId, params: op.params };
        case "REMOVE_NODE":
          return { op: "REMOVE_NODE" as const, nodeId: op.nodeId };
      }
    });

    try {
      // Dry-run: get server-side cost estimate and confirmation flag
      const dryResult = (await applyAgentPlan({
        data: {
          workflowId: Number(workflowId),
          operations: serverOps,
          dryRun: true,
        },
      })) as AgentApplyResponse;

      // Approve-each mode: always show confirmation
      if (permissionMode === "approve_each" || dryResult.requiresConfirmation) {
        setPendingOperations(response);
        setPendingLaunch(launch);
        setShowConfirmDialog(true);
        pushLog(
          `⚠ Coût estimé: $${dryResult.estimatedTotalCostUsd.toFixed(4)} (seuil: $${COST_CONFIRM_THRESHOLD})`,
          "warn",
        );
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      pushLog(`Erreur: ${message}`, "warn");
      return;
    }

    await executeOperations(response, launch);
  }

  async function executeOperations(response: AgentResponse, launch = false) {
    if (workflowId == null) {
      pushLog(`Erreur: aucun workflow associé.`, "warn");
      return;
    }

    setBusy(true);
    pushLog(`Application de ${response.operations.length} opération(s) via DB…`, "info");

    try {
      const serverOps = response.operations.map((op) => {
        switch (op.type) {
          case "ADD_NODE":
            return { op: "ADD_NODE" as const, modelSlug: op.modelSlug, position: op.position };
          case "CONNECT_NODES":
            return { op: "CONNECT_NODES" as const, source: op.source, target: op.target };
          case "UPDATE_NODE":
            return { op: "UPDATE_NODE" as const, nodeId: op.nodeId, params: op.params };
          case "REMOVE_NODE":
            return { op: "REMOVE_NODE" as const, nodeId: op.nodeId };
        }
      });

      // Snapshot node/edge IDs before apply for cascade detection
      const prevNodeIds = new Set(useCanvasStore.getState().nodes.map((n) => n.id));
      const prevEdgeIds = new Set(useCanvasStore.getState().edges.map((e) => e.id));

      const result = (await applyAgentPlan({
        data: {
          workflowId: Number(workflowId),
          operations: serverOps,
          launch,
        },
      })) as AgentApplyResponse;

      pushLog(`${result.applied} opération(s) appliquée(s) dans la DB.`, "ok");

      if (result.runId) {
        pushLog(`Exécution lancée (run #${result.runId}).`, "ok");
      }

      // Refresh the canvas store from the DB state
      await useCanvasStore.getState().loadWorkflow(Number(workflowId));
      pushLog(`Canvas synchronisé.`, "ok");

      // Trigger cascade animation for new nodes/edges
      const currentNodeIds = useCanvasStore.getState().nodes.map((n) => n.id);
      const currentEdgeIds = useCanvasStore.getState().edges.map((e) => e.id);
      const newNodeIds = currentNodeIds.filter((id) => !prevNodeIds.has(id));
      const newEdgeIds = currentEdgeIds.filter((id) => !prevEdgeIds.has(id));
      if (newNodeIds.length > 0) {
        useCanvasStore.getState().triggerCascadeAnimation(newNodeIds, newEdgeIds);
        // Auto-clear after animation completes
        const maxDelay = newNodeIds.length * 120 + 400;
        setTimeout(() => useCanvasStore.getState().clearCascadeAnimation(), maxDelay);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      pushLog(`Erreur: ${message}`, "warn");
    } finally {
      setBusy(false);
      setPendingOperations(null);
      setShowConfirmDialog(false);
    }
  }

  async function build(textArg?: string) {
    const text = (textArg ?? prompt).trim();
    if (!text || busy) return;

    setBusy(true);
    setLog([]);
    setPrompt("");
    pushLog(`Analyse de la demande…`, "muted");

    try {
      // Create conversation on first message if needed
      if (conversationIdRef.current == null && workflowId != null) {
        const conv = await createConversation({
          data: { workflowId, sessionToken: loadSession()?.token },
        });
        conversationIdRef.current = conv.id;
      }

      // Save user message
      if (conversationIdRef.current != null) {
        await saveMessage({
          data: {
            conversationId: conversationIdRef.current,
            role: "user",
            content: text,
            sessionToken: loadSession()?.token,
          },
        });
        conversationHistoryRef.current.push({ role: "user", content: text });
      }

      // Get current graph state for context
      const currentGraphState = {
        nodes: nodes.map((n) => ({ id: n.id, slug: n.data.modelSlug })),
        edges: edges.map((e) => ({ source: e.source, target: e.target })),
      };

      const response = await agentRun({
        data: {
          message: text,
          config: {
            model: selectedModel,
            maxTokens: 2048,
          },
          graphState: currentGraphState,
          sessionToken: loadSession()?.token,
        },
      });

      // Save assistant message
      if (conversationIdRef.current != null) {
        await saveMessage({
          data: {
            conversationId: conversationIdRef.current,
            role: "assistant",
            content: response.text,
            proposedPlan: response.operations.length > 0 ? response : undefined,
            sessionToken: loadSession()?.token,
          },
        });
        conversationHistoryRef.current.push({
          role: "assistant",
          content: response.text,
          proposedPlan: response.operations.length > 0 ? response : undefined,
        });
      }

      pushLog(`Réponse reçue (${response.language})`, "info");
      pushLog(response.text, "info");

      if (response.operations.length === 0) {
        pushLog(`Aucune opération générée.`, "warn");
        setBusy(false);
        return;
      }

      pushLog(
        `${response.operations.length} opération(s) proposée(s) · ~$${response.estimatedCost.toFixed(4)}`,
        "info",
      );

      await executeWithConfirmation(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      pushLog(`Erreur: ${message}`, "warn");
    } finally {
      setBusy(false);
    }
  }

  function handleConfirm(launch = false) {
    if (pendingOperations) {
      executeOperations(pendingOperations, launch);
    }
  }

  function handleCancel() {
    setPendingOperations(null);
    setPendingLaunch(false);
    setShowConfirmDialog(false);
    pushLog(`Opération annulée.`, "muted");
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground shrink-0">
            <Wand2 className="size-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium">{t("agent.title")}</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("agent.subtitle")}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="grid place-items-center size-7 rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground transition"
          aria-label={expanded ? t("agent.collapse") : t("agent.expand")}
        >
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-4 py-3 space-y-2">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="agent-model"
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                {t("agent.model")}
              </label>
              <Select
                value={selectedModel}
                onValueChange={(v) => setSelectedModel(v as AgentModel)}
                disabled={busy}
              >
                <SelectTrigger id="agent-model" className="flex-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Permission Mode Selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="permission-mode"
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                {t("agent.permissions")}
              </label>
              <Select
                value={permissionMode}
                onValueChange={(v) => setPermissionMode(v as PermissionMode)}
                disabled={busy}
              >
                <SelectTrigger id="permission-mode" className="flex-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve_each" className="text-xs">
                    {t("agent.approve_each")}
                  </SelectItem>
                  <SelectItem value="auto_run" className="text-xs">
                    {t("agent.auto_run")}
                  </SelectItem>
                  <SelectItem value="auto_under_threshold" className="text-xs">
                    {t("agent.auto_under_threshold")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder={t("agent.placeholder")}
              disabled={busy}
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => void build()}
                disabled={busy || !prompt.trim()}
                size="sm"
                className="flex-1"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> {t("agent.building")}
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" /> {t("agent.build")}
                  </>
                )}
              </Button>
            </div>
            {log.length === 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("agent.examples")}
                </div>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => build(s)}
                    disabled={busy}
                    className="block w-full text-left text-[11px] text-muted-foreground hover:text-foreground rounded-md px-2 py-1.5 hover:bg-surface-2 transition disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Confirmation Dialog */}
          <AlertDialog
            open={showConfirmDialog && !!pendingOperations}
            onOpenChange={(open) => {
              if (!open) handleCancel();
            }}
          >
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber" />
                  {t("agent.confirm.title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("agent.confirm.cost")}{" "}
                  <span className="font-medium text-amber">
                    ${pendingOperations?.estimatedCost?.toFixed(4) ?? "0"}
                  </span>
                  <br />
                  {t("agent.confirm.threshold")} ${COST_CONFIRM_THRESHOLD}
                  <br />
                  {pendingOperations?.operations?.length ?? 0} opération(s) seront exécutées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
                <AlertDialogCancel onClick={handleCancel} className="mt-0">
                  {t("agent.confirm.cancel")}
                </AlertDialogCancel>
                <Button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  size="sm"
                  className="flex-1"
                >
                  {t("agent.confirm.apply")}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleConfirm(true)}
                  size="sm"
                  className="flex-1 bg-amber text-primary-foreground hover:bg-amber/90"
                >
                  {t("agent.confirm.launch")}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {log.length > 0 && (
            <div className="flex-1 min-h-0 overflow-y-auto border-t border-border px-4 py-3 space-y-1.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground sticky top-0 bg-surface-1/95 backdrop-blur py-1 -mt-1">
                {t("agent.journal")}
              </div>
              {log.map((l, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-1.5 text-[11px]",
                    l.tone === "ok" && "text-emerald",
                    l.tone === "muted" && "text-muted-foreground",
                    l.tone === "info" && "text-foreground/85",
                    l.tone === "warn" && "text-amber",
                  )}
                >
                  {l.tone === "ok" ? (
                    <Check className="size-3 mt-0.5 shrink-0" />
                  ) : l.tone === "warn" ? (
                    <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                  ) : l.tone === "info" ? (
                    <Sparkles className="size-3 mt-0.5 shrink-0 text-amber" />
                  ) : (
                    <span className="size-3 mt-0.5 shrink-0 text-center">·</span>
                  )}
                  <span className="leading-relaxed">{l.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
            {nodes.length === 0
              ? t("agent.empty_canvas")
              : nodes.length === 1
                ? t("agent.node_count").replace("{count}", String(nodes.length))
                : t("agent.node_count_plural").replace("{count}", String(nodes.length))}
          </div>
        </div>
      )}
    </div>
  );
}
