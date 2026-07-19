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
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { authClient } from "../auth";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Erreur 404
        </div>
        <h1 className="mt-4 font-display text-6xl tracking-[-0.03em] text-foreground">
          Cette page n'existe pas.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Le lien est peut-être ancien, ou la page a été déplacée. Retour à la maison.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Retour à l'accueil
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
          Erreur inattendue
        </div>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground">
          La page n'a pas chargé.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Réessaie, ou reviens à l'accueil.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-border-strong transition"
          >
            Accueil
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
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <script src="https://cdn.fedapay.com/checkout.js?v=1.1.7" />
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
