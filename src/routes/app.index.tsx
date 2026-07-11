import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PriceDisplay } from "@/components/price-display";
import { ArrowUp, Paperclip, Sparkles, X, RefreshCw, Download, Film, Image as ImageIcon, Mic, MessageSquare } from "lucide-react";
import { MODELS, basePrice, getModel, type Model } from "@/lib/models";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  component: AgentPage,
});

const PLACEHOLDERS = [
  "Une pub 15s pour une marque de sneakers, plan urbain, énergie matinale…",
  "Un flacon ambré posé sur du marbre travertin, éditorial, lumière naturelle…",
  "La voix off d'un teaser de mini-série en français, ton calme, grave…",
  "Un storyboard 6 cases pour une émission cuisine tournée à Dakar…",
  "Un mockup Instagram Story qui vend une pâtisserie fine à São Paulo…",
];

type Turn = {
  id: string;
  prompt: string;
  model: Model;
  reason: string;
  alternatives: Model[];
  status: "generating" | "done";
  progress: number;
  step: string;
  kind: "image" | "video" | "voice" | "text";
};

const STARTERS: { useCase: string; label: string; prompt: string }[] = [
  { useCase: "Pub",      label: "Pub sneakers 15s",         prompt: "Une pub 15s pour une marque de sneakers, plan urbain, énergie matinale, musique électro douce." },
  { useCase: "Pub",      label: "Mockup packaging bio",     prompt: "Un mockup produit d'un flacon de savon bio posé sur pierre volcanique, lumière chaude." },
  { useCase: "UGC",      label: "Unboxing beauté",          prompt: "Une créatrice UGC ouvre une palette maquillage, plan macro sur ses mains, lumière naturelle." },
  { useCase: "UGC",      label: "Reel Instagram café",      prompt: "Un latte art versé en gros plan, plateau bois, ambiance café parisien matin." },
  { useCase: "Émission", label: "Générique cuisine",        prompt: "Le générique d'une émission cuisine tournée à Dakar, plans dynamiques et couleurs vives, 8s." },
  { useCase: "Film",     label: "Teaser mini-série",        prompt: "Voix off française grave pour teaser d'une mini-série policière, ton calme et menaçant." },
];

