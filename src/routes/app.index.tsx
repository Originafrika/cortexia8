import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PriceDisplay } from "@/components/price-display";
import { ArrowUp, Paperclip, Sparkles, X, RefreshCw } from "lucide-react";
import { MODELS, basePrice } from "@/lib/models";

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

type Msg = { role: "user" | "assistant"; text: string };

function AgentPage() {
  const [prompt, setPrompt] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<{ model: typeof MODELS[number]; prompt: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focused) return;
    const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 4200);
    return () => clearInterval(id);
  }, [focused]);

  function pickModel(p: string): typeof MODELS[number] {
    const l = p.toLowerCase();
    if (/(vidéo|video|clip|pub|teaser|reel)/.test(l)) return MODELS.find((m) => m.slug === "kling-3-turbo")!;
    if (/(voix|voice|voix off|dialogue)/.test(l))    return MODELS.find((m) => m.slug === "eleven-v3")!;
    if (/(image|photo|mockup|storyboard|flacon)/.test(l)) return MODELS.find((m) => m.slug === "seedream-5-pro")!;
    return MODELS.find((m) => m.slug === "claude-sonnet-5")!;
  }

  async function send() {
    if (!prompt.trim() || generating) return;
    const p = prompt.trim();
    setMessages((m) => [...m, { role: "user", text: p }]);
    setPrompt("");
    setGenerating(true);
    setProgress(0);
    const steps = ["Analyse du prompt…", "Sélection du modèle…", "Négociation des paramètres…", "Génération en cours…", "Post-traitement…"];
    for (let i = 0; i < steps.length; i++) {
      setStep(steps[i]);
      await new Promise((r) => setTimeout(r, 380));
      setProgress(Math.round(((i + 1) / steps.length) * 100));
    }
    const model = pickModel(p);
    setResult({ model, prompt: p });
    setMessages((m) => [...m, { role: "assistant", text: `J'ai utilisé ${model.name} — ${model.blurb}` }]);
    setGenerating(false);
  }

  const selectedModel = pickModel(prompt || "image");
  const cost = basePrice(selectedModel);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Result area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-8">
          {!result && messages.length === 0 && (
            <div className="text-center py-24">
              <div className="mx-auto grid place-items-center size-14 rounded-2xl bg-gradient-to-br from-amber/30 to-amber/5 border border-amber/30">
                <Sparkles className="size-6 text-amber" />
              </div>
              <h1 className="mt-6 font-display text-4xl sm:text-5xl tracking-[-0.03em]">Dis-moi ce que tu veux créer.</h1>
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
                Je choisis le meilleur modèle, tu gardes la main. Chaque génération est facturée exactement au coût affiché.
              </p>
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="surface-gradient-border rounded-3xl bg-surface-1/60 backdrop-blur-xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-amber/20 via-surface-2 to-surface-0 relative">
                <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                  <div className="text-center">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em]">Résultat simulé</div>
                    <div className="mt-2 font-display text-2xl text-foreground/85">{result.model.name}</div>
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{result.prompt}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Prêt en 2,4s · <PriceDisplay usd={basePrice(result.model)} className="text-xs" /> facturé</div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:border-amber/40 transition">
                  <RefreshCw className="size-3.5" /> Régénérer
                </button>
              </div>
            </motion.div>
          )}

          {messages.length > 0 && (
            <div className="mt-8 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <div className={
                    "inline-block max-w-xl rounded-2xl px-4 py-2.5 text-sm " +
                    (m.role === "user" ? "bg-amber/15 text-foreground" : "text-foreground/85")
                  }>{m.text}</div>
                </div>
              ))}
            </div>
          )}

          {generating && (
            <div className="mt-8 rounded-2xl border border-border bg-surface-1/60 p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-[0.22em] text-muted-foreground">{step}</span>
                <span className="font-mono tabular text-foreground/80">{progress}%</span>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                <motion.div className="h-full bg-gradient-to-r from-amber to-amber-soft" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-4">
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
              <div className="pointer-events-none absolute top-3 left-4 text-sm text-muted-foreground/70">
                <AnimatePresence mode="wait">
                  <motion.span key={phIndex} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
                    {PLACEHOLDERS[phIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <div className="absolute inset-x-3 bottom-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition">
                  <Paperclip className="size-4" />
                  <input type="file" multiple className="hidden" onChange={(e) => setFiles((v) => [...v, ...Array.from(e.target.files || [])])} />
                </label>
                {prompt && (
                  <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2/70 px-2.5 py-1 text-[11px]">
                    <Sparkles className="size-3 text-amber" />
                    <span className="text-muted-foreground">Choisi :</span>
                    <span className="font-medium">{selectedModel.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <PriceDisplay usd={cost} className="text-[11px]" />
                  </div>
                )}
              </div>
              <button
                onClick={send}
                disabled={!prompt.trim() || generating}
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
