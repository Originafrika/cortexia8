import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, LayoutGrid, Wallet, ArrowRight } from "lucide-react";

const STORAGE_KEY = "cortexia:onboarded";

const STEPS = [
  {
    icon: Sparkles,
    titleKey: "app.onb.step1.title",
    bodyKey: "app.onb.step1.body",
    accent: "from-amber to-amber-soft",
  },
  {
    icon: LayoutGrid,
    titleKey: "app.onb.step2.title",
    bodyKey: "app.onb.step2.body",
    accent: "from-emerald to-amber-soft",
  },
  {
    icon: Wallet,
    titleKey: "app.onb.step3.title",
    bodyKey: "app.onb.step3.body",
    accent: "from-amber-soft to-amber",
  },
];

import { useT } from "@/lib/i18n";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function OnboardingOverlay({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const t = useT();

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  function done() {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }

  const Step = STEPS[step];
  const StepIcon = Step.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface-gradient-border relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface-1 p-6 sm:p-8"
          >
            <div className="flex items-center gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={
                    "h-1 flex-1 rounded-full transition-colors " +
                    (i <= step ? "bg-amber" : "bg-surface-3")
                  }
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className={`grid place-items-center size-14 rounded-2xl bg-gradient-to-br ${Step.accent} text-primary-foreground shadow-[0_20px_50px_-20px_oklch(0.78_0.16_70_/_0.6)]`}
                >
                  <StepIcon className="size-6" />
                </div>
                <h2 className="mt-6 font-display text-3xl sm:text-4xl tracking-[-0.02em]">
                  {t(Step.titleKey)}
                </h2>
                <p className="mt-3 text-foreground/80 leading-relaxed">{t(Step.bodyKey)}</p>

                {isLast && (
                  <div className="mt-6 rounded-2xl border border-amber/40 bg-amber/10 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
                      Cadeau de bienvenue
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      {t("app.onb.welcome_credit")}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={done}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                {t("app.onb.skip")}
              </button>
              <button
                onClick={() => (isLast ? done() : setStep((s) => s + 1))}
                className="group inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
              >
                {isLast ? t("app.onb.done") : t("app.onb.next")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useOnboarding() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so the app renders behind the overlay first.
      const id = window.setTimeout(() => setOpen(true), 500);
      return () => window.clearTimeout(id);
    }
  }, []);
  return { open, setOpen };
}
