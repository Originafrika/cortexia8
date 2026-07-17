import { useState } from "react";
import { useCanvasStore } from "@/lib/canvas-store";
import { Sparkles, Send, Check, Loader2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MODELS, getModel } from "@/lib/models";

type AgentOp =
  | { type: "add"; slug: string; position: { x: number; y: number } }
  | { type: "connect"; source: string; target: string }
  | { type: "describe"; text: string };

const STARTERS = [
  "Un mockup produit puis une vidéo UGC à partir de l'image.",
  "Une voix off française pour le teaser, et un storyboard 6 cases.",
  "Génère un plan éditorial, puis anime-le en 5 secondes.",
];

export function AgentPanel({ className }: { className?: string }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ text: string; tone: "info" | "ok" | "muted" }[]>([]);
  const [expanded, setExpanded] = useState(true);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const addNode = useCanvasStore((s) => s.addNode);
  const nodes = useCanvasStore((s) => s.nodes);

  if (readOnly) return null;

  function pushLog(text: string, tone: "info" | "ok" | "muted" = "info") {
    setLog((l) => [...l, { text, tone }]);
  }

  function applyOps(ops: AgentOp[]) {
    const newIds: string[] = [];
    for (const op of ops) {
      if (op.type === "add") {
        const id = addNode(op.slug, op.position);
        if (id) newIds.push(id);
      }
    }
    // After all nodes added, connect them sequentially
    for (let i = 0; i < newIds.length - 1; i++) {
      useCanvasStore.getState().onConnect({
        source: newIds[i],
        target: newIds[i + 1],
        sourceHandle: null,
        targetHandle: null,
      });
    }
  }

  async function build(textArg?: string) {
    const text = (textArg ?? prompt).trim();
    if (!text || busy) return;
    setBusy(true);
    setLog([]);
    setPrompt("");
    pushLog(`Analyse de la demande…`, "muted");
    await wait(550);
    pushLog(`Cible détectée : ${inferKindLabel(text)}`, "info");
    await wait(450);

    // Build a small plan from prompt heuristics
    const plan = buildPlan(text);
    pushLog(`Plan retenu · ${plan.length} opération${plan.length > 1 ? "s" : ""}`, "info");
    await wait(350);
    for (const op of plan) {
      if (op.type === "add") {
        const m = getModel(op.slug);
        pushLog(`+ ${m?.name ?? op.slug}`, "ok");
      } else if (op.type === "connect") {
        pushLog(`↔ liaison`, "muted");
      } else if (op.type === "describe") {
        pushLog(op.text, "muted");
      }
      await wait(200);
    }
    applyOps(plan);
    pushLog(`Canvas mis à jour.`, "ok");
    setBusy(false);
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
                  )}
                >
                  {l.tone === "ok" ? (
                    <Check className="size-3 mt-0.5 shrink-0" />
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

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function inferKindLabel(p: string): string {
  const l = p.toLowerCase();
  if (/(vidéo|video|pub|teaser|reel)/.test(l)) return "Vidéo";
  if (/(voix|voice|voix off|narration|teaser)/.test(l)) return "Voix off";
  if (/(image|photo|mockup|storyboard|flacon|packaging)/.test(l)) return "Image";
  if (/(storyboard|scénario)/.test(l)) return "Texte structuré";
  return "Pipeline multi-étapes";
}

function buildPlan(text: string): AgentOp[] {
  const l = text.toLowerCase();
  const ops: AgentOp[] = [];
  const baseX = 180;
  const baseY = 180;
  const gap = 240;

  if (/(mockup|image|photo|flacon|packaging|storyboard)/.test(l)) {
    ops.push({ type: "add", slug: "seedream-5-pro", position: { x: baseX, y: baseY } });
  }
  if (/(vidéo|video|pub|reel|animer|ugc)/.test(l)) {
    ops.push({ type: "add", slug: "kling-3-turbo", position: { x: baseX + gap, y: baseY } });
  }
  if (/(voix|voice|voix off|narration)/.test(l)) {
    ops.push({ type: "add", slug: "eleven-v3", position: { x: baseX, y: baseY + gap } });
  }
  if (/(scénario|script|storyboard|article|texte|brief|éditorial)/.test(l)) {
    ops.push({ type: "add", slug: "claude-sonnet-46", position: { x: baseX, y: baseY - gap } });
  }
  // Fallback: at least one model
  if (ops.length === 0) {
    const m = MODELS[0];
    ops.push({ type: "add", slug: m.slug, position: { x: baseX, y: baseY } });
  }
  return ops;
}
