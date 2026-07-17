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
import {
  estimateNodePrice,
  portsForCategory,
  type CanvasEdge,
  type CanvasNode,
  type NodeStatus,
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
    const m = getModel(node.data.modelSlug);
    if (!m) return;
    if (get().readOnly) return;

    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, status: "running", progress: 0, step: "" } } : n,
      ),
    });

    const steps = stepsForCategory(m.category);
    const totalMs = durationForCategory(m.category);
    const stepMs = totalMs / steps.length;

    for (let i = 0; i < steps.length; i++) {
      const p = Math.round(((i + 1) / steps.length) * 100);
      const step = steps[i];
      set({
        nodes: get().nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, progress: p, step } } : n,
        ),
      });
      await new Promise((r) => setTimeout(r, stepMs));
    }

    const result = makeMockResult(m, id);
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
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
  },

  runAll: async () => {
    if (get().readOnly) return;
    const order = topoSort(get().nodes, get().edges);
    for (const id of order) {
      await get().runNode(id);
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

function stepsForCategory(c: Model["category"]): string[] {
  switch (c) {
    case "video":
      return ["Analyse du prompt…", "Sélection du modèle…", "Génération des frames…", "Encodage final…"];
    case "audio":
      return ["Analyse du texte…", "Choix de la voix…", "Synthèse acoustique…", "Post-traitement…"];
    case "image":
      return ["Analyse du prompt…", "Sélection du modèle…", "Débruitage progressif…", "Finalisation…"];
    case "text":
      return ["Analyse du prompt…", "Raisonnement…", "Rédaction…"];
  }
}

function durationForCategory(c: Model["category"]): number {
  switch (c) {
    case "video":
      return 3600;
    case "audio":
      return 1800;
    case "image":
      return 1600;
    case "text":
      return 1100;
  }
}

function makeMockResult(m: Model, id: string) {
  const seed = id.replace(/[^a-z0-9]/gi, "");
  if (m.category === "image") {
    return { kind: "image" as const, url: `https://picsum.photos/seed/${seed}/720/720` };
  }
  if (m.category === "video") {
    return { kind: "video" as const, url: `https://picsum.photos/seed/${seed}/720/405` };
  }
  if (m.category === "audio") {
    return { kind: "audio" as const, url: "" };
  }
  return {
    kind: "text" as const,
    text: `Rédaction générée avec ${m.name} — résultat factice pour démonstration.`,
  };
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
