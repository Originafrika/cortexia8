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
import { getWorkflow } from "@/lib/api/workflows";
import { graphOps } from "@/lib/api/canvas-graph-ops";
import { loadSession } from "@/lib/auth-store";
import { sql } from "@/lib/db";
import {
  estimateNodePrice,
  portsForCategory,
  type CanvasEdge,
  type CanvasNode,
  type NodeStatus,
  type NodeResult,
} from "@/lib/canvas-types";
import { runCanvas } from "@/lib/api/canvas-run";

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

function getClientUserId(): number | null {
  const session = loadSession();
  if (!session?.user?.id) return null;
  const id = Number(session.user.id);
  return isNaN(id) ? null : id;
}

/** Map a numeric DB node id to a string id used by React Flow. */
function dbNodeId(id: number): string {
  return `db_${id}`;
}

/** Extract the numeric DB id from a string id, or return null if not a DB node. */
function parseDbNodeId(id: string): number | null {
  if (!id.startsWith("db_")) return null;
  const n = Number(id.slice(3));
  return isNaN(n) ? null : n;
}

let _saveTimer: ReturnType<typeof setTimeout> | null = null;

function persistStatusChange(nodeId: string, status: string) {
  const dbId = parseDbNodeId(nodeId);
  if (dbId == null) return;
  const userId = getClientUserId();
  if (userId == null) return;
  graphOps({
    data: {
      userId,
      ops: [{ op: "updateNode", nodeId: dbId, patch: { status } }],
    },
  }).catch((err) => {
    console.error("[canvas-store] persistStatusChange graphOps failed", err);
  });
}

