import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignedIn, RedirectToSignIn } from "@neondatabase/auth-ui";
import { AmbientBackground } from "@/components/ambient-background";
import { LocalePicker } from "@/components/locale-picker";
import { PriceDisplay } from "@/components/price-display";
import { OnboardingOverlay, useOnboarding } from "@/components/onboarding-overlay";
import {
  LayoutGrid,
  History,
  Code2,
  Wallet,
  Sparkles,
  HelpCircle,
    Workflow,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { getUserBalance } from "@/lib/api/balance";
import { loadSession } from "@/lib/auth-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    // Skip auth check during SSR — localStorage is not available on server
    if (typeof window === "undefined") return;
    const session = loadSession();
    if (!session) {
      throw redirect({ to: "/auth/$pathname" as "/auth/$pathname", params: { pathname: "sign-in" }, search: { redirect: location.href } });
    }
  },
  head: () => ({
    meta: [{ title: "Cortexia — App" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AppLayout,
});

function AppLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [balance, setBalance] = useState<number>(0);
  const t = useT();
  const { open, setOpen } = useOnboarding();

  useEffect(() => {
    async function fetchBalance() {
      try {
        const result = await getUserBalance({ data: { sessionToken: loadSession()?.token } });
        setBalance(result?.balance ?? 0);
      } catch {
        // Balance fetch failed — show $0, user can refresh
      }
    }
    fetchBalance();
  }, []);

  return (
    <>
      <SignedIn>
        <AppShell path={path} CREDIT_USD={balance} t={t} open={open} setOpen={setOpen} />
      </SignedIn>
      <RedirectToSignIn />
    </>
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
    { to: "/app/workflows", label: t("app.nav.workflows") || "Workflows", icon: Workflow, exact: true },
    { to: "/app/models", label: t("app.nav.models"), icon: LayoutGrid },
    { to: "/app/history", label: t("app.nav.history"), icon: History, exact: true },
    { to: "/app/developers", label: t("app.nav.dev"), icon: Code2, exact: true },
    { to: "/app/account", label: t("app.nav.account"), icon: Wallet, exact: true },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

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
              {t("app.recharge")}
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-20 backdrop-blur-md bg-background/60 border-b border-border">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-8 h-14">
              <div className="flex items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="md:hidden inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-1/60 transition-colors"
                      aria-label="Open navigation"
                    >
                      <Menu className="size-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0 bg-surface-0/95 backdrop-blur-xl">
                    <SheetHeader className="p-4 border-b border-border">
                      <SheetTitle className="flex items-center gap-2">
                        <div className="grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground">
                          <span className="font-display text-sm">C</span>
                        </div>
                        <span className="font-display tracking-[-0.02em] text-lg">Cortexia</span>
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="p-3 space-y-0.5">
                      {NAV.map((item) => {
                        const active = item.exact ? path === item.to : path.startsWith(item.to);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to as never}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
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
                    <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
                      <div className="rounded-xl border border-border bg-surface-1/60 p-3">
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
                          onClick={() => setMobileOpen(false)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-amber-soft hover:underline"
                        >
                          {t("app.recharge")}
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Sparkles className="size-3 text-amber" />
                  {t("app.header.internal")}
                </div>
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
