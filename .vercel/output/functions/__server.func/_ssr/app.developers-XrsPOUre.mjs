import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { n as PriceDisplay } from "./price-display-CaZPZTYO.mjs";
import { T as Copy, _ as KeyRound, i as TriangleAlert, j as Check, l as Plus, t as X } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.developers-XrsPOUre.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEYS = [
	{
		id: "1",
		name: "Production — site principal",
		prefix: "cx_live_9F2a",
		scope: "generate:*",
		lastUsed: "il y a 12 min",
		active: true
	},
	{
		id: "2",
		name: "Notebook expérimentations",
		prefix: "cx_test_A73k",
		scope: "generate:image",
		lastUsed: "il y a 3 j",
		active: true
	},
	{
		id: "3",
		name: "Ancienne app (à supprimer)",
		prefix: "cx_live_1B4z",
		scope: "generate:*",
		lastUsed: "il y a 2 mois",
		active: false
	}
];
var USAGE = [
	12,
	34,
	22,
	46,
	88,
	74,
	92,
	108,
	64,
	130,
	156,
	118,
	172,
	210
];
function DevelopersPage() {
	const [tab, setTab] = (0, import_react.useState)("curl");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [showNewKey, setShowNewKey] = (0, import_react.useState)(null);
	const snippets = {
		curl: `curl https://api.cortexia.ai/v1/generate \\
  -H "Authorization: Bearer $CORTEXIA_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "seedream-5-pro",
    "prompt": "Un flacon ambré sur marbre travertin",
    "resolution": "1K"
  }'`,
		js: `import Cortexia from "@cortexia/sdk";
const cx = new Cortexia({ apiKey: process.env.CORTEXIA_KEY });

const { url, cost } = await cx.generate({
  model: "seedream-5-pro",
  prompt: "Un flacon ambré sur marbre travertin",
  resolution: "1K",
});`,
		py: `from cortexia import Cortexia
cx = Cortexia(api_key=os.environ["CORTEXIA_KEY"])

result = cx.generate(
    model="seedream-5-pro",
    prompt="Un flacon ambré sur marbre travertin",
    resolution="1K",
)
print(result.url, result.cost)`
	};
	function copy() {
		navigator.clipboard.writeText(snippets[tab]);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}
	function createKey() {
		const bytes = /* @__PURE__ */ new Uint8Array(24);
		crypto.getRandomValues(bytes);
		const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
		setShowNewKey("cx_live_" + hex);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-5 sm:px-8 py-10 space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
					children: "Développeur"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-[-0.03em]",
					children: "API Cortexia."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground max-w-2xl",
					children: "Une seule facturation à l'usage pour tous les modèles. Pas de plan mensuel obligatoire, pas de minimum."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Appels ce mois",
						value: "12 480"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Coût ce mois",
						priceUSD: 38.72
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Taux de réussite",
						value: "99,7 %"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-gradient-border rounded-2xl bg-surface-1/60 p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-baseline justify-between mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
						children: "Usage — 14 derniers jours"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end gap-1 h-32",
					children: USAGE.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 rounded-t bg-gradient-to-t from-amber/70 to-amber-soft/60",
						style: { height: `${v / 210 * 100}%` }
					}, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-[-0.02em]",
					children: "Clés API"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: createKey,
					className: "inline-flex items-center gap-1.5 rounded-full bg-amber text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-95 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Nouvelle clé"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-left text-xs font-mono uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 font-normal",
									children: "Nom"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 font-normal",
									children: "Clé"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 font-normal",
									children: "Scope"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 font-normal",
									children: "Dernière utilisation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 font-normal",
									children: "Statut"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0 hover:bg-surface-2/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "p-4 flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-3.5 text-muted-foreground" }),
									" ",
									k.name
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "p-4 font-mono text-xs",
								children: [k.prefix, "••••••••"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-4 font-mono text-xs text-muted-foreground",
								children: k.scope
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-4 text-muted-foreground",
								children: k.lastUsed
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase " + (k.active ? "bg-emerald/15 text-emerald" : "bg-surface-3 text-muted-foreground"),
									children: k.active ? "Active" : "Révoquée"
								})
							})
						]
					}, k.id)) })]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-[-0.02em] mb-4",
				children: "Démarrer en 30 secondes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1",
						children: [
							"curl",
							"js",
							"py"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setTab(t),
							className: "rounded-full px-3 py-1 text-xs font-mono transition " + (tab === t ? "bg-surface-3 text-foreground" : "text-muted-foreground hover:text-foreground"),
							children: t === "curl" ? "cURL" : t === "js" ? "JavaScript" : "Python"
						}, t))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: copy,
						className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
						children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-emerald" }), " Copié"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), " Copier"] })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre",
					children: snippets[tab]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showNewKey && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				className: "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm",
				onClick: () => setShowNewKey(null)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					scale: .96
				},
				animate: {
					opacity: 1,
					scale: 1
				},
				exit: {
					opacity: 0,
					scale: .96
				},
				className: "fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[520px] surface-gradient-border rounded-2xl bg-surface-1 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft",
							children: "Clé créée"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 font-display text-2xl tracking-[-0.02em]",
							children: "Copie-la maintenant."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowNewKey(null),
							className: "rounded-lg p-1 hover:bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl border border-amber/30 bg-amber/5 p-3 flex items-start gap-2 text-xs text-amber-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "C'est la seule fois où tu verras ce secret en clair. Après cette fenêtre, il ne pourra plus être récupéré — seulement révoqué." })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs",
							children: showNewKey
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => navigator.clipboard.writeText(showNewKey),
							className: "rounded-lg border border-border px-3 py-2 text-xs hover:border-amber/40",
							children: "Copier"
						})]
					})
				]
			})] }) })
		]
	});
}
function StatCard({ label, value, priceUSD }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-gradient-border rounded-2xl bg-surface-1/60 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 font-display text-3xl tracking-[-0.02em]",
			children: priceUSD != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
				usd: priceUSD,
				emphasize: true,
				className: "font-display text-3xl"
			}) : value
		})]
	});
}
//#endregion
export { DevelopersPage as component };