function AgentPage() {
  const t = useT();
  const [prompt, setPrompt] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focused) return;
    const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 4200);
    return () => clearInterval(id);
  }, [focused]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  function inferKind(p: string): Turn["kind"] {
    const l = p.toLowerCase();
    if (/(vidéo|video|clip|pub|teaser|reel|travelling|générique)/.test(l)) return "video";
    if (/(voix|voice|voix off|dialogue|narration)/.test(l)) return "voice";
    if (/(image|photo|mockup|storyboard|flacon|assiette|packaging|portrait)/.test(l)) return "image";
    return "text";
  }

  function pickModels(kind: Turn["kind"]): { chosen: Model; reason: string; alts: Model[] } {
    if (kind === "video") {
      return {
        chosen: getModel("kling-3-turbo")!,
        reason: "Kling 3 Turbo excelle sur les plans dynamiques et rend en moins d'une minute — parfait pour ton brief.",
        alts: [getModel("seedance-2-fast")!, getModel("wan-27-video")!],
      };
    }
    if (kind === "voice") {
      return {
        chosen: getModel("eleven-v3")!,
        reason: "ElevenLabs V3 gère six langues avec une intonation naturelle — c'est l'option la plus solide pour une voix off éditoriale.",
        alts: [getModel("kling-3-pro")!],
      };
    }
    if (kind === "image") {
      return {
        chosen: getModel("seedream-5-pro")!,
        reason: "Seedream 5 Pro tient la typographie et les compositions produit — le meilleur choix pour un mockup net.",
        alts: [getModel("nano-banana-2")!, getModel("gpt-image-2")!],
      };
    }
    return {
      chosen: getModel("claude-sonnet-5")!,
      reason: "Claude Sonnet 5 est le meilleur équilibre raisonnement/vitesse pour du texte structuré.",
      alts: [getModel("gpt-55")!, getModel("gemini-31-pro")!],
    };
  }

  async function runGeneration(turnId: string, kind: Turn["kind"]) {
    const steps = kind === "video"
      ? ["Analyse du prompt…", "Sélection du modèle…", "Génération des frames…", "Synchronisation audio…", "Encodage final…"]
      : kind === "voice"
      ? ["Analyse du texte…", "Choix de la voix…", "Synthèse acoustique…", "Post-traitement…"]
      : kind === "image"
      ? ["Analyse du prompt…", "Sélection du modèle…", "Débruitage progressif…", "Finalisation…"]
      : ["Analyse du prompt…", "Raisonnement…", "Rédaction…"];

    const totalMs = kind === "video" ? 3600 : kind === "voice" ? 1800 : kind === "image" ? 1600 : 1100;
    const stepMs = totalMs / steps.length;

    for (let i = 0; i < steps.length; i++) {
      const p = Math.round(((i + 1) / steps.length) * 100);
      const step = steps[i];
      setTurns((ts) => ts.map((t) => (t.id === turnId ? { ...t, step, progress: p } : t)));
      await new Promise((r) => setTimeout(r, stepMs));
    }
    setTurns((ts) => ts.map((t) => (t.id === turnId ? { ...t, status: "done", progress: 100, step: "" } : t)));
  }

  async function send(text?: string) {
    const p = (text ?? prompt).trim();
    if (!p) return;
    const kind = inferKind(p);
    const { chosen, reason, alts } = pickModels(kind);
    const id = `${Date.now()}`;
    const turn: Turn = { id, prompt: p, model: chosen, reason, alternatives: alts, status: "generating", progress: 0, step: "", kind };
    setTurns((ts) => [...ts, turn]);
    setPrompt("");
    await runGeneration(id, kind);
  }

  function switchModel(turnId: string, m: Model) {
    setTurns((ts) => ts.map((t) => {
      if (t.id !== turnId) return t;
      const alts = [t.model, ...t.alternatives.filter((a) => a.slug !== m.slug)].slice(0, 3);
      return { ...t, model: m, alternatives: alts, reason: `Basculé sur ${m.name} — ${m.blurb}` };
    }));
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-8">
          {turns.length === 0 && <EmptyState t={t} onPick={(p) => { setPrompt(p); setTimeout(() => send(p), 0); }} />}

          <div className="space-y-8">
            {turns.map((turn, idx) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                index={idx + 1}
                onSwitch={(m) => switchModel(turn.id, m)}
                onRefine={(chip) => send(`${turn.prompt} — ${chip}`)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-4">
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs">
                  <Paperclip className="size-3" />
                  <span className="max-w-[160px] truncate">{f.name}</span>
                  <button onClick={() => setFiles((v) => v.filter((_, j) => j !== i))}><X className="size-3 text-muted-foreground hover:text-foreground" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="relative rounded-2xl border border-border bg-surface-1/70 focus-within:border-amber/50 transition-colors">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={2}
              placeholder=""
              className="w-full resize-none bg-transparent px-4 pt-3 pb-14 text-sm outline-none"
            />
            {!prompt && !focused && (
              <div className="pointer-events-none absolute top-3 left-4 right-16 truncate text-sm text-muted-foreground/70">
                <AnimatePresence mode="wait">
                  <motion.span key={phIndex} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
                    {PLACEHOLDERS[phIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <div className="absolute inset-x-3 bottom-2 flex items-center justify-between">
              <label className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition">
                <Paperclip className="size-4" />
                <input type="file" multiple className="hidden" onChange={(e) => setFiles((v) => [...v, ...Array.from(e.target.files || [])])} />
              </label>
              <button
                onClick={() => send()}
                disabled={!prompt.trim()}
                className="grid place-items-center size-8 rounded-lg bg-amber text-primary-foreground disabled:opacity-40 hover:opacity-95 transition"
                aria-label="Envoyer"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ t, onPick }: { t: (k: string) => string; onPick: (p: string) => void }) {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto grid place-items-center size-14 rounded-2xl bg-gradient-to-br from-amber/30 to-amber/5 border border-amber/30">
        <Sparkles className="size-6 text-amber" />
      </div>
      <h1 className="mt-6 text-center font-display text-4xl sm:text-5xl tracking-[-0.03em]">{t("app.agent.hello")}</h1>
      <p className="mt-3 text-center text-muted-foreground max-w-lg mx-auto">{t("app.agent.hello_sub")}</p>

      <div className="mt-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
          {t("app.agent.starters_title")}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {STARTERS.map((s) => (
            <button
              key={s.label}
              onClick={() => onPick(s.prompt)}
              className="group rounded-2xl border border-border bg-surface-1/60 p-4 text-left transition-all hover:border-amber/40 hover:bg-surface-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">{s.useCase}</span>
                <ArrowUp className="size-3.5 rotate-45 text-muted-foreground group-hover:text-amber transition" />
              </div>
              <div className="mt-1.5 text-sm font-medium">{s.label}</div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.prompt}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TurnCard({ turn, index, onSwitch, onRefine }: {
  turn: Turn;
  index: number;
  onSwitch: (m: Model) => void;
  onRefine: (chip: string) => void;
}) {
  const KindIcon =
    turn.kind === "video" ? Film :
    turn.kind === "voice" ? Mic :
    turn.kind === "image" ? ImageIcon : MessageSquare;

  return (
    <div id={`turn-${index}`} className="space-y-4">
      {/* User message */}
      <div className="text-right">
        <div className="inline-block max-w-xl rounded-2xl bg-amber/15 text-foreground px-4 py-2.5 text-sm text-left">
          {turn.prompt}
        </div>
      </div>

      {/* Model decision card */}
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-4">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-amber to-amber-soft text-primary-foreground shrink-0">
            <KindIcon className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">Choisi pour toi</span>
              <span className="font-medium text-sm">{turn.model.name}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <PriceDisplay usd={basePrice(turn.model)} className="text-xs" />
            </div>
            <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">{turn.reason}</p>
            {turn.alternatives.length > 0 && (
              <div className="mt-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">Autres options</div>
                <div className="flex flex-wrap gap-2">
                  {turn.alternatives.map((m) => (
                    <button
                      key={m.slug}
                      onClick={() => onSwitch(m)}
                      className="group inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-3 py-1.5 text-xs hover:border-amber/40 hover:bg-surface-2 transition"
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-muted-foreground">·</span>
                      <PriceDisplay usd={basePrice(m)} className="text-xs" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result / generating */}
      <ResultBlock turn={turn} onRefine={onRefine} />
    </div>
  );
}

function ResultBlock({ turn, onRefine }: { turn: Turn; onRefine: (chip: string) => void }) {
  const refineChips = turn.kind === "video"
    ? ["Plus cinématographique", "Ambiance nuit", "Version 6 s", "Ralenti sur le sujet"]
    : turn.kind === "voice"
    ? ["Ton plus grave", "Plus rapide", "Ambiance intime"]
    : turn.kind === "image"
    ? ["Cadre serré", "Lumière du matin", "Fond neutre", "Variation typographie"]
    : ["Plus court", "Plus formel", "Ajoute des puces"];

  const generating = turn.status === "generating";

  return (
    <div className="surface-gradient-border rounded-3xl bg-surface-1/50 overflow-hidden">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-amber/20 via-surface-2 to-surface-0 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${turn.id}/900/560`}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700",
            generating ? "blur-xl scale-105 opacity-70" : "blur-0 scale-100 opacity-100",
          )}
        />
        {generating && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent grid place-items-end p-5">
            <div className="w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-[0.22em] text-white/80">{turn.step || "…"}</span>
                <span className="font-mono tabular text-white/80">{turn.progress}%</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber to-amber-soft"
                  animate={{ width: `${turn.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        )}
        {!generating && (
          <div className="absolute top-3 left-3 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/90">
            Résultat prêt · {turn.model.name}
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Facturé <PriceDisplay usd={basePrice(turn.model)} className="text-xs" emphasize />
        </div>
        {!generating && (
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-amber/40 transition">
              <Download className="size-3.5" /> Télécharger
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-amber/40 transition">
              <RefreshCw className="size-3.5" /> Régénérer
            </button>
            <Link
              to="/app/models/$slug"
              params={{ slug: turn.model.slug }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-amber/40 transition"
            >
              Ouvrir le playground
            </Link>
          </div>
        )}
      </div>
      {!generating && (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Affiner</div>
          <div className="flex flex-wrap gap-2">
            {refineChips.map((chip) => (
              <button
                key={chip}
                onClick={() => onRefine(chip)}
                className="rounded-full border border-border bg-surface-2/40 px-3 py-1.5 text-xs text-foreground/85 hover:border-amber/40 hover:text-foreground transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
