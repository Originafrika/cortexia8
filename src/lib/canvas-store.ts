import { create } from "zustand";
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import { getModel, type Model } from "@/lib/models";
import { generate } from "@/lib/api/generate";
import { generationStatus } from "@/lib/api/generation-status";
import {
  estimateNodePrice,
  portsForCategory,
  type CanvasEdge,
  type CanvasNode,
  type NodeStatus,
  type NodeResult,
} from "@/lib/canvas-types";

let _seq = 0;
function nid(prefix = "n"): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq}`;
}

function isCompatibleConnection(source: CanvasNode | undefined, target: CanvasNode | undefined) {
  if (!source || !target) return false;
  const s = portsForCategory(source.data.category).out;
  const t = portsForCategory(target.data.category).in;
  return t.includes(s);
}

type CanvasState = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
  readOnly: boolean;

  // React Flow change handlers
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  isValidConnection: (connection: Connection | Edge) => boolean;

  // Selection
  setSelectedNodeId: (id: string | null) => void;

  // Node mutations
  addNode: (modelSlug: string, position?: { x: number; y: number }) => string | null;
  updateNodeData: (id: string, patch: Partial<CanvasNode["data"]>) => void;
  updateNodeParams: (id: string, params: Record<string, unknown>) => void;
  removeNode: (id: string) => void;
  setNodes: (updater: (nodes: CanvasNode[]) => CanvasNode[]) => void;
  setEdges: (updater: (edges: CanvasEdge[]) => CanvasEdge[]) => void;

  // Run
  runNode: (id: string) => Promise<void>;
  runAll: () => Promise<void>;

  // Aggregate
  totalCost: () => number;
  setReadOnly: (v: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  readOnly: false,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as CanvasNode[] });
    // Sync selection
    const sel = changes.find((c) => c.type === "select");
    if (sel && sel.type === "select") {
      set({ selectedNodeId: sel.selected ? sel.id : null });
    }
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as CanvasEdge[] });
  },

  onConnect: (connection) => {
    const source = get().nodes.find((n) => n.id === connection.source);
    const target = get().nodes.find((n) => n.id === connection.target);
    if (!isCompatibleConnection(source, target)) return;
    const media = source ? portsForCategory(source.data.category).out : undefined;
    set({
      edges: addEdge(
        { ...connection, data: media ? { media } : undefined, animated: true },
        get().edges,
      ) as CanvasEdge[],
    });
  },

  isValidConnection: (connection) => {
    if (!("source" in connection) || !connection.source || !connection.target) return false;
    const source = get().nodes.find((n) => n.id === connection.source);
    const target = get().nodes.find((n) => n.id === connection.target);
    return isCompatibleConnection(source, target);
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  addNode: (modelSlug, position) => {
    const m = getModel(modelSlug);
    if (!m) return null;
    const id = nid("n");
    const price = m.priceUSD ?? m.tiers?.[0]?.priceUSD ?? m.io?.outputUSD ?? 0;
    const node: CanvasNode = {
      id,
      type: "modelNode",
      position: position ?? { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 },
      data: {
        modelSlug: m.slug,
        modelName: m.name,
        provider: m.provider,
        category: m.category,
        status: "idle",
        progress: 0,
        step: "",
        params: initStateForModel(m),
        result: null,
        priceUSD: price,
        lastRunAt: null,
      },
    };
    set({ nodes: [...get().nodes, node], selectedNodeId: id });
    return id;
  },

  updateNodeData: (id, patch) => {
    set({
      nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    });
  },

  updateNodeParams: (id, params) => {
    set({
      nodes: get().nodes.map((n) => {
        if (n.id !== id) return n;
        const merged = { ...n.data.params, ...params };
        const m = getModel(n.data.modelSlug);
        const price = m ? estimateNodePrice(m, merged) : n.data.priceUSD;
        return { ...n, data: { ...n.data, params: merged, priceUSD: price } };
      }),
    });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },

  setNodes: (updater) => set({ nodes: updater(get().nodes) }),
  setEdges: (updater) => set({ edges: updater(get().edges) }),

  runNode: async (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    if (get().readOnly) return;

    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, status: "running", progress: 0, step: "Soumission…" } }
          : n,
      ),
    });

    try {
      const res = await generate({
        data: {
          modelSlug: node.data.modelSlug,
          input: node.data.params,
        },
      });

      const runNodeExecId = res.runNodeExecutionId;

      set({
        nodes: get().nodes.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, step: "En file d'attente…", progress: 10 } }
            : n,
        ),
      });

      await pollGenerationStatus(set, get, id, runNodeExecId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      set({
        nodes: get().nodes.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, status: "error", step: message, progress: 0 } }
            : n,
        ),
      });
    }
  },

  runAll: async () => {
    if (get().readOnly) return;
    const order = topoSort(get().nodes, get().edges);
    const failedNodes = new Set<string>();
    for (const id of order) {
      const node = get().nodes.find((n) => n.id === id);
      if (!node || node.data.status === "running") continue;
      const upstreamFailed = get().edges.some(
        (e) => e.target === id && failedNodes.has(e.source),
      );
      if (upstreamFailed) {
        set({
          nodes: get().nodes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: "error",
                    step: "Dépendance en échec",
                    progress: 0,
                  },
                }
              : n,
          ),
        });
        failedNodes.add(id);
        continue;
      }
      await get().runNode(id);
      const updated = get().nodes.find((n) => n.id === id);
      if (updated?.data.status === "error") {
        failedNodes.add(id);
      }
    }
  },

  totalCost: () => get().nodes.reduce((s, n) => s + (n.data.priceUSD || 0), 0),

  setReadOnly: (v) => set({ readOnly: v }),
}));

function initStateForModel(m: Model): Record<string, unknown> {
  const init: Record<string, unknown> = {};
  m.params.forEach((p) => {
    if (p.kind === "slider") init[p.key] = p.default;
    if (p.kind === "select") init[p.key] = p.options[0];
    if (p.kind === "toggle") init[p.key] = !!p.default;
  });
  return init;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150;
const MAX_CONSECUTIVE_ERRORS = 5;

function pollGenerationStatus(
  set: (partial: CanvasState | ((s: CanvasState) => Partial<CanvasState>)) => void,
  get: () => CanvasState,
  nodeId: string,
  runNodeExecId: number,
) {
  let consecutiveErrors = 0;

  return (async () => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      try {
        const status = await generationStatus({ data: { id: runNodeExecId } });
        consecutiveErrors = 0;

        const nodeExec = status.nodes.find((n) => n.id === runNodeExecId);
        if (!nodeExec) continue;

        const kieStatus = nodeExec.status;
        const progress = kieStatus === "running" ? 60 : kieStatus === "queued" ? 30 : 0;
        const stepLabel =
          kieStatus === "running"
            ? "Génération en cours…"
            : kieStatus === "queued"
              ? "En file d'attente…"
              : "";

        if (kieStatus === "running" || kieStatus === "queued") {
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, progress, step: stepLabel } }
                : n,
            ),
          });
          continue;
        }

        if (kieStatus === "success" || kieStatus === "succeeded") {
          const asset = nodeExec.asset;
          let result: NodeResult | null = null;
          if (asset) {
            const url = asset.previewUrl || asset.storageUrl;
            if (asset.type === "image") {
              result = { kind: "image", url };
            } else if (asset.type === "video") {
              result = { kind: "video", url };
            } else if (asset.type === "audio") {
              result = { kind: "audio", url };
            } else if (asset.type === "text") {
              result = { kind: "text", text: url };
            }
          }
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: "done",
                      progress: 100,
                      step: "",
                      result,
                      lastRunAt: new Date().toISOString(),
                    },
                  }
                : n,
            ),
          });
          return;
        }

        if (kieStatus === "failed" || kieStatus === "error") {
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: "error",
                      step: nodeExec.errorMessage || "Échec de la génération",
                      progress: 0,
                    },
                  }
                : n,
            ),
          });
          return;
        }
      } catch (err) {
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          const message = err instanceof Error ? err.message : "Erreur de polling persistante";
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: "error",
                      step: message,
                      progress: 0,
                    },
                  }
                : n,
            ),
          });
          return;
        }
      }
    }

    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                status: "error",
                step: "Délai d'attente dépassé",
                progress: 0,
              },
            }
          : n,
      ),
    });
  })();
}

/** Topological order respecting edge direction (sources first). */
function topoSort(nodes: CanvasNode[], edges: CanvasEdge[]): string[] {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => {
    indeg.set(n.id, 0);
    adj.set(n.id, []);
  });
  edges.forEach((e) => {
    adj.get(e.source)?.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  });
  const q: string[] = [];
  indeg.forEach((d, id) => {
    if (d === 0) q.push(id);
  });
  const out: string[] = [];
  while (q.length) {
    const id = q.shift()!;
    out.push(id);
    for (const next of adj.get(id) ?? []) {
    const d = (indeg.get(next) ?? 0) - 1;
    indeg.set(next, d);
      if (d === 0) q.push(next);
    }
  }
  // Append any remaining (cycles / disconnected) in their original order
  for (const n of nodes) if (!out.includes(n.id)) out.push(n.id);
  return out;
}

// Re-export the port compat helper for use elsewhere
export { isCompatibleConnection };
export type { NodeStatus };
