import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { t as AmbientBackground } from "./ambient-background-CMKitxnZ.mjs";
import { i as useT } from "./i18n-BEBY8TOx.mjs";
import { P as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { a as ModelsWall, i as ModelsMarquee, o as SiteHeader, s as WallPreview, t as CreditSimulator } from "./models-wall-DjYYCNDC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-preview-CdxawR8R.js
var import_jsx_runtime = require_jsx_runtime();
function AppPreview() {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmbientBackground, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { variant: "preview" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 10
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .6 },
						className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 backdrop-blur px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-emerald pulse-soft" }), t("badge.live")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-6 max-w-4xl font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.035em]",
						children: [
							"Un accès. Tous les modèles.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "italic text-amber-soft",
								children: "Facturé à la seconde."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-lg text-foreground/80 leading-relaxed",
						children: "Cortexia route ton prompt vers le meilleur modèle disponible — ou tu choisis toi-même. Payé à l'usage. Zéro abonnement. Payable partout."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/app",
							className: "group inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
							children: ["Commencer à créer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 transition-transform group-hover:translate-x-0.5" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/models",
							className: "inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-border-strong transition",
							children: "Voir le catalogue"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-7xl px-5 sm:px-8 pb-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallPreview, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "wall",
				className: "py-16 sm:py-24 border-y border-border bg-surface-0/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-2xl mb-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
								children: t("wall.eyebrow")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]",
								children: t("wall.title")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-foreground/75",
								children: t("wall.subtitle")
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelsWall, {})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "py-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8 mb-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl sm:text-4xl tracking-[-0.03em]",
						children: "Modèles disponibles"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelsMarquee, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-2xl mb-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-4xl sm:text-5xl tracking-[-0.03em]",
						children: "Simule ton usage."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-foreground/75",
						children: "Aucune surprise en fin de mois — la facture est le simulateur."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditSimulator, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mt-8 border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 Cortexia — construit pour les créateurs, partout." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/app",
						className: "hover:text-foreground transition inline-flex items-center gap-1",
						children: ["Ouvrir l'app ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })]
					})]
				})
			})
		]
	});
}
//#endregion
export { AppPreview as component };
