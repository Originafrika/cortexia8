import { createFileRoute, Link } from "@tanstack/react-router";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";
import { EditorialCountdown } from "@/components/editorial-countdown";
import { WaitlistForm } from "@/components/waitlist-form";
import { CreditSimulator } from "@/components/credit-simulator";
import { ModelsMarquee } from "@/components/models-marquee";
import { ModelsWall, WallPreview } from "@/components/models-wall";
import { PriceDisplay } from "@/components/price-display";
import { useCountUp } from "@/lib/use-count-up";
import { useT } from "@/lib/i18n";
import { LAUNCH_DATE } from "@/lib/launch";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cortexia — L'IA sans t'abonner. Waitlist ouverte." },
      {
        name: "description",
        content:
          "Cortexia ouvre le 1er août : un accès unique aux meilleurs modèles IA image, vidéo, voix, texte — facturés à l'usage. Rejoins la waitlist.",
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
      <WallPreviewSection />
      <SimulatorSection />
      <WallSection />
      <ModelsSection />
      <ComparisonSection />
      <SocialProofSection />
      <FaqSection />
      <FooterSection />
    </div>
  );
}

function LangFade({ children }: { children: React.ReactNode }) {
  // Force re-mount on lang change for a smooth text swap.
  const t = useT();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={t("hero.title.a")}
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
            <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.035em]">
              {t("hero.title.a")}
              <br />
              <span className="italic text-amber-soft">{t("hero.title.b")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/80 leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </LangFade>

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

function WallPreviewSection() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-16 sm:pb-24">
      <div className="max-w-2xl mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("wall.eyebrow")}
        </div>
      </div>
      <WallPreview />
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
          {t("sim.title.a")}
          <br />
          <span className="text-muted-foreground italic">{t("sim.title.b")}</span>
        </h2>
        <p className="mt-4 text-foreground/75">{t("sim.subtitle")}</p>
      </div>
      <CreditSimulator />
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

function ModelsSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Catalogue
        </div>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
          Tous les modèles qui comptent. Sous un seul compte.
        </h2>
      </div>
      <ModelsMarquee />
    </section>
  );
}

function ComparisonSection() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      <div className="max-w-2xl mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("compare.eyebrow")}
        </div>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
          {t("compare.title.a")}
          <br /> {t("compare.title.b")}
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <PlanCard
          kind="old"
          title={t("compare.old.title")}
          subtitle={t("compare.old.subtitle")}
          items={[
            { label: "Higgsfield Pro", usd: 39 },
            { label: "Midjourney Standard", usd: 30 },
            { label: "ElevenLabs Starter", usd: 22 },
          ]}
          note={t("compare.old.note")}
        />
        <PlanCard
          kind="cortexia"
          title={t("compare.new.title")}
          subtitle={t("compare.new.subtitle")}
          items={[
            { label: "30 s de vidéo Kling 3 Turbo 1080p", usd: 30 * 0.1418 },
            { label: "40 images Seedream Pro 1K", usd: 40 * 0.0441 },
            { label: "6 000 caractères ElevenLabs V3", usd: 6 * 0.0882 },
          ]}
          note={t("compare.new.note")}
        />
      </div>
    </section>
  );
}

function PlanCard({
  kind,
  title,
  subtitle,
  items,
  note,
}: {
  kind: "old" | "cortexia";
  title: string;
  subtitle: string;
  items: { label: string; usd: number }[];
  note: string;
}) {
  const t = useT();
  const total = items.reduce((s, i) => s + i.usd, 0);
  return (
    <div
      className={
        "rounded-3xl p-7 sm:p-8 border transition-all " +
        (kind === "cortexia"
          ? "surface-gradient-border bg-surface-1/70 border-transparent shadow-[0_30px_80px_-30px_oklch(0.78_0.16_70_/_0.25)]"
          : "border-border bg-surface-0/40 text-muted-foreground")
      }
    >
      <div
        className={
          "font-mono text-[10px] uppercase tracking-[0.22em] " +
          (kind === "cortexia" ? "text-amber-soft" : "text-muted-foreground/70")
        }
      >
        {subtitle}
      </div>
      <h3
        className={
          "mt-2 font-display text-3xl tracking-[-0.02em] " +
          (kind === "cortexia" ? "text-foreground" : "text-foreground/70")
        }
      >
        {title}
      </h3>
      <ul className="mt-6 space-y-3">
        {items.map((i) => (
          <li key={i.label} className="flex items-baseline justify-between gap-4 text-sm">
            <span className={kind === "cortexia" ? "text-foreground/85" : ""}>{i.label}</span>
            <PriceDisplay
              usd={i.usd}
              className={
                "text-sm " + (kind === "cortexia" ? "text-foreground" : "line-through decoration-1")
              }
            />
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-6 border-t border-border flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wider font-mono">{t("compare.total")}</span>
        <PriceDisplay
          usd={total}
          className={
            "font-display text-3xl tracking-[-0.02em] " +
            (kind === "cortexia"
              ? "text-amber-soft"
              : "line-through decoration-1 text-muted-foreground")
          }
        />
      </div>
      <p
        className={
          "mt-4 text-xs " +
          (kind === "cortexia" ? "text-foreground/70" : "text-muted-foreground/70")
        }
      >
        {note}
      </p>
    </div>
  );
}

function SocialProofSection() {
  const t = useT();
  const [count, setCount] = useState(4218);
  useEffect(() => {
    const id = setInterval(() => setCount((v) => v + Math.floor(Math.random() * 3)), 8000);
    return () => clearInterval(id);
  }, []);
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

const FAQS = [
  {
    q: "Vraiment sans abonnement ?",
    a: "Sans. Tu recharges le montant que tu veux, tu génères, tu repars. Reviens dans 3 mois sans avoir rien perdu.",
  },
  {
    q: "Comment sont fixés les prix ?",
    a: "Un prix unique par modèle, visible avant chaque génération. Pas de palier caché, pas d'engagement, pas de minimum mensuel.",
  },
  {
    q: "Je peux payer en Mobile Money ?",
    a: "Oui — Orange Money, MTN, Wave. Aussi carte, crypto (USDT / USDC), Alipay. Le paiement local n'est pas une option de plus, c'est le cœur du produit.",
  },
  {
    q: "Quels modèles au lancement ?",
    a: "Toute la famille Kling 3, Seedance 2, Nano Banana 2, GPT-5, Claude Sonnet/Opus, Gemini 3, ElevenLabs V3, et une douzaine d'autres. Nouveaux modèles ajoutés dès leur sortie.",
  },
  {
    q: "Vous avez une API ?",
    a: "Oui, dès le lancement. Endpoints REST, clés self-service, même moteur de facturation à l'usage, sans minimum mensuel.",
  },
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
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-lg sm:text-xl tracking-[-0.01em]">{f.q}</span>
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
                <p className="pb-5 text-foreground/80 leading-relaxed pr-8">{f.a}</p>
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
          <Link
            to="/app-preview"
            className="opacity-40 hover:opacity-80 transition inline-flex items-center gap-1"
          >
            {t("footer.team")} <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
