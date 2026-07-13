import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as createFileRoute, f as createRootRouteWithContext, i as HeadContent, l as Outlet, m as useRouter, p as Link, r as Scripts, s as createRouter, u as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime, r as NeonAuthUIProvider } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { t as Route$9 } from "./account._pathname-WSEhitF9.mjs";
import { n as BetterAuthReactAdapter, t as createAuthClient } from "../_libs/@neondatabase/auth+[...].mjs";
import { t as Route$10 } from "./app.models._slug-BM_jj9Mm.mjs";
import { t as Route$11 } from "./auth._pathname-r_f80-4J.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D0Rns0g3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var authClient = createAuthClient("https://ep-steep-resonance-at47cg17.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth", { adapter: BetterAuthReactAdapter() });
var styles_default = "/assets/styles-BbR6lKjU.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground",
					children: "Erreur 404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-6xl tracking-[-0.03em] text-foreground",
					children: "Cette page n'existe pas."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Le lien est peut-être ancien, ou la page a été déplacée. Retour à la maison."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition",
						children: "Retour à l'accueil"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground",
					children: "Erreur inattendue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-4xl tracking-[-0.03em] text-foreground",
					children: "La page n'a pas chargé."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Réessaie, ou reviens à l'accueil."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition",
						children: "Réessayer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-border-strong transition",
						children: "Accueil"
					})]
				})
			]
		})
	});
}
var Route$8 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Cortexia L'IA sans t'abonner" },
			{
				name: "description",
				content: "Cortexia est le point d'entrée unique vers les meilleurs modèles d'IA image, vidéo, voix, texte  facturés à l'usage. Sans abonnement. Payables partout, avec Mobile Money, carte, crypto ou Alipay."
			},
			{
				name: "author",
				content: "Cortexia"
			},
			{
				name: "theme-color",
				content: "#0A0A0B"
			},
			{
				property: "og:title",
				content: "Cortexia L'IA sans t'abonner"
			},
			{
				property: "og:description",
				content: "Cortexia est le point d'entrée unique vers les meilleurs modèles d'IA image, vidéo, voix, texte  facturés à l'usage. Sans abonnement. Payables partout, avec Mobile Money, carte, crypto ou Alipay."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:site_name",
				content: "Cortexia"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "Cortexia L'IA sans t'abonner"
			},
			{
				name: "twitter:description",
				content: "Cortexia est le point d'entrée unique vers les meilleurs modèles d'IA image, vidéo, voix, texte  facturés à l'usage. Sans abonnement. Payables partout, avec Mobile Money, carte, crypto ou Alipay."
			},
			{
				property: "og:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9f440d47-3537-4db2-8d6a-e5b0e8434401"
			},
			{
				name: "twitter:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9f440d47-3537-4db2-8d6a-e5b0e8434401"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "fr",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$8.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonAuthUIProvider, {
			authClient,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})
	});
}
var $$splitComponentImporter$7 = () => import("./app-preview-CdxawR8R.mjs");
var Route$7 = createFileRoute("/app-preview")({
	head: () => ({ meta: [
		{ title: "Cortexia — Un accès. Tous les modèles. Facturé à la seconde." },
		{
			name: "description",
			content: "Cortexia route ton prompt vers le meilleur modèle image, vidéo, voix ou texte. Payé à l'usage, sans abonnement."
		},
		{
			name: "robots",
			content: "noindex,nofollow"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./app-Cfqjfcjs.mjs");
var Route$6 = createFileRoute("/app")({
	head: () => ({ meta: [{ title: "Cortexia — App" }, {
		name: "robots",
		content: "noindex,nofollow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./routes-Bmf1woyL.mjs");
var Route$5 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Cortexia — L'IA sans t'abonner. Waitlist ouverte." }, {
		name: "description",
		content: "Cortexia ouvre le 1er août : un accès unique aux meilleurs modèles IA image, vidéo, voix, texte — facturés à l'usage. Rejoins la waitlist."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./app.index-CpKx3RKw.mjs");
var Route$4 = createFileRoute("/app/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./app.models-DNlr6tRr.mjs");
var Route$3 = createFileRoute("/app/models")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./app.history-DQlCkHQx.mjs");
var Route$2 = createFileRoute("/app/history")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./app.developers-XrsPOUre.mjs");
var Route$1 = createFileRoute("/app/developers")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./app.account-djQ63ZWs.mjs");
var Route = createFileRoute("/app/account")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var AppPreviewRoute = Route$7.update({
	id: "/app-preview",
	path: "/app-preview",
	getParentRoute: () => Route$8
});
var AppRoute = Route$6.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$8
});
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var AppIndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => AppRoute
});
var AuthPathnameRoute = Route$11.update({
	id: "/auth/$pathname",
	path: "/auth/$pathname",
	getParentRoute: () => Route$8
});
var AppModelsRoute = Route$3.update({
	id: "/models",
	path: "/models",
	getParentRoute: () => AppRoute
});
var AppHistoryRoute = Route$2.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => AppRoute
});
var AppDevelopersRoute = Route$1.update({
	id: "/developers",
	path: "/developers",
	getParentRoute: () => AppRoute
});
var AppAccountRoute = Route.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => AppRoute
});
var AccountPathnameRoute = Route$9.update({
	id: "/account/$pathname",
	path: "/account/$pathname",
	getParentRoute: () => Route$8
});
var AppModelsRouteChildren = { AppModelsSlugRoute: Route$10.update({
	id: "/$slug",
	path: "/$slug",
	getParentRoute: () => AppModelsRoute
}) };
var AppRouteChildren = {
	AppAccountRoute,
	AppDevelopersRoute,
	AppHistoryRoute,
	AppModelsRoute: AppModelsRoute._addFileChildren(AppModelsRouteChildren),
	AppIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren),
	AppPreviewRoute,
	AccountPathnameRoute,
	AuthPathnameRoute
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
