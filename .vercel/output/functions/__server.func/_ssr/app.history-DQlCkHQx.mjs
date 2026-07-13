import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { n as PriceDisplay, r as cn } from "./price-display-CaZPZTYO.mjs";
import { T as Copy, c as RefreshCw, j as Check, s as Search, t as X } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { n as basePrice, t as MODELS } from "./models-C7mRBOxQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.history-DQlCkHQx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PROMPTS = [
	"Flacon ambré, marbre travertin, lumière naturelle",
	"Sneakers urbaines, plan matinal, énergie contenue",
	"Voix off teaser série, ton grave, français",
	"Storyboard émission cuisine à Dakar, 6 cases",
	"Portrait UGC beauté, éclairage doux",
	"Pub 15s café artisan, plan serré barista",
	"Mockup story pâtisserie fine",
	"Animation logo, transition ambre vers noir",
	"Voix commerciale radio, portugais chaleureux",
	"Plan drone plage brésilienne, coucher soleil",
	"Cinemagraph mode, robe qui bouge",
	"Illustration éditoriale, article business"
];
var TINTS = [
	"#3d2a1e",
	"#2a1e3d",
	"#1e3d2a",
	"#3d1e2a",
	"#2a3d1e",
	"#1e2a3d"
];
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
function makeItems() {
	const pool = MODELS.filter((m) => m.category !== "text");
	return Array.from({ length: 48 }).map((_, i) => {
		const m = pool[i % pool.length];
		return {
			id: `g-${i}`,
			model: m,
			prompt: PROMPTS[i % PROMPTS.length],
			date: `il y a ${i + 1}h`,
			cost: basePrice(m) * (m.unit === "second" ? 5 : 1),
			ratio: i % 5 === 0 ? "aspect-[9/16]" : i % 3 === 0 ? "aspect-[3/4]" : "aspect-square",
			tint: TINTS[i % TINTS.length]
		};
	});
}
function HistoryPage() {
	const [items] = (0, import_react.useState)(makeItems);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [cat, setCat] = (0, import_react.useState)("all");
	const [q, setQ] = (0, import_react.useState)("");
	const [modelSlug, setModelSlug] = (0, import_react.useState)("all");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const modelOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Map();
		items.forEach((it) => set.set(it.model.slug, it.model));
		return Array.from(set.values());
	}, [items]);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return items.filter((it) => {
			if (cat !== "all" && it.model.category !== cat) return false;
			if (modelSlug !== "all" && it.model.slug !== modelSlug) return false;
			if (term && !it.prompt.toLowerCase().includes(term) && !it.model.name.toLowerCase().includes(term)) return false;
			return true;
		});
	}, [
		items,
		cat,
		modelSlug,
		q
	]);
	function copyPrompt(text) {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 sm:px-8 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 grid gap-4 sm:flex sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: "Historique"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl tracking-[-0.03em]",
							children: "Tout ce que tu as créé."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-muted-foreground text-sm",
							children: [
								filtered.length,
								" génération",
								filtered.length > 1 ? "s" : "",
								" · ",
								items.length,
								" au total"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Rechercher un prompt, un modèle…",
						className: "w-full sm:w-72 rounded-full border border-border bg-surface-1/70 pl-9 pr-4 py-2 text-sm focus:border-amber/40 outline-none"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 mb-4",
				children: [CATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setCat(c.key);
						setModelSlug("all");
					},
					className: cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition", cat === c.key ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border bg-surface-1/50 text-muted-foreground hover:text-foreground"),
					children: c.label
				}, c.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
						children: "Modèle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: modelSlug,
						onChange: (e) => setModelSlug(e.target.value),
						className: "rounded-full border border-border bg-surface-1/70 px-3 py-1.5 text-xs focus:border-amber/40 outline-none max-w-[200px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Tous"
						}), modelOptions.filter((m) => cat === "all" || m.category === cat).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: m.slug,
							children: m.name
						}, m.slug))]
					})]
				})]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 text-center text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-2xl mb-2",
					children: "Rien à afficher."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm",
					children: "Ajuste les filtres ou lance une nouvelle génération."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]",
				children: filtered.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSelected(it),
					className: "mb-3 block w-full break-inside-avoid group relative overflow-hidden rounded-xl border border-border " + it.ratio,
					style: { background: `linear-gradient(135deg, ${it.tint}, oklch(0.14 0 0))` },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-black/30 to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-foreground/80",
							children: it.model.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono text-amber-soft truncate",
									children: it.model.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-foreground/90 line-clamp-1",
									children: it.prompt
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground mt-1 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: it.date }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
										usd: it.cost,
										className: "text-[10px]"
									})]
								})
							]
						})
					]
				}, it.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				onClick: () => setSelected(null),
				className: "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.aside, {
				initial: { x: "100%" },
				animate: { x: 0 },
				exit: { x: "100%" },
				transition: {
					duration: .35,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				className: "fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-surface-1 border-l border-border overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sticky top-0 flex items-center justify-between p-4 border-b border-border bg-surface-1/95 backdrop-blur",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: "Détail"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSelected(null),
							className: "rounded-lg p-1 hover:bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "m-4 rounded-xl " + selected.ratio,
						style: { background: `linear-gradient(135deg, ${selected.tint}, oklch(0.14 0 0))` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 pb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Prompt"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => copyPrompt(selected.prompt),
									className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground",
									children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-emerald" }), " Copié"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3" }), " Copier"] })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-foreground/90 leading-relaxed",
								children: selected.prompt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 grid grid-cols-2 gap-4 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: "Modèle"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1",
											children: selected.model.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-foreground font-mono",
											children: selected.model.provider
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: "Coût"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
											usd: selected.cost,
											emphasize: true
										})
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: "Date"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1",
										children: selected.date
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: "Catégorie"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 capitalize",
										children: selected.model.category
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " Régénérer avec ces paramètres"]
							})
						]
					})
				]
			})] }) })
		]
	});
}
//#endregion
export { HistoryPage as component };
