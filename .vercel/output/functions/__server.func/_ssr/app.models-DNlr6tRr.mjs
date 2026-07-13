import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as useMatchRoute, l as Outlet, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { n as PriceDisplay, r as cn } from "./price-display-CaZPZTYO.mjs";
import { O as ChevronRight, k as ChevronLeft, s as Search } from "../_libs/lucide-react.mjs";
import { i as unitLabel, n as basePrice, t as MODELS } from "./models-C7mRBOxQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.models-DNlr6tRr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ModelsLayout() {
	if (!useMatchRoute()({
		to: "/app/models",
		exact: true
	})) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelsCatalog, {});
}
var CATS = [
	{
		key: "all",
		label: "Tout"
	},
	{
		key: "image",
		label: "Image"
	},
	{
		key: "video",
		label: "Vidéo"
	},
	{
		key: "audio",
		label: "Voix"
	},
	{
		key: "text",
		label: "Texte"
	}
];
var PAGE_SIZE = 12;
function ModelsCatalog() {
	const [cat, setCat] = (0, import_react.useState)("all");
	const [q, setQ] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return MODELS.filter((m) => (cat === "all" || m.category === cat) && (term === "" || m.name.toLowerCase().includes(term) || m.provider.toLowerCase().includes(term) || m.blurb.toLowerCase().includes(term)));
	}, [cat, q]);
	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	(0, import_react.useEffect)(() => {
		setPage(1);
	}, [cat, q]);
	const safePage = Math.min(page, pageCount);
	const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 sm:px-8 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:flex sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: "Catalogue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl sm:text-5xl tracking-[-0.03em]",
							children: "Tous les modèles disponibles."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted-foreground",
							children: "Prix affichés déjà majorés — pas de surprise à la facturation."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Kling, Claude, ElevenLabs…",
						className: "w-full sm:w-72 rounded-full border border-border bg-surface-1/70 pl-9 pr-4 py-2 text-sm focus:border-amber/40 outline-none"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-2",
				children: [CATS.map((c) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setCat(c.key),
						className: cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer", cat === c.key ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border bg-surface-1/50 text-muted-foreground hover:text-foreground hover:border-border-strong"),
						children: c.label
					}, c.key);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto text-xs text-muted-foreground font-mono",
					children: [
						filtered.length,
						" modèle",
						filtered.length > 1 ? "s" : ""
					]
				})]
			}),
			paged.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 text-center text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-2xl mb-2",
					children: "Aucun modèle ne correspond."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm",
					children: "Essaie un autre nom ou une autre catégorie."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: paged.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelCard, { m }, m.slug))
			}), pageCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex items-center justify-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setPage((p) => Math.max(1, p - 1)),
						disabled: safePage === 1,
						className: "inline-flex items-center gap-1 rounded-full border border-border bg-surface-1/50 px-3 py-1.5 text-xs disabled:opacity-40 hover:border-amber/40 transition cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" }), " Précédent"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1",
						children: Array.from({ length: pageCount }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setPage(i + 1),
							className: cn("size-8 rounded-full text-xs font-mono transition cursor-pointer", safePage === i + 1 ? "bg-amber text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"),
							children: i + 1
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setPage((p) => Math.min(pageCount, p + 1)),
						disabled: safePage === pageCount,
						className: "inline-flex items-center gap-1 rounded-full border border-border bg-surface-1/50 px-3 py-1.5 text-xs disabled:opacity-40 hover:border-amber/40 transition cursor-pointer",
						children: ["Suivant ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })]
					})
				]
			})] })
		]
	});
}
function ModelCard({ m }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/app/models/$slug",
		params: { slug: m.slug },
		className: "group surface-gradient-border rounded-2xl bg-surface-1/60 backdrop-blur p-5 hover:bg-surface-1/80 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_oklch(0.78_0.16_70_/_0.25)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-start justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg tracking-[-0.01em] truncate",
							children: m.name
						}), m.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider " + (m.badge === "popular" ? "bg-amber/20 text-amber-soft" : m.badge === "new" ? "bg-emerald/20 text-emerald" : "bg-surface-3 text-muted-foreground"),
							children: m.badge === "popular" ? "Populaire" : m.badge === "new" ? "Nouveau" : "Pro"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
						children: [
							m.provider,
							" · ",
							m.category
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-2",
				children: m.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 pt-4 border-t border-border flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
					usd: basePrice(m),
					className: "font-display text-2xl tracking-[-0.02em]",
					emphasize: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-muted-foreground font-mono",
					children: unitLabel(m)
				})]
			})
		]
	});
}
//#endregion
export { ModelsLayout as component };
