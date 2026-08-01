/**
 * Global app state with localStorage persistence.
 * Persists across tab close/reopen so users can resume where they left off.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActiveGeneration = {
  id: string;
  status: "loading" | "success" | "error";
  progress: number;
  error: string | null;
  runId: number | null;
  prompt: string;
  modelSlug: string;
  resultUrl: string | null;
  createdAt: number;
};

export type HistoryEntry = {
  id: string;
  prompt: string;
  modelSlug: string;
  modelName: string;
  resultUrl: string | null;
  cost: number;
  timestamp: number;
};

type AppState = {
  activeGens: Record<string, ActiveGeneration>;
  history: HistoryEntry[];
  canvasNodes: unknown[];
  canvasEdges: unknown[];
  canvasWorkflowId: number | null;
  playgroundPrompt: string;
  playgroundParams: Record<string, unknown>;
  lastModelSlug: string | null;
  balance: number | null;
  addGeneration: (gen: ActiveGeneration) => void;
  updateGeneration: (id: string, updates: Partial<ActiveGeneration>) => void;
  removeGeneration: (id: string) => void;
  addToHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  setCanvasState: (nodes: unknown[], edges: unknown[], workflowId: number | null) => void;
  setPlaygroundState: (prompt: string, params: Record<string, unknown>, modelSlug: string) => void;
  setBalance: (balance: number) => void;
  clearAll: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeGens: {},
      history: [],
      canvasNodes: [],
      canvasEdges: [],
      canvasWorkflowId: null,
      playgroundPrompt: "",
      playgroundParams: {},
      lastModelSlug: null,
      balance: null,

      addGeneration: (gen) => set((state) => ({ activeGens: { ...state.activeGens, [gen.id]: gen } })),
      updateGeneration: (id, updates) => set((state) => ({ activeGens: { ...state.activeGens, [id]: { ...state.activeGens[id], ...updates } } })),
      removeGeneration: (id) => set((state) => { const { [id]: _, ...rest } = state.activeGens; return { activeGens: rest }; }),
      addToHistory: (entry) => set((state) => ({ history: [entry, ...state.history].slice(0, 100) })),
      clearHistory: () => set({ history: [] }),
      setCanvasState: (nodes, edges, workflowId) => set({ canvasNodes: nodes, canvasEdges: edges, canvasWorkflowId: workflowId }),
      setPlaygroundState: (prompt, params, modelSlug) => set({ playgroundPrompt: prompt, playgroundParams: params, lastModelSlug: modelSlug }),
      setBalance: (balance) => set({ balance }),
      clearAll: () => set({ activeGens: {}, history: [], canvasNodes: [], canvasEdges: [], canvasWorkflowId: null, playgroundPrompt: "", playgroundParams: {}, lastModelSlug: null, balance: null }),
    }),
    { name: "cortexia-app-state", version: 1 },
  ),
);

export async function verifyActiveGens(): Promise<void> {
  const { activeGens, updateGeneration, removeGeneration, addToHistory } = useAppStore.getState();
  const { loadSession } = await import("@/lib/auth-store");
  const { generationStatus } = await import("@/lib/api/generation-status");
  const session = loadSession();
  if (!session?.token) return;
  for (const [id, gen] of Object.entries(activeGens)) {
    if (gen.status !== "loading" || !gen.runId) continue;
    try {
      const status = await generationStatus({ data: { id: gen.runId, sessionToken: session.token } });
      if (status.status === "success" || status.status === "succeeded" || status.nodes?.[0]?.status === "success" || status.nodes?.[0]?.status === "succeeded") {
        const node = status.nodes?.[0];
        const url = node?.asset?.previewUrl || node?.asset?.storageUrl || null;
        updateGeneration(id, { status: "success", progress: 100, resultUrl: url });
        addToHistory({ id, prompt: gen.prompt, modelSlug: gen.modelSlug, modelName: gen.modelSlug, resultUrl: url, cost: 0, timestamp: gen.createdAt });
        removeGeneration(id);
      } else if (status.status === "error" || status.status === "failed" || status.nodes?.[0]?.status === "error" || status.nodes?.[0]?.status === "failed") {
        updateGeneration(id, { status: "error", error: "Generation failed" });
      }
    } catch { /* keep as loading */ }
  }
}
