import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { i as formatMoney, n as PriceDisplay, o as useCurrency, r as cn } from "./price-display-CaZPZTYO.mjs";
import { M as Bitcoin, j as Check, n as Wallet, o as Smartphone, w as CreditCard } from "../_libs/lucide-react.mjs";
import { t as LocalePicker } from "./locale-picker-0H6kIonM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.account-djQ63ZWs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TX = [
	{
		d: "12 nov.",
		label: "Génération — Kling 3 Turbo 1080p (5s)",
		amount: -.709,
		kind: "debit"
	},
	{
		d: "12 nov.",
		label: "Génération — Seedream 5.0 Pro 1K",
		amount: -.0441,
		kind: "debit"
	},
	{
		d: "11 nov.",
		label: "Recharge — Mobile Money (Orange)",
		amount: 10,
		kind: "credit"
	},
	{
		d: "10 nov.",
		label: "Génération — ElevenLabs V3 (2 400 car.)",
		amount: -.2117,
		kind: "debit"
	},
	{
		d: "9 nov.",
		label: "Génération — GPT-5.5 (input+output)",
		amount: -.0521,
		kind: "debit"
	},
	{
		d: "5 nov.",
		label: "Recharge — Carte Visa",
		amount: 20,
		kind: "credit"
	}
];
var METHODS = [
	{
		key: "mm",
		name: "Mobile Money",
		desc: "Orange · MTN · Wave · M-Pesa",
		icon: Smartphone
	},
	{
		key: "card",
		name: "Carte",
		desc: "Visa · Mastercard · Amex",
		icon: CreditCard
	},
	{
		key: "crypto",
		name: "Crypto",
		desc: "USDT · USDC · BTC · ETH",
		icon: Bitcoin
	},
	{
		key: "ali",
		name: "Alipay",
		desc: "Chine et Asie du Sud-Est",
		icon: Wallet
	}
];
function AccountPage() {
	const c = useCurrency();
	const [method, setMethod] = (0, import_react.useState)("mm");
	const [amount, setAmount] = (0, import_react.useState)(10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-5 sm:px-8 py-10 space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
				children: "Compte"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-[-0.03em]",
				children: "Solde et facturation."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1fr,1.2fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-[1.586/1] rounded-3xl overflow-hidden p-6 flex flex-col justify-between surface-gradient-border bg-[linear-gradient(135deg,oklch(0.22_0.05_60),oklch(0.14_0.02_50))]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-20 -right-20 size-64 rounded-full bg-amber/20 blur-3xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10 flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft/90",
								children: "Solde disponible"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
								usd: 24.63,
								className: "mt-2 font-display text-5xl tracking-[-0.03em]",
								emphasize: true
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid place-items-center size-9 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm",
									children: "C"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-xs text-foreground/70 uppercase tracking-wider",
								children: "Cortexia — Compte principal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-mono text-sm text-foreground/90",
								children: ["•••• •••• •••• ", (/* @__PURE__ */ new Date()).getFullYear().toString().slice(-4)]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-gradient-border rounded-3xl bg-surface-1/60 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: "Recharger"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl tracking-[-0.02em]",
							children: "Ajoute des crédits."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 grid gap-2 sm:grid-cols-2",
							children: METHODS.map((m) => {
								const active = method === m.key;
								const Icon = m.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setMethod(m.key),
									className: cn("flex items-start gap-3 rounded-xl border p-3 text-left transition", active ? "border-amber/60 bg-amber/10" : "border-border bg-surface-2/40 hover:border-border-strong"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: cn("grid place-items-center size-9 rounded-lg", active ? "bg-amber/20 text-amber" : "bg-surface-3 text-muted-foreground"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-medium",
												children: m.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-muted-foreground",
												children: m.desc
											})]
										}),
										active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-amber" })
									]
								}, m.key);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Montant à recharger"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: ["= ", formatMoney(amount, c)]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										5,
										10,
										20,
										50,
										100
									].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setAmount(v),
										className: "rounded-full border px-3 py-1.5 text-xs transition " + (amount === v ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border text-muted-foreground hover:text-foreground"),
										children: formatMoney(v, c)
									}, v))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
									children: ["Recharger ", formatMoney(amount, c)]
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between mb-4 gap-4 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-[-0.02em]",
					children: "Transactions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Devise d'affichage :"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalePicker, {})]
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
									children: "Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 font-normal",
									children: "Description"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-4 font-normal text-right",
									children: "Montant"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: TX.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0 hover:bg-surface-2/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-4 text-muted-foreground font-mono text-xs",
								children: t.d
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-4",
								children: t.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "p-4 text-right font-mono tabular " + (t.amount > 0 ? "text-emerald" : "text-foreground/85"),
								children: [t.amount > 0 ? "+" : "", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
									usd: Math.abs(t.amount),
									className: t.amount > 0 ? "text-emerald" : "",
									forceDecimals: 4
								})]
							})
						]
					}, i)) })]
				})
			})] })
		]
	});
}
//#endregion
export { AccountPage as component };
