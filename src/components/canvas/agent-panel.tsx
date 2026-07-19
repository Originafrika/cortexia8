import { useState, useEffect } from "react";
import { useCanvasStore } from "@/lib/canvas-store";
import { Sparkles, Send, Check, Loader2, Wand2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getModel } from "@/lib/models";
import {
  runAgent,
  shouldConfirmOperation,
  AGENT_MODELS,
  COST_THRESHOLD,
  type AgentModel,
  type AgentResponse,
  type GraphOperation,
} from "@/lib/agent";

const STORAGE_KEY_AGENT_MODEL = "cortexia-agent-model";

const STARTERS = [
  "Un mockup produit puis une vidéo UGC à partir de l'image.",
  "Une voix off française pour le teaser, et un storyboard 6 cases.",
  "Génère un plan éditorial, puis anime-le en 5 secondes.",
];

export function AgentPanel({ className }: { className?: string }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ text: string; tone: "info" | "ok" | "muted" | "warn" }[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AgentModel>("claude-sonnet-4-5");
  const [pendingOperations, setPendingOperations] = useState<AgentResponse | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const addNode = useCanvasStore((s) => s.addNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);

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

  if (readOnly) return null;

  function pushLog(text: string, tone: "info" | "ok" | "muted" | "warn" = "info") {
    setLog((l) => [...l, { text, tone }]);
  }

  function applyOps(ops: GraphOperation[]) {
    const idMap = new Map<string, string>();

    for (const op of ops) {
      switch (op.type) {
        case "ADD_NODE": {
          const position = op.position ?? {
            x: 120 + Math.random() * 80,
            y: 120 + Math.random() * 80,
          };
          const id = addNode(op.modelSlug, position);
          if (id) {
            // Store mapping from temporary ID to real ID
            idMap.set(op.modelSlug, id);
            const model = getModel(op.modelSlug);
            pushLog(`+ ${model?.name ?? op.modelSlug}`, "ok");
          }
          break;
        }
        case "CONNECT_NODES": {
          // Find source and target nodes by their temporary or real IDs
          const sourceId = idMap.get(op.source) ?? op.source;
          const targetId = idMap.get(op.target) ?? op.target;

          // Check if nodes exist
          const sourceNode = nodes.find((n) => n.id === sourceId);
          const targetNode = nodes.find((n) => n.id === targetId);

          if (sourceNode && targetNode) {
            useCanvasStore.getState().onConnect({
              source: sourceId,
              target: targetId,
              sourceHandle: null,
              targetHandle: null,
            });
            pushLog(`↔ liaison ${sourceNode.data.modelName} → ${targetNode.data.modelName}`, "ok");
          }
          break;
        }
        case "UPDATE_NODE": {
          const realId = idMap.get(op.nodeId) ?? op.nodeId;
          useCanvasStore.getState().updateNodeParams(realId, op.params);
          pushLog(`✎ mise à jour des paramètres`, "muted");
          break;
        }
        case "REMOVE_NODE": {
          const realId = idMap.get(op.nodeId) ?? op.nodeId;
          useCanvasStore.getState().removeNode(realId);
          pushLog(`✗ nœud supprimé`, "warn");
          break;
        }
      }
    }
  }

  async function executeWithConfirmation(response: AgentResponse) {
    if (shouldConfirmOperation(response.estimatedCost, COST_THRESHOLD)) {
      setPendingOperations(response);
      setShowConfirmDialog(true);
      pushLog(
        `⚠ Coût estimé: $${response.estimatedCost.toFixed(4)} (seuil: $${COST_THRESHOLD})`,
        "warn"
      );
      return;
    }

    // Execute directly if under threshold
    await executeOperations(response);
  }

  async function executeOperations(response: AgentResponse) {
    setBusy(true);
    pushLog(`Exécution de ${response.operations.length} opération(s)…`, "info");

    try {
      applyOps(response.operations);
      pushLog(`Canvas mis à jour.`, "ok");
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
      // Get current graph state for context
      const currentGraphState = {
        nodes: nodes.map((n) => ({ id: n.id, slug: n.data.modelSlug })),
        edges: edges.map((e) => ({ source: e.source, target: e.target })),
      };

      const response = await runAgent(
        text,
        {
          model: selectedModel,
          maxTokens: 2048,
          costThreshold: COST_THRESHOLD,
        },
        currentGraphState
      );

      pushLog(`Réponse reçue (${response.language})`, "info");
      pushLog(response.text, "info");

      if (response.operations.length === 0) {
        pushLog(`Aucune opération générée.`, "warn");
        setBusy(false);
        return;
      }

      pushLog(
        `${response.operations.length} opération(s) proposée(s) · ~$${response.estimatedCost.toFixed(4)}`,
        "info"
      );

      await executeWithConfirmation(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      pushLog(`Erreur: ${message}`, "warn");
    } finally {
      setBusy(false);
    }
  }

  function handleConfirm() {
    if (pendingOperations) {
      executeOperations(pendingOperations);
    }
  }

  function handleCancel() {
    setPendingOperations(null);
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
            <div className="text-sm font-medium">Agent builder</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Décris · je construis
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="grid place-items-center size-7 rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground transition"
          aria-label={expanded ? "Réduire" : "Déployer"}
        >
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-4 py-3 space-y-2">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="agent-model" className="text-xs text-muted-foreground whitespace-nowrap">
                Modèle:
              </label>
              <select
                id="agent-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as AgentModel)}
                disabled={busy}
                className="flex-1 text-xs bg-surface-2 border border-border rounded-md px-2 py-1.5 text-foreground disabled:opacity-50"
              >
                {AGENT_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Décris le pipeline que tu veux…"
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
                    <Loader2 className="size-3.5 animate-spin" /> Construction…
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" /> Construire
                  </>
                )}
              </Button>
            </div>
            {log.length === 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  Exemples
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
          {showConfirmDialog && pendingOperations && (
            <div className="px-4 py-3 border-t border-amber/30 bg-amber/5">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="size-4 text-amber mt-0.5 shrink-0" />
                <div className="text-xs text-foreground">
                  <div className="font-medium mb-1">Confirmation requise</div>
                  <div className="text-muted-foreground">
                    Coût estimé: <span className="font-medium text-amber">${pendingOperations.estimatedCost.toFixed(4)}</span>
                    <br />
                    Seuil de confirmation: ${COST_THRESHOLD}
                    <br />
                    {pendingOperations.operations.length} opération(s) seront exécutées.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleConfirm}
                  size="sm"
                  className="flex-1 bg-amber text-primary-foreground hover:bg-amber/90"
                >
                  Confirmer
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {log.length > 0 && (
            <div className="flex-1 min-h-0 overflow-y-auto border-t border-border px-4 py-3 space-y-1.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground sticky top-0 bg-surface-1/95 backdrop-blur py-1 -mt-1">
                Journal
              </div>
              {log.map((l, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-1.5 text-[11px]",
                    l.tone === "ok" && "text-emerald",
                    l.tone === "muted" && "text-muted-foreground",
                    l.tone === "info" && "text-foreground/85",
                    l.tone === "warn" && "text-amber"
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
              ? "Canvas vide. Décris ton pipeline pour le peupler."
              : `${nodes.length} nœud${nodes.length > 1 ? "s" : ""} sur le canvas.`}
          </div>
        </div>
      )}
    </div>
  );
}
