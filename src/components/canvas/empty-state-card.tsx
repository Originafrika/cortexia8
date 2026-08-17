import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wand2,
  Plus,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Image as ImageIcon,
  Film,
  Music2,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/lib/canvas-templates";
import { useCanvasStore } from "@/lib/canvas-store";

const SUGGESTIONS = [
  { key: "pub", text: "Créer une publicité visuelle percutante avec image et voix off" },
  { key: "ugc", text: "Générer un contenu UGC authentique pour les réseaux sociaux" },
  { key: "show", text: "Concevoir un plan éditorial complet pour une émission" },
  { key: "film", text: "Créer un storyboard visuel pour un court-métrage" },
  { key: "teaser", text: "Produire un teaser vidéo court avec transitions et musique" },
  { key: "podcast", text: "Assembler un podcast avec intro musicale et narration" },
];

const CATEGORY_ICON: Record<CanvasTemplate["category"], typeof ImageIcon> = {
  Pub: ImageIcon,
  UGC: Film,
  Film: Film,
  Musique: Music2,
};

const CATEGORY_COLORS: Record<CanvasTemplate["category"], string> = {
  Pub: "bg-amber/15 text-amber-soft border-amber/25",
  UGC: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  Film: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  Musique: "bg-orange-500/15 text-orange-300 border-orange-500/25",
};

type Props = {
  onOpenAgent: (prompt: string) => void;
  onHighlightNodeAdd: () => void;
};

export function EmptyStateCard({ onOpenAgent, onHighlightNodeAdd }: Props) {
  const t = useT();
  const [input, setInput] = useState("");
  const addNode = useCanvasStore((s) => s.addNode);
  const onConnect = useCanvasStore((s) => s.onConnect);

  function handleLoadTemplate(template: CanvasTemplate) {
    const nodeIds: string[] = [];
    for (const n of template.nodes) {
      const id = addNode(n.modelSlug, { x: n.x, y: n.y });
      if (id) nodeIds.push(id);
    }
    for (const e of template.edges) {
      const sourceId = nodeIds[e.source];
      const targetId = nodeIds[e.target];
      if (sourceId && targetId) {
        onConnect({ source: sourceId, target: targetId, sourceHandle: "out", targetHandle: "in" });
      }
    }
  }

  function handleAgent() {
    const text = input.trim();
    if (!text) return;
    onOpenAgent(text);
  }

  function handleManual() {
    onHighlightNodeAdd();
  }

  return (
    <div className="absolute inset-0 z-10 grid place-items-center backdrop-blur-sm bg-background/30 pointer-events-auto">
      <div className="w-full max-w-lg mx-4 surface-gradient-border rounded-2xl bg-surface-1/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-amber to-amber-soft text-primary-foreground mb-3">
            <Sparkles className="size-5" />
          </div>
          <h2 className="font-display text-xl tracking-[-0.02em] text-foreground">
            {t("canvas.empty.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">{t("canvas.empty.desc")}</p>
        </div>

        <div className="relative mb-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAgent();
              }
            }}
            placeholder={t("canvas.empty.placeholder")}
            className="h-11 text-sm bg-surface-2/70 border-border/60"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setInput(s.text)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition cursor-pointer",
                "border border-border/60 bg-surface-2/50 text-muted-foreground",
                "hover:border-amber/40 hover:text-foreground hover:bg-surface-2",
                input === s.text && "border-amber/50 text-foreground bg-surface-2",
              )}
            >
              {t(`canvas.empty.suggestion.${s.key}`)}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Templates
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CANVAS_TEMPLATES.map((tpl) => {
              const Icon = CATEGORY_ICON[tpl.category];
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleLoadTemplate(tpl)}
                  className={cn(
                    "group text-left rounded-xl p-3 transition cursor-pointer",
                    "border border-border/50 bg-surface-2/40",
                    "hover:border-amber/40 hover:bg-surface-2/70",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "size-7 rounded-lg flex items-center justify-center shrink-0 border",
                        CATEGORY_COLORS[tpl.category],
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{tpl.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {tpl.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleAgent}
            disabled={!input.trim()}
            className="flex-1 h-10 bg-gradient-to-r from-amber to-amber-soft text-primary-foreground hover:opacity-90"
          >
            <Wand2 className="size-4" />
            {t("canvas.empty.agent")}
            <ArrowRight className="size-3.5 ml-auto" />
          </Button>
          <Button type="button" onClick={handleManual} variant="outline" className="h-10">
            <Plus className="size-4" />
            {t("canvas.empty.manual")}
          </Button>
        </div>
      </div>
    </div>
  );
}
