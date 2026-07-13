import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { i as formatMoney, n as PriceDisplay, o as useCurrency, r as cn } from "./price-display-CaZPZTYO.mjs";
import { i as useT } from "./i18n-BEBY8TOx.mjs";
import { P as ArrowRight, a as Sparkles, f as Music2, i as TriangleAlert, m as MessageSquare, p as Mic, t as X, u as Play, v as Image, x as Film } from "../_libs/lucide-react.mjs";
import { t as LocalePicker } from "./locale-picker-0H6kIonM.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { i as unitLabel, n as basePrice, t as MODELS } from "./models-C7mRBOxQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/models-wall-DjYYCNDC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getTime(target) {
	const diff = Math.max(0, target.getTime() - Date.now());
	return {
		days: Math.floor(diff / 864e5),
		hours: Math.floor(diff % 864e5 / 36e5),
		minutes: Math.floor(diff % 36e5 / 6e4),
		seconds: Math.floor(diff % 6e4 / 1e3)
	};
}
/**
* SSR-safe: server renders "--", client fills in after mount → no hydration mismatch.
*/
function EditorialCountdown({ target }) {
	const [t, setT] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setT(getTime(target));
		const id = setInterval(() => setT(getTime(target)), 1e3);
		return () => clearInterval(id);
	}, [target]);
	const cells = [
		{
			label: "jours",
			value: t?.days ?? null
		},
		{
			label: "heures",
			value: t?.hours ?? null
		},
		{
			label: "minutes",
			value: t?.minutes ?? null
		},
		{
			label: "secondes",
			value: t?.seconds ?? null
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-amber pulse-soft" }), "Lancement — 1er août"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-4 gap-2 sm:gap-4",
			children: cells.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.04em] tabular text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlipDigit, { value: c.value })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground",
					children: c.label
				})]
			}, c.label))
		})]
	});
}
function FlipDigit({ value }) {
	const shown = value == null ? "--" : String(value).padStart(2, "0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
			mode: "popLayout",
			initial: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				initial: value == null ? false : {
					y: "40%",
					opacity: 0
				},
				animate: {
					y: 0,
					opacity: 1
				},
				exit: {
					y: "-40%",
					opacity: 0
				},
				transition: {
					duration: .35,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				className: "inline-block",
				children: shown
			}, shown)
		})
	});
}
/** Compact countdown for header badges. Same SSR safety. */
function CountdownCompact({ target }) {
	const [t, setT] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setT(getTime(target));
		const id = setInterval(() => setT(getTime(target)), 6e4);
		return () => clearInterval(id);
	}, [target]);
	if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono tabular text-[10px]",
		children: "J-—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "font-mono tabular text-[10px]",
		children: ["J-", t.days]
	});
}
var LAUNCH_DATE = (() => {
	const now = /* @__PURE__ */ new Date();
	const y = now.getUTCMonth() < 7 || now.getUTCMonth() === 7 && now.getUTCDate() < 1 ? now.getUTCFullYear() : now.getUTCFullYear() + 1;
	return new Date(Date.UTC(y, 7, 1, 0, 0, 0));
})();
var isWaitlist = () => true;
function SiteHeader({ variant = "landing" }) {
	const t = useT();
	const waitlist = variant === "landing" && isWaitlist();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 backdrop-blur-md bg-background/60 border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-5 sm:px-8 h-14 flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 group shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.78_0.16_70_/_0.6)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-sm font-semibold leading-none",
								children: "C"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg tracking-[-0.02em]",
							children: "Cortexia"
						})]
					}),
					waitlist && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden sm:inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-amber-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-amber pulse-soft" }),
							t("badge.prelaunch"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-amber-soft/70",
								children: "·"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownCompact, { target: LAUNCH_DATE })
						]
					}),
					variant === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-emerald",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-emerald pulse-soft" }), "Live"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [variant === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/app",
					className: "hidden sm:inline text-xs text-muted-foreground hover:text-foreground transition",
					children: t("nav.open_app")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalePicker, {})]
			})]
		})
	});
}
var CATEGORIES = [
	{
		key: "image",
		label: "Images",
		icon: Image,
		unit: "images",
		unitPriceUSD: .05,
		suffix: "images / mois",
		max: 1e3,
		step: 5,
		helper: "Seedream Pro 1K en moyenne.",
		refPlan: {
			name: "Midjourney Standard",
			usd: 30
		}
	},
	{
		key: "video",
		label: "Vidéo",
		icon: Film,
		unit: "secondes",
		unitPriceUSD: .12,
		suffix: "secondes / mois",
		max: 1200,
		step: 5,
		helper: "Kling 3 Turbo 1080p.",
		refPlan: {
			name: "Higgsfield Pro",
			usd: 39
		}
	},
	{
		key: "voice",
		label: "Voix",
		icon: Mic,
		unit: "1000 caractères",
		unitPriceUSD: .088,
		suffix: "×1 000 car. / mois",
		max: 400,
		step: 2,
		helper: "ElevenLabs V3.",
		refPlan: {
			name: "ElevenLabs Starter",
			usd: 22
		}
	},
	{
		key: "text",
		label: "Texte",
		icon: MessageSquare,
		unit: "M tokens",
		unitPriceUSD: 5.4,
		suffix: "M tokens / mois",
		max: 40,
		step: .5,
		helper: "Claude Sonnet 5 en sortie.",
		refPlan: {
			name: "Claude Pro",
			usd: 20
		}
	}
];
var DEFAULT_VALUES = {
	image: 40,
	video: 25,
	voice: 6,
	text: .8
};
function CreditSimulator({ compact }) {
	const t = useT();
	const [values, setValues] = (0, import_react.useState)(DEFAULT_VALUES);
	const c = useCurrency();
	const total = (0, import_react.useMemo)(() => CATEGORIES.reduce((sum, cat) => sum + values[cat.key] * cat.unitPriceUSD, 0), [values]);
	const referenceMonthly = (0, import_react.useMemo)(() => CATEGORIES.reduce((sum, cat) => sum + cat.refPlan.usd, 0), []);
	const diff = referenceMonthly - total;
	const state = diff > referenceMonthly * .2 ? "save" : diff >= 0 ? "near" : "over";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("surface-gradient-border rounded-3xl bg-surface-1/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]", compact ? "" : "grid gap-8 md:grid-cols-[1.15fr,1fr]"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 flex items-center justify-between",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
				children: t("sim.eyebrow_card")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-1 font-display text-2xl tracking-[-0.02em]",
				children: t("sim.compose")
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children: CATEGORIES.map((cat) => {
				const val = values[cat.key];
				const sub = val * cat.unitPriceUSD;
				const breakEven = cat.refPlan.usd / cat.unitPriceUSD;
				const breakEvenPct = Math.min(100, breakEven / cat.max * 100);
				const Icon = cat.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2.5 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid place-items-center size-7 rounded-lg bg-surface-2 border border-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-amber-soft" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: cat.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground text-xs hidden sm:inline",
									children: cat.helper
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono tabular text-sm text-foreground/90",
								children: [cat.step < 1 ? val.toFixed(1) : Math.round(val), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground ml-1 text-[11px]",
									children: cat.suffix
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono tabular text-[11px] text-muted-foreground",
								children: formatMoney(sub, c)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: cat.max,
							step: cat.step,
							value: val,
							onChange: (e) => setValues((v) => ({
								...v,
								[cat.key]: parseFloat(e.target.value)
							})),
							className: "w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3 cursor-pointer",
							"aria-label": cat.label
						}), breakEvenPct < 98 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-px bg-amber-soft/80",
							style: { left: `calc(${breakEvenPct}% - 0.5px)` },
							title: t("sim.threshold_marker")
						})]
					}),
					val > breakEven && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 flex items-center gap-1 font-mono text-[10px] text-amber-soft/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }), t("sim.threshold_marker")]
					})
				] }, cat.key);
			})
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex flex-col justify-between gap-6", compact && "mt-8"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-surface-0/60 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
						children: t("sim.your_month")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex items-baseline gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
							usd: total,
							className: "font-display text-[clamp(2.5rem,6vw,4rem)] tracking-[-0.03em] leading-none",
							emphasize: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-sm text-muted-foreground",
						children: t("sim.charged")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 pt-6 border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
								children: t("sim.classic")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-baseline gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-mono tabular text-2xl", state === "over" ? "text-foreground" : "text-muted-foreground line-through"),
									children: formatMoney(referenceMonthly, c)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "/ mois — même sans rien générer"
								})]
							}),
							state === "save" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 text-sm text-foreground/85 leading-relaxed",
								children: [
									t("sim.you_save"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-amber font-medium tabular font-mono",
										children: formatMoney(diff, c)
									}),
									" ",
									t("sim.this_month")
								]
							}),
							state === "near" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 text-sm text-foreground/85 leading-relaxed inline-flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-amber-soft mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("sim.close_note") })]
							}),
							state === "over" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm text-foreground/85 leading-relaxed",
								children: t("sim.threshold_note")
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] font-mono text-muted-foreground/80",
				children: [
					"Basé sur un panier de référence : ",
					CATEGORIES.map((cat) => cat.refPlan.name).join(" · "),
					"."
				]
			})]
		})]
	});
}
/** Infinite horizontal marquee, pauses on hover. */
function Marquee({ children, className, speed = 45 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative overflow-hidden", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-max marquee-track group-hover:[animation-play-state:paused]",
				style: { animationDuration: `${speed}s` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 gap-3 pr-3",
					children
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 gap-3 pr-3",
					"aria-hidden": true,
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" })
		]
	});
}
function ModelPill({ m }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex items-center gap-3 rounded-2xl border border-border bg-surface-1/60 backdrop-blur px-4 py-3 min-w-[240px] hover:border-amber/40 transition-colors",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center size-9 rounded-xl bg-surface-2 border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-sm tracking-tight",
					children: m.name.slice(0, 1)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium truncate",
					children: m.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] text-muted-foreground font-mono uppercase tracking-wider",
					children: m.category
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
					usd: basePrice(m),
					className: "text-xs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] text-muted-foreground",
					children: unitLabel(m)
				})]
			})
		]
	});
}
function ModelsMarquee() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marquee, {
		speed: 60,
		children: MODELS.slice(0, 20).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelPill, { m }, m.slug))
	});
}
var img = (seed, w = 900, h = 1200) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
var WALL_ITEMS = [
	{
		id: "w1",
		kind: "image",
		useCase: "ad",
		model: "Seedream 5.0 Pro",
		modelSlug: "seedream-5-pro",
		prompt: "Flacon de parfum ambré sur marbre travertin, lumière rasante d'aube, contre-jour doux, éditorial mode.",
		image: img("perfume-amber", 900, 1300),
		span: "lg"
	},
	{
		id: "w2",
		kind: "video",
		useCase: "ugc",
		model: "Kling 3.0 Pro",
		modelSlug: "kling-3-pro",
		prompt: "Créatrice UGC déballe une paire de sneakers en unboxing, plan serré, lumière naturelle, ambiance matinale.",
		image: img("sneakers-ugc", 900, 900),
		video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
		span: "md"
	},
	{
		id: "w3",
		kind: "image",
		useCase: "film",
		model: "GPT Image 2",
		modelSlug: "gpt-image-2",
		prompt: "Portrait cinématographique d'une comédienne en costume 1940, cheveux au vent, tempête à l'horizon.",
		image: img("actress-film", 900, 1400),
		span: "lg"
	},
	{
		id: "w4",
		kind: "music",
		useCase: "show",
		model: "Cortexia Score v1",
		modelSlug: "eleven-v3",
		prompt: "Générique de talk-show africain, kora + synths chauds, 90 BPM, mood optimiste.",
		image: img("music-cover-a", 900, 900),
		audio: {
			title: "Générique — Studio Lomé",
			duration: "0:42"
		},
		span: "sm"
	},
	{
		id: "w5",
		kind: "image",
		useCase: "ad",
		model: "Nano Banana 2",
		modelSlug: "nano-banana-2",
		prompt: "Boîte de céréales bio flottant dans un ciel pastel, style pub magazine 2000s.",
		image: img("cereal-ad", 900, 1100),
		span: "md"
	},
	{
		id: "w6",
		kind: "video",
		useCase: "ad",
		model: "Seedance 2.0 Fast",
		modelSlug: "seedance-2-fast",
		prompt: "Voiture électrique traverse une ville de nuit sous la pluie, reflets néons, plan travelling.",
		image: img("car-neon", 900, 1100),
		video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
		span: "md"
	},
	{
		id: "w7",
		kind: "voice",
		useCase: "film",
		model: "ElevenLabs V3",
		modelSlug: "eleven-v3",
		prompt: "Voix off française, grave et calme, teaser d'une mini-série policière.",
		image: img("voice-noir", 900, 900),
		audio: {
			title: "Teaser — Voix off FR",
			duration: "0:18"
		},
		span: "sm"
	},
	{
		id: "w8",
		kind: "image",
		useCase: "ugc",
		model: "Seedream 5.0 Pro",
		modelSlug: "seedream-5-pro",
		prompt: "Assiette de pâtisserie fine posée sur nappe lin blanc, plan zénithal, lumière du matin.",
		image: img("pastry-ugc", 900, 900),
		span: "sm"
	},
	{
		id: "w9",
		kind: "image",
		useCase: "show",
		model: "Wan 2.7 Image Pro",
		modelSlug: "wan-27-image-pro",
		prompt: "Décor de plateau TV cuisine ouverte, tons chauds bois et cuivre, projecteurs allumés.",
		image: img("tv-kitchen", 900, 1200),
		span: "md"
	},
	{
		id: "w10",
		kind: "video",
		useCase: "film",
		model: "Kling 3.0 4K",
		modelSlug: "kling-3-4k",
		prompt: "Plan aérien d'un désert au coucher du soleil, dunes ondulantes, mouvement de caméra lent.",
		image: img("desert-drone", 900, 1300),
		video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
		span: "lg"
	},
	{
		id: "w11",
		kind: "image",
		useCase: "ad",
		model: "Qwen Image 2.0",
		modelSlug: "qwen-image-2",
		prompt: "Bouteille de kombucha rose sur fond bleu ciel, ombres nettes, style pub minimaliste.",
		image: img("kombucha-ad", 900, 900),
		span: "sm"
	},
	{
		id: "w12",
		kind: "music",
		useCase: "ugc",
		model: "Cortexia Score v1",
		modelSlug: "eleven-v3",
		prompt: "Musique lo-fi pour reel Instagram beauté, guitare feutrée, batterie douce.",
		image: img("music-lofi", 900, 900),
		audio: {
			title: "Reel beauté — Lo-fi",
			duration: "0:15"
		},
		span: "sm"
	},
	{
		id: "w13",
		kind: "image",
		useCase: "film",
		model: "Nano Banana 2",
		modelSlug: "nano-banana-2",
		prompt: "Enfant lit un livre sur un toit de Jakarta au crépuscule, silhouette contre-jour orange.",
		image: img("kid-jakarta", 900, 1200),
		span: "md"
	},
	{
		id: "w14",
		kind: "video",
		useCase: "show",
		model: "Kling 3.0 Motion",
		modelSlug: "kling-3-motion",
		prompt: "Chef découpe un ananas dans un studio cuisine, plan macro, mouvement de dolly lent.",
		image: img("chef-macro", 900, 900),
		video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
		span: "md"
	},
	{
		id: "w15",
		kind: "image",
		useCase: "ad",
		model: "Seedream 5.0 Pro",
		modelSlug: "seedream-5-pro",
		prompt: "Basket haute rouge suspendue par un fil, fond papier crème, lumière studio.",
		image: img("shoe-red", 900, 1100),
		span: "md"
	},
	{
		id: "w16",
		kind: "voice",
		useCase: "ad",
		model: "ElevenLabs V3",
		modelSlug: "eleven-v3",
		prompt: "Voix off portugaise énergique pour spot radio, ton chaleureux et rythmé.",
		image: img("voice-pt", 900, 900),
		audio: {
			title: "Spot radio — PT-BR",
			duration: "0:22"
		},
		span: "sm"
	},
	{
		id: "w17",
		kind: "image",
		useCase: "ugc",
		model: "GPT Image 2",
		modelSlug: "gpt-image-2",
		prompt: "Écran d'iPhone posé sur un carnet, message d'inscription à une newsletter mode.",
		image: img("mockup-phone", 900, 1200),
		span: "md"
	},
	{
		id: "w18",
		kind: "video",
		useCase: "ugc",
		model: "Seedance 2.0 Mini",
		modelSlug: "seedance-2-mini",
		prompt: "Yoga au bord d'une piscine à Bali, salutation au soleil, plan large, lumière chaude.",
		image: img("yoga-bali", 900, 1100),
		video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
		span: "md"
	},
	{
		id: "w19",
		kind: "image",
		useCase: "film",
		model: "Wan 2.7 Image Pro",
		modelSlug: "wan-27-image-pro",
		prompt: "Ruelle pavée de Lisbonne la nuit, lampadaires jaunes, silhouette solitaire au fond.",
		image: img("lisbon-night", 900, 1300),
		span: "lg"
	},
	{
		id: "w20",
		kind: "music",
		useCase: "film",
		model: "Cortexia Score v1",
		modelSlug: "eleven-v3",
		prompt: "Nappe orchestrale sombre pour scène de suspense, cordes graves et pulsation lente.",
		image: img("music-dark", 900, 900),
		audio: {
			title: "Suspense — Cordes",
			duration: "1:04"
		},
		span: "sm"
	},
	{
		id: "w21",
		kind: "image",
		useCase: "ad",
		model: "Seedream 5.0 Lite",
		modelSlug: "seedream-5-lite",
		prompt: "Sac en cuir camel posé sur banc de bois, ambiance café parisien.",
		image: img("bag-camel", 900, 900),
		span: "sm"
	},
	{
		id: "w22",
		kind: "image",
		useCase: "show",
		model: "Nano Banana 2",
		modelSlug: "nano-banana-2",
		prompt: "Titre d'émission « Nuits de Dakar » en typographie art déco dorée sur fond noir.",
		image: img("show-title", 900, 900),
		span: "md"
	},
	{
		id: "w23",
		kind: "video",
		useCase: "ad",
		model: "Kling 3.0 Turbo",
		modelSlug: "kling-3-turbo",
		prompt: "Café qui coule d'une machine expresso au ralenti, gouttes en macro, vapeur.",
		image: img("coffee-macro", 900, 1e3),
		video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
		span: "md"
	},
	{
		id: "w24",
		kind: "image",
		useCase: "ugc",
		model: "Qwen Image 2.0",
		modelSlug: "qwen-image-2",
		prompt: "Plante monstera dans un intérieur chaleureux, lumière du soir dorée.",
		image: img("plant-warm", 900, 1200),
		span: "md"
	}
];
var KIND_META = {
	image: {
		icon: Image,
		labelKey: "wall.filters.image"
	},
	video: {
		icon: Play,
		labelKey: "wall.filters.video"
	},
	music: {
		icon: Music2,
		labelKey: "wall.filters.music"
	},
	voice: {
		icon: Mic,
		labelKey: "wall.filters.voice"
	}
};
var USE_CASES = [
	"ad",
	"ugc",
	"show",
	"film"
];
function ModelsWall() {
	const t = useT();
	const [kind, setKind] = (0, import_react.useState)("all");
	const [useCase, setUseCase] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [active, setActive] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		return WALL_ITEMS.filter((w) => (kind === "all" || w.kind === kind) && (useCase === "all" || w.useCase === useCase));
	}, [kind, useCase]);
	const BATCH = 12;
	const visible = (0, import_react.useMemo)(() => {
		const total = page * BATCH;
		const out = [];
		for (let i = 0; i < total; i++) {
			const source = filtered[i % filtered.length];
			if (!source) break;
			out.push({
				...source,
				id: `${source.id}-${i}`
			});
		}
		return out;
	}, [filtered, page]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
					active: kind === "all",
					onClick: () => setKind("all"),
					label: t("wall.filters.all")
				}),
				Object.keys(KIND_META).map((k) => {
					const Icon = KIND_META[k].icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
						active: kind === k,
						onClick: () => setKind(k),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }),
						label: t(KIND_META[k].labelKey)
					}, k);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-2 h-4 w-px bg-border hidden sm:block" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
					size: "sm",
					active: useCase === "all",
					onClick: () => setUseCase("all"),
					label: t("wall.usecase.all")
				}),
				USE_CASES.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
					size: "sm",
					active: useCase === u,
					onClick: () => setUseCase(u),
					label: t(`wall.usecase.${u}`)
				}, u))
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]",
			children: visible.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallCard, {
				item,
				index: i,
				onOpen: () => setActive(item)
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setPage((p) => p + 1),
				className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 px-5 py-2.5 text-sm hover:border-amber/40 transition",
				children: [t("wall.load_more"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallModal, {
			item: active,
			onClose: () => setActive(null)
		})
	] });
}
function FilterPill({ active, onClick, label, icon, size = "md" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: cn("inline-flex items-center gap-1.5 rounded-full border font-medium transition-all", size === "sm" ? "px-3 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs", active ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border bg-surface-2/50 text-muted-foreground hover:border-border-strong hover:text-foreground/90"),
		children: [icon, label]
	});
}
function WallCard({ item, index, onOpen }) {
	const [hover, setHover] = (0, import_react.useState)(false);
	const heights = {
		sm: "h-56 sm:h-60",
		md: "h-72 sm:h-80",
		lg: "h-96 sm:h-[26rem]"
	};
	const KindIcon = KIND_META[item.kind].icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
		initial: {
			opacity: 0,
			y: 20
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-40px"
		},
		transition: {
			duration: .5,
			delay: Math.min(.5, index % 12 * .04),
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		onMouseEnter: () => setHover(true),
		onMouseLeave: () => setHover(false),
		onClick: onOpen,
		className: cn("group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface-1/40 text-left relative", heights[item.span ?? "md"]),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: item.image,
				alt: "",
				loading: "lazy",
				className: "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
			}),
			item.kind === "video" && item.video && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: hover ? item.video : void 0,
				muted: true,
				loop: true,
				playsInline: true,
				autoPlay: hover,
				className: cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-300", hover ? "opacity-100" : "opacity-0")
			}),
			(item.kind === "music" || item.kind === "voice") && item.audio && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-3 bottom-3 rounded-xl bg-black/50 backdrop-blur px-3 py-2.5 border border-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waveform, { playing: hover }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto tabular",
						children: item.audio.duration
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-xs text-white truncate",
					children: item.audio.title
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/90 border border-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindIcon, { className: "size-3" }), item.kind]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-3 left-3 right-3 pointer-events-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-[0.2em] text-white/70",
					children: item.model
				})
			})
		]
	});
}
function Waveform({ playing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-end gap-[2px] h-3",
		children: [[
			.4,
			.7,
			1,
			.6,
			.9,
			.5,
			.8
		].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-[2px] bg-amber-soft rounded-full origin-bottom",
			style: {
				height: `${h * 100}%`,
				animation: playing ? `wave 900ms ease-in-out ${i * 90}ms infinite` : void 0
			}
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes wave { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }` })]
	});
}
function WallModal({ item, onClose }) {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: item && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: 12,
				scale: .98
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: 8,
				scale: .98
			},
			transition: {
				duration: .35,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			onClick: (e) => e.stopPropagation(),
			className: "relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-3xl border border-border bg-surface-1 shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "absolute top-3 right-3 z-10 grid place-items-center size-9 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition",
					"aria-label": "Fermer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative bg-black",
					children: item.kind === "video" && item.video ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						src: item.video,
						controls: true,
						autoPlay: true,
						loop: true,
						className: "w-full max-h-[60vh] object-contain bg-black"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: item.image,
						alt: "",
						className: "w-full max-h-[60vh] object-contain bg-black"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft",
							children: [
								t("wall.modal.model"),
								" · ",
								item.model
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: t("wall.modal.prompt")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-foreground/90 leading-relaxed",
							children: [
								"« ",
								item.prompt,
								" »"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/app/models/$slug",
								params: { slug: item.modelSlug },
								className: "inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
								children: [t("wall.modal.cta"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						})
					]
				})
			]
		})
	}) });
}
/** Condensed teaser used above the fold on landings. */
function WallPreview() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3",
			children: WALL_ITEMS.slice(0, 6).map((item, i) => {
				const KindIcon = KIND_META[item.kind].icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .6,
						delay: .05 * i
					},
					className: cn("relative overflow-hidden rounded-xl border border-border aspect-[3/4]", i === 1 && "sm:row-span-2 sm:aspect-auto", i === 4 && "sm:row-span-2 sm:aspect-auto"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.image,
							alt: "",
							className: "absolute inset-0 h-full w-full object-cover",
							loading: "lazy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-1.5 left-1.5 grid place-items-center size-5 rounded-full bg-black/60 backdrop-blur border border-white/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindIcon, { className: "size-2.5 text-white" })
						})
					]
				}, item.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" })]
	});
}
//#endregion
export { ModelsWall as a, ModelsMarquee as i, EditorialCountdown as n, SiteHeader as o, LAUNCH_DATE as r, WallPreview as s, CreditSimulator as t };
