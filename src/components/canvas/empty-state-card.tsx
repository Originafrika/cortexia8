import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Plus, Sparkles, ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  { label: "Pub", text: "Créer une publicité visuelle percutante avec image et voix off" },
  { label: "UGC", text: "Générer un contenu UGC authentique pour les réseaux sociaux" },
  { label: "Émission", text: "Concevoir un plan éditorial complet pour une émission" },
  { label: "Film", text: "Créer un storyboard visuel pour un court-métrage" },
  { label: "Teaser", text: "Produire un teaser vidéo court avec transitions et musique" },
  { label: "Podcast", text: "Assembler un podcast avec intro musicale et narration" },
];

type Props = {
  onOpenAgent: (prompt: string) => void;
  onHighlightNodeAdd: () => void;
};

export function EmptyStateCard({ onOpenAgent, onHighlightNodeAdd }: Props) {
  const [input, setInput] = useState("");

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
            Qu'est-ce que tu veux créer ?
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Décris ton idée ou choisis un use case pour commencer.
          </p>
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
            placeholder="Décris ton pipeline…"
            className="h-11 text-sm bg-surface-2/70 border-border/60"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setInput(s.text)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition cursor-pointer",
                "border border-border/60 bg-surface-2/50 text-muted-foreground",
                "hover:border-amber/40 hover:text-foreground hover:bg-surface-2",
                input === s.text && "border-amber/50 text-foreground bg-surface-2",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleAgent}
            disabled={!input.trim()}
            className="flex-1 h-10 bg-gradient-to-r from-amber to-amber-soft text-primary-foreground hover:opacity-90"
          >
            <Wand2 className="size-4" />
            Laisser l'agent construire
            <ArrowRight className="size-3.5 ml-auto" />
          </Button>
          <Button
            type="button"
            onClick={handleManual}
            variant="outline"
            className="h-10"
          >
            <Plus className="size-4" />
            Construire moi-même
          </Button>
        </div>
      </div>
    </div>
  );
}
