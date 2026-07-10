import { createFileRoute, Link } from "@tanstack/react-router";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";
import { CreditSimulator } from "@/components/credit-simulator";
import { ModelsMarquee } from "@/components/models-marquee";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app-preview")({
  head: () => ({
    meta: [
      { title: "Cortexia — Preview interne" },
      { name: "description", content: "Version preview de la landing post-lancement. CTA direct vers l'app." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AppPreview,
});

function AppPreview() {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SiteHeader variant="preview" />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 backdrop-blur px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald pulse-soft" />
          En ligne — accès libre
        </motion.div>
        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.035em]">
          Un accès. Tous les modèles.<br />
          <span className="italic text-amber-soft">Facturé à la seconde.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-foreground/80 leading-relaxed">
          Cortexia route ton prompt vers le meilleur modèle disponible — ou tu choisis toi-même.
          Payé à l'usage. Zéro abonnement. Payable partout.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/app" className="group inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition">
            Commencer à créer
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link to="/app/models" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-border-strong transition">
            Voir le catalogue
          </Link>
        </div>
      </section>

      <section className="py-14 border-y border-border bg-surface-0/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 mb-8">
          <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.03em]">Modèles disponibles</h2>
        </div>
        <ModelsMarquee />
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-4xl sm:text-5xl tracking-[-0.03em]">Simule ton usage.</h2>
          <p className="mt-4 text-foreground/75">Aucune surprise en fin de mois — la facture est le simulateur.</p>
        </div>
        <CreditSimulator />
      </section>
    </div>
  );
}
