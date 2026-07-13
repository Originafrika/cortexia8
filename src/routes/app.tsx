import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AmbientBackground } from "@/components/ambient-background";
import { LocalePicker } from "@/components/locale-picker";
import { PriceDisplay } from "@/components/price-display";
import { OnboardingOverlay, useOnboarding } from "@/components/onboarding-overlay";
import { SignedIn, RedirectToSignIn } from "@neondatabase/auth-ui";
import {
  MessageSquare,
  LayoutGrid,
  History,
  Code2,
  Wallet,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "Cortexia — App" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AppLayout,
});

function AppLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const CREDIT_USD = 24.63;
  const t = useT();
  const { open, setOpen } = useOnboarding();

  return (
    <SignedIn>
      <AppShell path={path} CREDIT_USD={CREDIT_USD} t={t} open={open} setOpen={setOpen} />
    </SignedIn>
    <RedirectToSignIn />
  );
}

function AppShell({
  path,
  CREDIT_USD,
  t,
  open,
  setOpen,
}: {
  path: string;
  CREDIT_USD: number;
  t: (k: string) => string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const NAV = [
    { to: "/app", label: t("app.nav.agent"), icon: MessageSquare, exact: true },
    { to: "/app/models", label: t("app.nav.models"), icon: LayoutGrid },
    { to: "/app/history", label: t("app.nav.history"), icon: History },
    { to: "/app/developers", label: t("app.nav.dev"), icon: Code2 },
    { to: "/app/account", label: t("app.nav.account"), icon: Wallet },
  ];

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <div className="mx-auto max-w-[1400px] flex min-h-screen">
        <aside className="hidden md:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-border bg-surface-0/40 backdrop-blur px-3 py-4">
          <Link to="/app" className="flex items-center gap-2 px-3 py-2">
            <div className="grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground">
              <span className="font-display text-sm">C</span>
            </div>
            <span className="font-display tracking-[-0.02em] text-lg">Cortexia</span>
          </Link>
          <nav className="mt-6 space-y-0.5">
            {NAV.map((item) => {
              const active = item.exact ? path === item.to : path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as never}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-2/70 text-foreground"
                      : "text-muted-foreground hover:bg-surface-1/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-xl border border-border bg-surface-1/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("app.header.balance")}
            </div>
            <PriceDisplay
              usd={CREDIT_USD}
              className="mt-1 font-display text-2xl tracking-[-0.02em]"
              emphasize
            />
            <Link
              to="/app/account"
              className="mt-2 inline-flex items-center gap-1 text-xs text-amber-soft hover:underline"
            >
              Recharger →
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-20 backdrop-blur-md bg-background/60 border-b border-border">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-8 h-14">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="size-3 text-amber" />
                {t("app.header.internal")}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                  aria-label={t("app.header.help")}
                >
                  <HelpCircle className="size-3.5" />
                  {t("app.header.help")}
                </button>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-surface-1/60 px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">{t("app.header.balance")}</span>
                  <PriceDisplay usd={CREDIT_USD} className="text-xs" emphasize />
                </div>
                <LocalePicker />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <OnboardingOverlay open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
