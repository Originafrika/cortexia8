import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Copy, AlertTriangle } from "lucide-react";
import { useCountUp } from "@/lib/use-count-up";
import { useT } from "@/lib/i18n";
import { waitlistSignup } from "@/lib/waitlist";

const PROFESSIONS = ["Pub", "UGC", "Émission", "Film", "Autre"] as const;
type Profession = (typeof PROFESSIONS)[number];

export function WaitlistForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState<Profession | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [rank, setRank] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [referredBy, setReferredBy] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref") || undefined;
    if (ref) setReferredBy(ref);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await waitlistSignup({
        data: { email, profession: profession ?? "Autre", referred_by: referredBy },
      });
      setReferralCode(result.referral_code);
      setRank(result.id);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("waitlist.error_signup"));
      setStatus("error");
    }
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {status !== "done" && status !== "error" ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            onSubmit={submit}
            className="surface-gradient-border rounded-2xl bg-surface-1/70 backdrop-blur-xl p-5 sm:p-6"
          >
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {t("waitlist.title")}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("waitlist.subtitle")}</p>

            <div className="mt-4">
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

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr,auto]">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("waitlist.email_placeholder")}
                aria-label="Email address"
                className="w-full min-w-0 h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-amber/50 focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email}
                aria-label="Join waitlist"
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

            <p className="mt-5 text-xs text-muted-foreground">{t("waitlist.no_spam")}</p>
            {status !== "loading" && !email && (
              <p className="mt-2 text-xs text-muted-foreground/70 italic">
                {t("waitlist.helper_email")}
              </p>
            )}
          </motion.form>
        ) : status === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-gradient-border rounded-2xl bg-surface-1/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber shrink-0 mt-0.5" />
              <div>
                <div className="font-display text-lg">{t("waitlist.error_title")}</div>
                <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
                >
                  {t("waitlist.error_retry")}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <ConfirmationCard
            key="done"
            rank={rank}
            email={email}
            profession={profession ?? "Autre"}
            referralCode={referralCode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmationCard({
  rank,
  email,
  profession,
  referralCode,
}: {
  rank: number;
  email: string;
  profession: Profession;
  referralCode: string;
}) {
  const t = useT();
  const displayRank = useCountUp(rank, 800);
  const [copied, setCopied] = useState(false);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://cortexia.originafrika.online";
  const link = `${origin}/r/${referralCode}`;

  const recapKey = `waitlist.confirm.recap.${profession.toLowerCase()}`;
  const recapText = t(recapKey);
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";

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
          #{Math.round(displayRank).toLocaleString(locale)}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-amber/30 bg-amber/10 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
          {t("waitlist.confirm.recap_label").replace("{profession}", profession)}
        </div>
        {recapText !== recapKey && (
          <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed">{recapText}</p>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface-0/60 p-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("waitlist.referral")}
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
            aria-label="Copy referral link"
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
          {t("waitlist.referral_copy")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            {
              network: "X",
              onClick: () =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(t("waitlist.done"))}&url=${encodeURIComponent(link)}`,
                  "_blank",
                ),
            },
            {
              network: "WhatsApp",
              onClick: () =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(t("waitlist.done") + " " + link)}`,
                  "_blank",
                ),
            },
            {
              network: "Telegram",
              onClick: () =>
                window.open(
                  `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(t("waitlist.done"))}`,
                  "_blank",
                ),
            },
            {
              network: "LinkedIn",
              onClick: () =>
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
                  "_blank",
                ),
            },
          ].map(({ network, onClick }) => (
            <button
              key={network}
              onClick={onClick}
              aria-label={`Share on ${network}`}
              className="rounded-full border border-border bg-surface-2/50 px-3 py-1.5 text-xs text-foreground/85 hover:border-border-strong hover:text-foreground transition"
            >
              {t("waitlist.confirm.share").replace("{network}", network)}
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
