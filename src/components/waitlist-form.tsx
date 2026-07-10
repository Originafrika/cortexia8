import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Copy } from "lucide-react";
import { useCountUp } from "@/lib/use-count-up";

const PROFESSIONS = ["Pub", "UGC", "Émission", "Film", "Autre"];

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [rank, setRank] = useState(1247);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !profession) return;
    setStatus("loading");
    setTimeout(() => {
      setRank(1247 + Math.floor(Math.random() * 30));
      setStatus("done");
    }, 900);
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {status !== "done" ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            onSubmit={submit}
            className="surface-gradient-border rounded-2xl bg-surface-1/70 backdrop-blur-xl p-5 sm:p-6"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Rejoindre la waitlist
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,auto]">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="w-full min-w-0 rounded-xl border border-border bg-surface-0/80 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-amber/50"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email || !profession}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 hover:opacity-95 transition"
              >
                {status === "loading" ? "…" : (<>Je réserve ma place <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>)}
              </button>
            </div>

            <div className="mt-5">
              <div className="text-xs text-muted-foreground mb-2">Je crée surtout :</div>
              <div className="flex flex-wrap gap-2">
                {PROFESSIONS.map((p) => {
                  const active = profession === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProfession(p)}
                      className={
                        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all " +
                        (active
                          ? "border-amber/60 bg-amber/15 text-amber-soft"
                          : "border-border bg-surface-2/50 text-muted-foreground hover:border-border-strong hover:text-foreground/90")
                      }
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-[11px] text-muted-foreground/80">
              Zéro spam. On t'écrit une fois pour te dire que c'est ouvert, une seconde pour t'offrir tes premiers crédits.
            </p>
          </motion.form>
        ) : (
          <ConfirmationCard key="done" rank={rank} email={email} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmationCard({ rank, email }: { rank: number; email: string }) {
  const displayRank = useCountUp(rank, 800);
  const [copied, setCopied] = useState(false);
  const link = `cortexia.ai/r/${btoa(email).slice(0, 8).replace(/[^a-zA-Z0-9]/g, "x")}`;
  const referredPct = 12; // symbolic progress bar

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="surface-gradient-border rounded-2xl bg-surface-1/80 backdrop-blur-xl p-6 sm:p-7"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
        Tu es dedans.
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">Ta place</span>
        <span className="font-display text-5xl sm:text-6xl tracking-[-0.03em] tabular text-foreground">
          #{Math.round(displayRank).toLocaleString("fr-FR")}
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${referredPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-amber to-amber-soft"
        />
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
        {referredPct}% de la file franchie. Parraine pour avancer plus vite.
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface-0/60 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Ton lien de parrainage
        </div>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-surface-2/70 px-3 py-2 font-mono text-xs text-foreground/90">
            {link}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-xs hover:border-amber/40 transition"
          >
            {copied ? <><Check className="size-3.5 text-emerald" /> Copié</> : <><Copy className="size-3.5" /> Copier</>}
          </button>
        </div>
        <p className="mt-3 text-xs text-foreground/85 leading-relaxed">
          Chaque ami inscrit via ton lien te fait gagner{" "}
          <span className="text-amber-soft font-medium">3 places</span> et{" "}
          <span className="text-amber-soft font-medium">2 $ de crédits offerts</span> au lancement.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["X", "WhatsApp", "Telegram", "LinkedIn"].map((n) => (
            <button key={n} className="rounded-full border border-border bg-surface-2/50 px-3 py-1.5 text-xs text-foreground/85 hover:border-border-strong hover:text-foreground transition">
              Partager sur {n}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
        On t'écrit le <span className="text-foreground/90">1er août</span> avec ton accès. D'ici là,
        surveille ta boîte et ta place dans la file — elle bouge à chaque nouvel inscrit.
      </p>
    </motion.div>
  );
}
