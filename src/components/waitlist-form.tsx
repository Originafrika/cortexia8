import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Copy, Users } from "lucide-react";
import { useCountUp } from "@/lib/use-count-up";
import { useT } from "@/lib/i18n";

const PROFESSIONS = ["Pub", "UGC", "Émission", "Film", "Autre"] as const;
type Profession = (typeof PROFESSIONS)[number];

const RECAP: Record<Profession, string> = {
  Pub: "Parfait pour les créatifs pub — Kling, Seedance et GPT Image seront dans ta boîte à outils dès l'ouverture.",
  UGC: "Parfait pour les créateurs UGC — on te prévient dès que Cortexia ouvre, avec un accès prioritaire au playground vidéo.",
  Émission:
    "Parfait pour les équipes d'émission — voix, montage IA et musiques seront disponibles dès le lancement.",
  Film: "Parfait pour la production audiovisuelle — Kling 4K et modèles cinéma prêts dès l'ouverture.",
  Autre: "On te met de côté un accès dès l'ouverture, avec un mot d'accueil personnel.",
};

export function WaitlistForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState<Profession | null>(null);
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
              {t("waitlist.title")}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,auto]">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("waitlist.email_placeholder")}
                className="w-full min-w-0 rounded-xl border border-border bg-surface-0/80 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-amber/50"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email || !profession}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 hover:opacity-95 transition"
              >
                {status === "loading" ? (
                  "…"
                ) : (
                  <>
                    {t("waitlist.cta")}{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-5">
              <div className="text-xs text-muted-foreground mb-2">{t("waitlist.i_create")}</div>
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

            <p className="mt-5 text-[11px] text-muted-foreground/80">{t("waitlist.no_spam")}</p>
          </motion.form>
        ) : (
          <ConfirmationCard key="done" rank={rank} email={email} profession={profession!} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmationCard({
  rank,
  email,
  profession,
}: {
  rank: number;
  email: string;
  profession: Profession;
}) {
  const t = useT();
  const displayRank = useCountUp(rank, 800);
  const [copied, setCopied] = useState(false);
  const invitedCount = 0;
  const link = `cortexia.ai/r/${btoa(email)
    .slice(0, 8)
    .replace(/[^a-zA-Z0-9]/g, "x")}`;
  const referredPct = 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="surface-gradient-border rounded-2xl bg-surface-1/80 backdrop-blur-xl p-6 sm:p-7"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
        {t("waitlist.done")}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">{t("waitlist.your_seat")}</span>
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

      <div className="mt-5 rounded-xl border border-amber/30 bg-amber/10 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
          Profil enregistré : {profession}
        </div>
        <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed">{RECAP[profession]}</p>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface-0/60 p-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("waitlist.referral")}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground tabular">
            <Users className="size-3" />
            <span className="text-foreground/90">{invitedCount}</span>{" "}
            {t("waitlist.friends_invited")}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-surface-2/70 px-3 py-2 font-mono text-xs text-foreground/90">
            {link}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-xs hover:border-amber/40 transition"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald" /> {t("waitlist.copied")}
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> {t("waitlist.copy")}
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-foreground/85 leading-relaxed">
          Chaque ami inscrit via ton lien te fait gagner{" "}
          <span className="text-amber-soft font-medium">3 places</span> et{" "}
          <span className="text-amber-soft font-medium">2 $ de crédits offerts</span> au lancement.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["X", "WhatsApp", "Telegram", "LinkedIn"].map((n) => (
            <button
              key={n}
              className="rounded-full border border-border bg-surface-2/50 px-3 py-1.5 text-xs text-foreground/85 hover:border-border-strong hover:text-foreground transition"
            >
              Partager sur {n}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
        {t("waitlist.launch_email")}
      </p>
    </motion.div>
  );
}
