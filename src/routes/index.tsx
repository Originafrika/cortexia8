import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/auth";
import { loadSession } from "@/lib/auth-store";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";
import { EditorialCountdown } from "@/components/editorial-countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { CreditSimulator } from "@/components/credit-simulator";
import { ModelsMarquee } from "@/components/models-marquee";
import { ModelsWall, WallPreview } from "@/components/models-wall";
import { useCountUp } from "@/lib/use-count-up";
import { useT } from "@/lib/i18n";
import { getWaitlistCount } from "@/lib/waitlist";
import { useQuery } from "@tanstack/react-query";
import { LAUNCH_DATE } from "@/lib/launch";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Bot, Sliders } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cortexia — Un accès. Tous les modèles. Waitlist ouverte." },
      {
        name: "description",
        content:
          "Cortexia ouvre le 1er août : le catalogue complet — Kling, Seedream, Claude, ElevenLabs — en accès direct, playground par playground. L'agent choisit pour toi ou tu gardes la main. Facturé à l'usage. Rejoins la waitlist.",
      },
    ],
  }),
  component: WaitlistLanding,
});

function WaitlistLanding() {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SiteHeader />

      <Hero />
      <ModesSection />
      <CatalogSection />
      <WallPreviewSection />
      <WallSection />
      <SimulatorSection />
      <ComparisonSection />
      <SocialProofSection />
      <AccessSection />
      <FaqSection />
      <FooterSection />
    </div>
  );
}

function LangFade({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={t("hero.title")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">
      <div className="grid gap-12 lg:grid-cols-[1.15fr,0.85fr] lg:gap-16 items-start">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 backdrop-blur px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-amber pulse-soft" />
            {t("badge.launch")}
          </motion.div>

          <LangFade>
            <h1 className="mt-6 font-display text-[clamp(2.2rem,6.5vw,4.8rem)] leading-[1.02] tracking-[-0.035em]">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/80 leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </LangFade>
          <p className="mt-4 text-xs text-muted-foreground">{t("hero.micro_cta")}</p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 max-w-xl"
          >
            <WaitlistForm />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="lg:sticky lg:top-24 surface-gradient-border rounded-3xl bg-surface-1/40 backdrop-blur-xl p-6 sm:p-8"
        >
          <EditorialCountdown target={LAUNCH_DATE} />
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
            <Stat label={t("stat.models")} value="30+" />
            <Stat label={t("stat.currencies")} value="8" />
            <Stat label={t("stat.no_sub")} value="0 €" />
          </div>
        </motion.div>
      </div>

      <div className="mt-16 flex justify-center text-muted-foreground/70">
        <ChevronDown className="size-5 animate-bounce" />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl tracking-[-0.02em]">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function ModesSection() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-3xl mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("modes.eyebrow")}
        </div>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-[-0.03em]">
          {t("modes.title")}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Agent mode */}
        <div className="surface-gradient-border rounded-2xl bg-surface-1/50 backdrop-blur p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="grid place-items-center size-10 rounded-xl bg-amber/10 text-amber">
              <Bot className="size-5" />
            </div>
            <h3 className="font-display text-xl tracking-[-0.02em]">{t("modes.agent.title")}</h3>
          </div>
          <p className="text-foreground/80 leading-relaxed text-sm">
            {t("modes.agent.body")}
          </p>
        </div>

        {/* Playground mode */}
        <div className="surface-gradient-border rounded-2xl bg-surface-1/50 backdrop-blur p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="grid place-items-center size-10 rounded-xl bg-amber/10 text-amber">
              <Sliders className="size-5" />
            </div>
            <h3 className="font-display text-xl tracking-[-0.02em]">{t("modes.playground.title")}</h3>
          </div>
          <p className="text-foreground/80 leading-relaxed text-sm">
            {t("modes.playground.body")}
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground italic">
        {t("modes.synthesis")}
      </p>
    </section>
  );
}

function CatalogSection() {
  const t = useT();
  return (
    <section className="py-16 sm:py-24 border-y border-border bg-surface-0/40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("catalog.eyebrow")}
        </div>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-[-0.03em]">
          {t("catalog.title")}
        </h2>
        <p className="mt-4 text-foreground/75 max-w-2xl leading-relaxed">
          {t("catalog.body")}
        </p>
      </div>
      <ModelsMarquee />
    </section>
  );
}

function WallPreviewSection() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-2xl mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("wall.eyebrow")}
        </div>
      </div>
      <WallPreview />
    </section>
  );
}

function WallSection() {
  const t = useT();
  return (
    <section id="wall" className="py-16 sm:py-24 border-y border-border bg-surface-0/40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("wall.eyebrow")}
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
            {t("wall.title")}
          </h2>
          <p className="mt-4 text-foreground/75">{t("wall.subtitle")}</p>
        </div>
        <ModelsWall />
      </div>
    </section>
  );
}

function SimulatorSection() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-2xl mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("sim.eyebrow")}
        </div>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
          {t("sim.title")}
        </h2>
        <p className="mt-4 text-foreground/75">{t("sim.subtitle")}</p>
      </div>
      <CreditSimulator />
    </section>
  );
}

