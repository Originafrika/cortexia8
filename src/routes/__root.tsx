import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { initTheme } from "../components/ui/theme-toggle";
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { authClient } from "../auth";
import { useLang, useLocaleStore } from "../lib/i18n";
import { useCurrencyStore } from "../lib/currency";
import { initSentry } from "../lib/sentry";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// Initialize Sentry on module load
initSentry();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Error 404
        </div>
        <h1 className="mt-4 font-display text-6xl tracking-[-0.03em] text-foreground">
          This page doesn't exist.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link may be old, or the page has been moved. Back to home.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Unexpected Error
        </div>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground">
          The page failed to load.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Try again, or go back to the homepage.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-border-strong transition"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cortexia L'IA sans t'abonner" },
      {
        name: "description",
        content:
          "Cortexia est le point d'entrée unique vers les meilleurs modèles d'IA image, vidéo, voix, texte  facturés à l'usage. Sans abonnement. Payables partout, avec Mobile Money, carte, crypto ou Alipay.",
      },
      { name: "author", content: "Cortexia" },
      { name: "theme-color", content: "#0A0A0B" },
      { property: "og:title", content: "Cortexia L'IA sans t'abonner" },
      {
        property: "og:description",
        content:
          "Cortexia est le point d'entrée unique vers les meilleurs modèles d'IA image, vidéo, voix, texte  facturés à l'usage. Sans abonnement. Payables partout, avec Mobile Money, carte, crypto ou Alipay.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Cortexia" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cortexia L'IA sans t'abonner" },
      {
        name: "twitter:description",
        content:
          "Cortexia est le point d'entrée unique vers les meilleurs modèles d'IA image, vidéo, voix, texte  facturés à l'usage. Sans abonnement. Payables partout, avec Mobile Money, carte, crypto ou Alipay.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9f440d47-3537-4db2-8d6a-e5b0e8434401",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9f440d47-3537-4db2-8d6a-e5b0e8434401",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
      {
        rel: "preconnect",
        href: "https://plausible.io",
      },
    ],
    scripts: [
      {
        src: "https://plausible.io/js/script.js",
        defer: true,
        "data-domain": "cortexia.originafrika.online",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function HydrateStores() {
  useEffect(() => {
    useLocaleStore.persist.rehydrate();
    useCurrencyStore.persist.rehydrate();
  }, []);
  return null;
}

function RootShell({ children }: { children: ReactNode }) {
  useEffect(() => { initTheme(); }, []);
  const lang = useLang();

  return (
    <html lang={lang}>
      <head>
        <HeadContent />
      </head>
      <body>
        <HydrateStores />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <NeonAuthUIProvider authClient={authClient} emailOTP>
        <Outlet />
      </NeonAuthUIProvider>
    </QueryClientProvider>
  );
}
