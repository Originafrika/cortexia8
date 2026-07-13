import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as useRouterState, l as Outlet, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SignedIn, c as require_jsx_runtime, i as RedirectToSignIn } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { n as PriceDisplay, r as cn } from "./price-display-CaZPZTYO.mjs";
import { t as AmbientBackground } from "./ambient-background-CMKitxnZ.mjs";
import { i as useT } from "./i18n-BEBY8TOx.mjs";
import { D as CircleQuestionMark, E as CodeXml, P as ArrowRight, a as Sparkles, g as LayoutGrid, m as MessageSquare, n as Wallet, y as History } from "../_libs/lucide-react.mjs";
import { t as LocalePicker } from "./locale-picker-0H6kIonM.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-Cfqjfcjs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "cortexia:onboarded";
var STEPS = [
	{
		icon: Sparkles,
		titleKey: "app.onb.step1.title",
		bodyKey: "app.onb.step1.body",
		accent: "from-amber to-amber-soft"
	},
	{
		icon: LayoutGrid,
		titleKey: "app.onb.step2.title",
		bodyKey: "app.onb.step2.body",
		accent: "from-emerald to-amber-soft"
	},
	{
		icon: Wallet,
		titleKey: "app.onb.step3.title",
		bodyKey: "app.onb.step3.body",
		accent: "from-amber-soft to-amber"
	}
];
function OnboardingOverlay({ open, onClose }) {
	const [step, setStep] = (0, import_react.useState)(0);
	const t = useT();
	(0, import_react.useEffect)(() => {
		if (open) setStep(0);
	}, [open]);
	function done() {
		if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
		onClose();
	}
	const Step = STEPS[step];
	const StepIcon = Step.icon;
	const isLast = step === STEPS.length - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: 16,
				scale: .97
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: 12,
				scale: .98
			},
			transition: {
				duration: .4,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "surface-gradient-border relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface-1 p-6 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1.5 mb-6",
					children: STEPS.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 flex-1 rounded-full transition-colors " + (i <= step ? "bg-amber" : "bg-surface-3") }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode: "wait",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							x: 20
						},
						animate: {
							opacity: 1,
							x: 0
						},
						exit: {
							opacity: 0,
							x: -20
						},
						transition: { duration: .35 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `grid place-items-center size-14 rounded-2xl bg-gradient-to-br ${Step.accent} text-primary-foreground shadow-[0_20px_50px_-20px_oklch(0.78_0.16_70_/_0.6)]`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepIcon, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-6 font-display text-3xl sm:text-4xl tracking-[-0.02em]",
								children: t(Step.titleKey)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-foreground/80 leading-relaxed",
								children: t(Step.bodyKey)
							}),
							isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 rounded-2xl border border-amber/40 bg-amber/10 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft",
									children: "Cadeau de bienvenue"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm text-foreground",
									children: t("app.onb.welcome_credit")
								})]
							})
						]
					}, step)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: done,
						className: "text-xs text-muted-foreground hover:text-foreground transition",
						children: t("app.onb.skip")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => isLast ? done() : setStep((s) => s + 1),
						className: "group inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
						children: [isLast ? t("app.onb.done") : t("app.onb.next"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 transition-transform group-hover:translate-x-0.5" })]
					})]
				})
			]
		})
	}) });
}
function useOnboarding() {
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (!localStorage.getItem(STORAGE_KEY)) {
			const id = window.setTimeout(() => setOpen(true), 500);
			return () => window.clearTimeout(id);
		}
	}, []);
	return {
		open,
		setOpen
	};
}
function AppLayout() {
	const path = useRouterState({ select: (s) => s.location.pathname });
	const CREDIT_USD = 24.63;
	const t = useT();
	const { open, setOpen } = useOnboarding();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		path,
		CREDIT_USD,
		t,
		open,
		setOpen
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {})] });
}
function AppShell({ path, CREDIT_USD, t, open, setOpen }) {
	const NAV = [
		{
			to: "/app",
			label: t("app.nav.agent"),
			icon: MessageSquare,
			exact: true
		},
		{
			to: "/app/models",
			label: t("app.nav.models"),
			icon: LayoutGrid
		},
		{
			to: "/app/history",
			label: t("app.nav.history"),
			icon: History
		},
		{
			to: "/app/developers",
			label: t("app.nav.dev"),
			icon: CodeXml
		},
		{
			to: "/app/account",
			label: t("app.nav.account"),
			icon: Wallet
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmbientBackground, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-[1400px] flex min-h-screen",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden md:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-border bg-surface-0/40 backdrop-blur px-3 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/app",
							className: "flex items-center gap-2 px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm",
									children: "C"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display tracking-[-0.02em] text-lg",
								children: "Cortexia"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "mt-6 space-y-0.5",
							children: NAV.map((item) => {
								const active = item.exact ? path === item.to : path.startsWith(item.to);
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", active ? "bg-surface-2/70 text-foreground" : "text-muted-foreground hover:bg-surface-1/60 hover:text-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto rounded-xl border border-border bg-surface-1/60 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
									children: t("app.header.balance")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
									usd: CREDIT_USD,
									className: "mt-1 font-display text-2xl tracking-[-0.02em]",
									emphasize: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app/account",
									className: "mt-2 inline-flex items-center gap-1 text-xs text-amber-soft hover:underline",
									children: "Recharger →"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0 flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
						className: "sticky top-0 z-20 backdrop-blur-md bg-background/60 border-b border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 px-5 sm:px-8 h-14",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 text-amber" }), t("app.header.internal")]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setOpen(true),
										className: "hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition",
										"aria-label": t("app.header.help"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-3.5" }), t("app.header.help")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "hidden sm:flex items-center gap-2 rounded-full border border-border bg-surface-1/60 px-3 py-1.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: t("app.header.balance")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
											usd: CREDIT_USD,
											className: "text-xs",
											emphasize: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalePicker, {})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingOverlay, {
				open,
				onClose: () => setOpen(false)
			})
		]
	});
}
//#endregion
export { AppLayout as component };