function ComparisonSection() {
  const t = useT();
  return (
    <section className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-2xl mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("compare.eyebrow")}
        </div>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-[-0.03em]">
          {t("compare.title")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("compare.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface-0/40 p-6 sm:p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            {t("compare.old.subtitle")}
          </div>
          <h3 className="mt-2 font-display text-2xl text-foreground/70 tracking-[-0.02em]">
            {t("compare.old.title")}
          </h3>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">✕ {t("compare.old.row1")}</li>
            <li className="flex items-start gap-2">✕ {t("compare.old.row2")}</li>
            <li className="flex items-start gap-2">✕ {t("compare.old.row3")}</li>
            <li className="flex items-start gap-2">✕ {t("compare.old.row4")}</li>
          </ul>
        </div>

        <div className="surface-gradient-border rounded-3xl bg-surface-1/70 p-6 sm:p-8 border-transparent">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
            {t("compare.new.subtitle")}
          </div>
          <h3 className="mt-2 font-display text-2xl tracking-[-0.02em]">
            {t("compare.new.title")}
          </h3>
          <ul className="mt-6 space-y-3 text-sm text-foreground/85">
            <li className="flex items-start gap-2">
              <span className="text-emerald mt-0.5">✓</span> {t("compare.new.row1")}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald mt-0.5">✓</span> {t("compare.new.row2")}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald mt-0.5">✓</span> {t("compare.new.row3")}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald mt-0.5">✓</span> {t("compare.new.row4")}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const t = useT();
  const { data: realCount } = useQuery({
    queryKey: ["waitlist-count"],
    queryFn: () => getWaitlistCount(),
  });
  const count = realCount ?? 0;
  const displayed = useCountUp(count, 900);

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] items-start">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("social.eyebrow")}
          </div>
          <div className="mt-4 font-display text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] tracking-[-0.035em] tabular text-foreground">
            {Math.round(displayed).toLocaleString("fr-FR")}
          </div>
          <p className="mt-3 text-foreground/75 max-w-md">{t("social.copy")}</p>
        </div>
        <div className="grid gap-4">
          <Testimonial
            name="Amara"
            role="Créatrice UGC"
            city="Lomé"
            quote="Je paie enfin ce que je consomme. Trois vidéos ce mois-ci, trois vidéos facturées. Pas de forfait qui me pique."
          />
          <Testimonial
            name="Julien"
            role="Fondateur d'agence"
            city="São Paulo"
            quote="Je compare Kling et Seedance sur le même prompt en trois clics. Avant, c'était deux abonnements et deux onboardings."
          />
          <Testimonial
            name="Wei"
            role="Développeur solo"
            city="Jakarta"
            quote="Une API, une facture à l'usage, pas de minimum mensuel. Ma trésorerie respire enfin."
          />
        </div>
      </div>
    </section>
  );
}

function Testimonial({
  name,
  role,
  city,
  quote,
}: {
  name: string;
  role: string;
  city: string;
  quote: string;
}) {
  const initial = name[0];
  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/50 backdrop-blur p-5 sm:p-6">
      <p className="text-foreground/90 leading-relaxed">« {quote} »</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="grid place-items-center size-9 rounded-full bg-gradient-to-br from-amber to-amber-soft/60 text-primary-foreground font-display text-sm">
          {initial}
        </div>
        <div className="text-sm">
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground">
            {" "}
            · {role} · {city}
          </span>
        </div>
      </div>
    </div>
  );
}

function AccessSection() {
  const t = useT();
  return (
    <section className="border-y border-border bg-surface-0/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("access.eyebrow")}
        </div>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-[-0.03em]">
          {t("access.title")}
        </h2>
        <p className="mt-4 mx-auto max-w-xl text-foreground/80 leading-relaxed">
          {t("access.body")}
        </p>
      </div>
    </section>
  );
}

const FAQ_KEYS = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
];

function FaqSection() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("faq.eyebrow")}
        </div>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
          {t("faq.title")}
        </h2>
      </div>
      <div className="divide-y divide-border border-y border-border">
        {FAQ_KEYS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-lg sm:text-xl tracking-[-0.01em]">{t(f.q)}</span>
                <ChevronDown
                  className={
                    "size-5 text-muted-foreground transition-transform " +
                    (isOpen ? "rotate-180 text-amber" : "")
                  }
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="pb-5 text-foreground/80 leading-relaxed pr-8">{t(f.a)}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FooterSection() {
  const t = useT();
  const { data: session } = authClient.useSession();
  const isSignedIn = !!session?.user;
  const teamHref = !isSignedIn ? "/auth/sign-in" : "/app";
  const storedSession = loadSession();
  const isAdmin = storedSession?.user?.role === "admin";

  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground">
            <span className="font-display text-sm">C</span>
          </div>
          <span className="font-display tracking-[-0.02em]">Cortexia</span>
          <span className="text-muted-foreground text-xs">{t("footer.copy")}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition">
            {t("footer.policy")}
          </a>
          <a href="#" className="hover:text-foreground transition">
            {t("footer.contact")}
          </a>
          {isAdmin && (
            <a
              href={teamHref}
              className="opacity-40 hover:opacity-80 transition inline-flex items-center gap-1"
            >
              {t("footer.team")} <ArrowRight className="size-3" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