type CanvasState = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  readOnly: boolean;
  workflowId: string | null;
  newNodeIds: Set<string>;
  newEdgeIds: Set<string>;
  cascadeDelays: Map<string, number>;

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
  duplicateBranch: (nodeIds: string[]) => void;
  setNodes: (updater: (nodes: CanvasNode[]) => CanvasNode[]) => void;
  setEdges: (updater: (edges: CanvasEdge[]) => CanvasEdge[]) => void;

  // Persistence
  loadWorkflow: (id: number) => Promise<void>;
  saveWorkflow: () => void;

  // Run
  runNode: (id: string) => Promise<void>;
  runAll: () => Promise<void>;
  rerunNode: (id: string) => Promise<void>;

  // Cascade animation
  triggerCascadeAnimation: (newNodeIds: string[], newEdgeIds: string[]) => void;
  clearCascadeAnimation: () => void;

  // Aggregate
  totalCost: () => number;
  setReadOnly: (v: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNodeIds: [],
  readOnly: false,
  workflowId: null,
  newNodeIds: new Set<string>(),
  newEdgeIds: new Set<string>(),
  cascadeDelays: new Map<string, number>(),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as CanvasNode[] });
    // Sync single selection (backward compat)
    const sel = changes.find((c) => c.type === "select");
    if (sel && sel.type === "select") {
      set({ selectedNodeId: sel.selected ? sel.id : null });
    }
    // Sync multi-selection from React Flow nodes
    const nextSelected = (get().nodes as CanvasNode[])
      .filter((n) => (n as unknown as { selected?: boolean }).selected)
      .map((n) => n.id);
    set({ selectedNodeIds: nextSelected });
    // Debounced position persistence
    const posChanges = changes.filter((c) => c.type === "position" && c.positionAbsolute);
    if (posChanges.length > 0) {
      get().saveWorkflow();
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
    const newEdge: CanvasEdge = {
      ...connection,
      data: media ? { media } : undefined,
      animated: true,
    } as CanvasEdge;
    set({ edges: addEdge(newEdge, get().edges) as CanvasEdge[] });

    const wid = get().workflowId;
    const userId = getClientUserId();
    if (wid && userId != null && connection.source && connection.target) {
      const srcDbId = parseDbNodeId(connection.source);
      const tgtDbId = parseDbNodeId(connection.target);
      if (srcDbId != null && tgtDbId != null) {
        graphOps({
          data: {
            userId,
            ops: [{
              op: "createEdge",
              workflowId: Number(wid),
              sourceNodeId: srcDbId,
              targetNodeId: tgtDbId,
              sourceOutputKey: connection.sourceHandle ?? undefined,
              targetInputKey: connection.targetHandle ?? undefined,
            }],
          },
        }).catch((err) => {
          console.error("[canvas-store] createEdge graphOps failed", err);
        });
      }
    }
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
    const pos = position ?? { x: 120 + Math.random() * 80, y: 120 + Math.random() * 80 };
    const node: CanvasNode = {
      id,
      type: "modelNode",
      position: pos,
      data: {
        modelSlug: m.slug,
        modelName: m.name,
        provider: m.provider,
        category: m.category,
        status: "unconfigured",
        progress: 0,
        step: "",
        params: initStateForModel(m),
        result: null,
        priceUSD: price,
        lastRunAt: null,
      },
    };
    set({ nodes: [...get().nodes, node], selectedNodeId: id });

    const wid = get().workflowId;
    const userId = getClientUserId();
    if (wid && userId != null) {
      graphOps({
        data: {
          userId,
          ops: [{
            op: "createNode",
            workflowId: Number(wid),
            modelSlug: m.slug,
            x: pos.x,
            y: pos.y,
            config: initStateForModel(m),
          }],
        },
      }).then((res) => {
        const ok = res.results[0];
        const dbId = ok && ok.status === "ok" ? ok.result?.nodeId : undefined;
        if (dbId == null) return;
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, id: dbNodeId(dbId) } : n,
          ),
        });
      }).catch((err) => {
        console.error("[canvas-store] createNode graphOps failed", err);
      });
    }

    return id;
  },

  updateNodeData: (id, patch) => {
    set({
      nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    });
  },

  updateNodeParams: (id, params) => {
    let newStatus: NodeStatus | undefined;
    set({
      nodes: get().nodes.map((n) => {
        if (n.id !== id) return n;
        const merged = { ...n.data.params, ...params };
        const m = getModel(n.data.modelSlug);
        const price = m ? estimateNodePrice(m, merged) : n.data.priceUSD;
        let status = n.data.status;
        if (m && allRequiredParamsFilled(m, merged)) {
          if (status === "unconfigured" || status === "idle") {
            status = "ready";
            newStatus = "ready";
          }
        }
        return { ...n, data: { ...n.data, params: merged, priceUSD: price, status } };
      }),
    });

    const dbId = parseDbNodeId(id);
    if (dbId != null) {
      const userId = getClientUserId();
      if (userId != null) {
        const ops: Array<{ op: "updateNode"; nodeId: number; patch: Record<string, unknown> }> = [
          { op: "updateNode", nodeId: dbId, patch: { config: params } },
        ];
        if (newStatus) {
          ops.push({ op: "updateNode", nodeId: dbId, patch: { status: newStatus } });
        }
        graphOps({
          data: { userId, ops },
        }).catch((err) => {
          console.error("[canvas-store] updateNodeParams graphOps failed", err);
        });
      }
    }
  },

  removeNode: (id) => {
    const removedEdges = get().edges.filter((e) => e.source === id || e.target === id);
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });

    const dbId = parseDbNodeId(id);
    if (dbId != null) {
      const userId = getClientUserId();
      if (userId != null) {
        const ops: Array<{ op: "deleteEdge"; edgeId: number } | { op: "deleteNode"; nodeId: number }> = [];
        for (const e of removedEdges) {
          const edgeDbId = e.id.startsWith("e_db_") ? Number(e.id.slice(5)) : NaN;
          if (!isNaN(edgeDbId)) ops.push({ op: "deleteEdge", edgeId: edgeDbId });
        }
        ops.push({ op: "deleteNode", nodeId: dbId });
        graphOps({
          data: { userId, ops },
        }).catch((err) => {
          console.error("[canvas-store] removeNode graphOps failed", err);
        });
      }
    }
  },

  duplicateBranch: (nodeIds) => {
    if (nodeIds.length === 0) return;
    const { nodes, edges } = get();
    const selectedSet = new Set(nodeIds);

    // Find internal edges: both source and target are in the selected set
    const internalEdges = edges.filter(
      (e) => selectedSet.has(e.source) && selectedSet.has(e.target),
    );

    // Create id mapping: original id -> new id
    const idMap = new Map<string, string>();
    const newNodes: CanvasNode[] = [];

    for (const origId of nodeIds) {
      const orig = nodes.find((n) => n.id === origId);
      if (!orig) continue;
      const newId = nid("dup");
      idMap.set(origId, newId);
      newNodes.push({
        ...orig,
        id: newId,
        position: {
          x: orig.position.x + 100,
          y: orig.position.y + 50,
        },
        data: {
          ...orig.data,
          status: "ready" as NodeStatus,
          result: null,
          progress: 0,
          step: "",
          lastRunAt: null,
        },
      });
    }

    // Create copies of internal edges
    const newEdges: CanvasEdge[] = internalEdges.map((e) => ({
      ...e,
      id: nid("e"),
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
    }));

    set({
      nodes: [...get().nodes, ...newNodes],
      edges: [...get().edges, ...newEdges],
    });

    // Persist via graphOps
    const wid = get().workflowId;
    const userId = getClientUserId();
    if (wid && userId != null) {
      const ops: Array<Parameters<typeof graphOps>[0]["data"]["ops"][number]> = [];
      for (const nn of newNodes) {
        ops.push({
          op: "createNode",
          workflowId: Number(wid),
          modelSlug: nn.data.modelSlug,
          x: nn.position.x,
          y: nn.position.y,
          config: nn.data.params,
        });
      }
      if (ops.length > 0) {
        graphOps({ data: { userId, ops } }).catch((err) => {
          console.error("[canvas-store] duplicateBranch createNode graphOps failed", err);
        });
      }
    }
  },

  setNodes: (updater) => set({ nodes: updater(get().nodes) }),
  setEdges: (updater) => set({ edges: updater(get().edges) }),

  loadWorkflow: async (id) => {
    try {
      const res = await getWorkflow({ data: { workflowId: id } });
      const dbNodeIds = new Map<number, string>();

      const nodes: CanvasNode[] = res.nodes.map((n) => {
        const cid = dbNodeId(n.id);
        dbNodeIds.set(n.id, cid);
        const m = getModel(n.modelSlug);
        const category = m?.category ?? "image";
        const config = n.config ?? {};
        const price = m ? estimateNodePrice(m, config) : 0;
        return {
          id: cid,
          type: "modelNode",
          position: { x: n.x, y: n.y },
          data: {
            modelSlug: n.modelSlug,
            modelName: m?.name ?? n.modelSlug,
            provider: m?.provider ?? "",
            category,
            status: (n.status as NodeStatus) ?? "unconfigured",
            progress: 0,
            step: "",
            params: config,
            result: null,
            priceUSD: price,
            lastRunAt: null,
          },
        };
      });

      const edges: CanvasEdge[] = res.edges.map((e) => ({
        id: `e_db_${e.id}`,
        source: dbNodeIds.get(e.sourceNodeId) ?? String(e.sourceNodeId),
        target: dbNodeIds.get(e.targetNodeId) ?? String(e.targetNodeId),
        sourceHandle: e.sourceOutputKey ?? "out",
        targetHandle: e.targetInputKey ?? "in",
        animated: true,
      }));

      set({ workflowId: String(id), nodes, edges, selectedNodeId: null });
    } catch (err) {
      console.error("[canvas-store] loadWorkflow failed", err);
    }
  },

  saveWorkflow: () => {
    const wid = get().workflowId;
    if (!wid) return;
    const userId = getClientUserId();
    if (userId == null) return;

    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(async () => {
      const { nodes, edges } = get();
      const ops: Array<Parameters<typeof graphOps>[0]["data"]["ops"][number]> = [];

      for (const n of nodes) {
        const dbId = parseDbNodeId(n.id);
        if (dbId != null) {
          ops.push({
            op: "updateNode",
            nodeId: dbId,
            patch: {
              config: n.data.params,
              x: n.position.x,
              y: n.position.y,
            },
          });
        }
      }

      if (ops.length === 0) return;
      try {
        await graphOps({ data: { userId, ops } });
      } catch (err) {
        console.error("[canvas-store] saveWorkflow failed", err);
      }
    }, 500);
  },

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
    persistStatusChange(id, "running");

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
      persistStatusChange(id, "failed");
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
        persistStatusChange(id, "failed");
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

  rerunNode: async (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    if (get().readOnly) return;

    // Parse the DB node ID
    const dbNodeId = parseDbNodeId(id);
    if (dbNodeId == null) return;

    const workflowId = get().workflowId;
    if (!workflowId) return;

    const userId = getClientUserId();
    if (userId == null) return;

    // Find all descendants of this node
    const descendantIds = new Set<string>();
    const stack = [id];
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const edge of get().edges) {
        if (edge.source === current && !descendantIds.has(edge.target)) {
          descendantIds.add(edge.target);
          stack.push(edge.target);
        }
      }
    }

    // Update UI: mark this node + descendants as "running"
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === id || descendantIds.has(n.id)) {
          return { ...n, data: { ...n.data, status: "running", progress: 0, step: "Relancement…" } };
        }
        return n;
      }),
    });

    // Persist status changes for affected nodes
    persistStatusChange(id, "running");
    for (const descId of descendantIds) {
      persistStatusChange(descId, "running");
    }

    try {
      const res = await runCanvas({
        data: {
          workflowId: Number(workflowId),
          userId,
          rerunNodeId: dbNodeId,
        },
      });

      // For nodes that are not descendants, restore their visual status
      // since the server reused their results
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== id && !descendantIds.has(n.id)) {
            // These nodes were reused - keep their current status
            return n;
          }
          // Mark descendants as queued
          return { ...n, data: { ...n.data, step: "En file d'attente…", progress: 10 } };
        }),
      });

      // Poll status for each descendant that was re-run
      // First find the node execution IDs from the run
      const affectedNodeIds = [id, ...descendantIds];
      for (const nodeId of affectedNodeIds) {
        const nodeDbId = parseDbNodeId(nodeId);
        if (nodeDbId == null) continue;
        
        // Get the run_node_execution ID for this node in the new run
        const execRows = (await sql`
          SELECT id FROM run_node_executions
          WHERE run_id = ${res.runId} AND workflow_node_id = ${nodeDbId}
          LIMIT 1
        `) as { id: number }[];
        if (execRows.length > 0) {
          await pollGenerationStatus(set, get, nodeId, execRows[0].id);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      set({
        nodes: get().nodes.map((n) => {
          if (n.id === id || descendantIds.has(n.id)) {
            return { ...n, data: { ...n.data, status: "error", step: message, progress: 0 } };
          }
          return n;
        }),
      });
      persistStatusChange(id, "failed");
      for (const descId of descendantIds) {
        persistStatusChange(descId, "failed");
      }
    }
  },

  triggerCascadeAnimation: (nodeIds, edgeIds) => {
    const { nodes } = get();
    const STAGGER_MS = 120;
    const sorted = [...nodeIds]
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean)
      .sort((a, b) => (a!.position.y - b!.position.y) || (a!.position.x - b!.position.x));
    const delays = new Map<string, number>();
    sorted.forEach((n, i) => delays.set(n!.id, i * STAGGER_MS));
    set({ newNodeIds: new Set(nodeIds), newEdgeIds: new Set(edgeIds), cascadeDelays: delays });
  },

  clearCascadeAnimation: () => {
    set({ newNodeIds: new Set(), newEdgeIds: new Set(), cascadeDelays: new Map() });
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

function allRequiredParamsFilled(m: Model, params: Record<string, unknown>): boolean {
  return m.params.every((p) => {
    if (!p.required) return true;
    const val = params[p.key];
    if (val === undefined || val === null || val === "") return false;
    if (p.kind === "toggle") return true;
    return true;
  });
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
          persistStatusChange(nodeId, "completed");
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
          persistStatusChange(nodeId, "failed");
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
          persistStatusChange(nodeId, "failed");
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
    persistStatusChange(nodeId, "failed");
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
