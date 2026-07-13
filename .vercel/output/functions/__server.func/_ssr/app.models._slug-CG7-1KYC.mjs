import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { n as PriceDisplay, r as cn } from "./price-display-CaZPZTYO.mjs";
import { C as Download, F as ArrowLeft, S as EllipsisVertical, a as Sparkles, c as RefreshCw, h as LoaderCircle, u as Play } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { i as unitLabel, n as basePrice, t as MODELS } from "./models-C7mRBOxQ.mjs";
import { t as Route } from "./app.models._slug-BM_jj9Mm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.models._slug-CG7-1KYC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TINTS = [
	"#3d2a1e",
	"#2a1e3d",
	"#1e3d2a",
	"#3d1e2a",
	"#2a3d1e",
	"#1e2a3d"
];
function ModelPlayground() {
	const { model } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelPlaygroundContent, { model });
}
function ModelPlaygroundContent({ model, isModal = false }) {
	const [currentModel, setCurrentModel] = (0, import_react.useState)(model);
	const [advanced, setAdvanced] = (0, import_react.useState)(false);
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const [state, setState] = (0, import_react.useState)(() => {
		const init = {};
		model.params.forEach((p) => {
			if (p.kind === "slider") init[p.key] = p.default;
			if (p.kind === "select") init[p.key] = p.options[0];
			if (p.kind === "toggle") init[p.key] = !!p.default;
		});
		return init;
	});
	(0, import_react.useEffect)(() => {
		setCurrentModel(model);
	}, [model]);
	(0, import_react.useEffect)(() => {
		setPrompt("");
		setStatus("idle");
		setResult(null);
		setHistory([]);
		setSelectedHistoryItem(null);
		setError(null);
		setProgress(0);
		const init = {};
		currentModel.params.forEach((p) => {
			if (p.kind === "slider") init[p.key] = p.default;
			if (p.kind === "select") init[p.key] = p.options[0];
			if (p.kind === "toggle") init[p.key] = !!p.default;
		});
		setState(init);
	}, [currentModel.slug]);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [selectedHistoryItem, setSelectedHistoryItem] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const timers = (0, import_react.useRef)([]);
	const currentPrice = (0, import_react.useMemo)(() => estimatePrice(currentModel, state), [currentModel, state]);
	const simple = currentModel.params.filter((p) => !("advanced" in p) || !p.advanced);
	const adv = currentModel.params.filter((p) => "advanced" in p && !!p.advanced);
	function clearTimers() {
		timers.current.forEach((t) => window.clearTimeout(t));
		timers.current = [];
	}
	function loadHistoryItem(item) {
		setPrompt(item.prompt);
		setState(item.state);
		setResult(item);
		setSelectedHistoryItem(item);
		setStatus("success");
		setError(null);
	}
	function regenerateItem(item) {
		setPrompt(item.prompt);
		setState(item.state);
		setCurrentModel(item.model);
		setTimeout(() => {
			generate();
		}, 80);
	}
	function loadReferenceItem(item) {
		setPrompt(item.prompt);
		setState(item.state);
		setCurrentModel(item.model);
	}
	function generate() {
		if (status === "loading") return;
		if (currentModel.params.some((p) => p.kind === "prompt") && prompt.trim().length < 3) {
			setStatus("error");
			setError("Ajoute un prompt d'au moins quelques mots pour lancer la génération.");
			return;
		}
		clearTimers();
		setStatus("loading");
		setError(null);
		setProgress(0);
		setSelectedHistoryItem(null);
		const duration = currentModel.category === "video" ? 4200 : currentModel.category === "audio" ? 2600 : currentModel.category === "text" ? 1800 : 2200;
		const steps = 40;
		for (let i = 1; i <= steps; i++) timers.current.push(window.setTimeout(() => {
			setProgress(Math.round(i / steps * 100));
		}, duration / steps * i));
		timers.current.push(window.setTimeout(() => {
			setStatus("success");
			const newResult = {
				id: Math.random().toString(36).substring(7),
				model: currentModel,
				prompt: prompt || "(sans prompt)",
				cost: currentPrice,
				tint: TINTS[Math.floor(Math.random() * TINTS.length)],
				ratio: state.ratio === "9:16" ? "aspect-[9/16]" : state.ratio === "16:9" ? "aspect-video" : state.ratio === "3:4" ? "aspect-[3/4]" : state.ratio === "4:3" ? "aspect-[4/3]" : "aspect-square",
				state: { ...state },
				timestamp: /* @__PURE__ */ new Date()
			};
			setResult(newResult);
			setSelectedHistoryItem(newResult);
			setHistory((prev) => [newResult, ...prev]);
		}, duration + 60));
	}
	(0, import_react.useEffect)(() => () => clearTimers(), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mx-auto", isModal ? "p-0" : "max-w-6xl px-5 sm:px-8 py-6 lg:h-[calc(100vh-3.5rem)] lg:flex lg:flex-col lg:overflow-hidden"),
		children: [
			!isModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/app/models",
					className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Catalogue"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
								children: [
									currentModel.provider,
									" · ",
									currentModel.category
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 font-display text-3xl sm:text-4xl tracking-[-0.03em] truncate text-amber-soft",
								children: currentModel.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted-foreground max-w-xl text-xs truncate",
								children: currentModel.blurb
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
							usd: currentPrice,
							className: "font-display text-2xl sm:text-3xl tracking-[-0.02em]",
							emphasize: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground font-mono",
							children: unitLabel(currentModel)
						})]
					})]
				})]
			}),
			isModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between shrink-0 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: [
								currentModel.provider,
								" · ",
								currentModel.category
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-3xl sm:text-4xl tracking-[-0.03em] truncate text-amber-soft",
							children: currentModel.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-muted-foreground max-w-xl text-xs truncate",
							children: currentModel.blurb
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
						usd: currentPrice,
						className: "font-display text-2xl sm:text-3xl tracking-[-0.02em]",
						emphasize: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground font-mono",
						children: unitLabel(currentModel)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("mt-6 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]", isModal ? "lg:h-[60vh] lg:overflow-hidden" : "lg:flex-1 lg:min-h-0 lg:overflow-hidden pb-4"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-gradient-border rounded-2xl bg-surface-1/60 p-6 lg:h-full lg:flex lg:flex-col lg:overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-4 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
								children: "Paramètres"
							}), adv.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 rounded-full border border-border bg-surface-2/60 p-0.5 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setAdvanced(false),
									className: "rounded-full px-3 py-1 transition cursor-pointer " + (!advanced ? "bg-amber text-primary-foreground" : "text-muted-foreground"),
									children: "Simple"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setAdvanced(true),
									className: "rounded-full px-3 py-1 transition cursor-pointer " + (advanced ? "bg-amber text-primary-foreground" : "text-muted-foreground"),
									children: "Avancé"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5 flex-1 lg:overflow-y-auto pr-1",
							children: [simple.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								p,
								state,
								setState,
								prompt,
								setPrompt,
								currentModel,
								setCurrentModel
							}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: false,
								animate: {
									height: advanced ? "auto" : 0,
									opacity: advanced ? 1 : 0
								},
								transition: { duration: .3 },
								className: "overflow-hidden space-y-5",
								children: adv.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									p,
									state,
									setState,
									prompt,
									setPrompt,
									currentModel,
									setCurrentModel
								}, i))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: generate,
							disabled: status === "loading",
							className: "mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shrink-0",
							children: status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
								" Génération… ",
								progress,
								"%"
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }),
								" Générer —",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
									usd: currentPrice,
									className: "text-sm"
								})
							] })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:h-full lg:overflow-y-auto pr-1 space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultPanel, {
						status,
						progress,
						error,
						result,
						model,
						onRetry: generate,
						onReset: () => {
							setStatus("idle");
							setResult(null);
							setError(null);
						},
						history,
						onSelectHistory: loadHistoryItem,
						onRegenerateItem: regenerateItem,
						onSetPrompt: setPrompt,
						onLoadReference: loadReferenceItem,
						selectedHistoryItem,
						setSelectedHistoryItem
					})
				})]
			})
		]
	});
}
function ResultPanel({ status, progress, error, result, model, onRetry, onReset, history, onSelectHistory, onRegenerateItem, onSetPrompt, onLoadReference, selectedHistoryItem, setSelectedHistoryItem }) {
	const [activeMenuId, setActiveMenuId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const handleOutsideClick = () => setActiveMenuId(null);
		window.addEventListener("click", handleOutsideClick);
		return () => window.removeEventListener("click", handleOutsideClick);
	}, []);
	const isFocusedView = selectedHistoryItem !== null && status !== "loading";
	if (status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden relative grid place-items-center aspect-square",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,oklch(0.78_0.16_70_/_0.18)_50%,transparent_80%)] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center text-center px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 mx-auto text-amber animate-spin" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
						children: model.category === "video" ? "Rendu vidéo" : model.category === "audio" ? "Synthèse vocale" : model.category === "text" ? "Rédaction" : "Rendu image"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 text-sm text-foreground/80",
						children: [progress, "%"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 mx-auto w-40 h-1 rounded-full bg-surface-3 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-amber transition-[width] duration-150",
							style: { width: `${progress}%` }
						})
					})
				] })
			})]
		})
	});
	if (isFocusedView) {
		const item = selectedHistoryItem;
		const ratioClass = item.ratio ?? "aspect-square";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setSelectedHistoryItem(null),
						className: "inline-flex items-center gap-1.5 text-xs text-amber-soft hover:underline cursor-pointer",
						children: "← Retour aux générations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] font-mono text-muted-foreground",
						children: ["Modèle utilisé : ", item.model.name]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden relative grid place-items-center " + ratioClass,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							scale: .98
						},
						animate: {
							opacity: 1,
							scale: 1
						},
						className: "absolute inset-0",
						style: { background: `linear-gradient(135deg, ${item.tint}, oklch(0.14 0 0))` },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute bottom-3 left-3 right-3 flex items-end justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-full bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-mono uppercase tracking-wider",
								children: item.model.category
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-full bg-black/60 backdrop-blur px-2 py-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
									usd: item.cost,
									className: "text-[10px]"
								})
							})]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-gradient-border rounded-2xl bg-surface-1/60 p-4 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground",
						children: "Prompt"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-sm text-foreground/90",
						children: item.prompt
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							onRegenerateItem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => onRegenerateItem(item),
								className: "flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/40 px-3 py-2 text-xs hover:border-amber/40 transition cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Régénérer"]
							}),
							onSetPrompt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									onSetPrompt(item.prompt);
								},
								className: "flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber/30 bg-amber/5 px-3 py-2 text-xs hover:bg-amber/10 transition text-amber-soft cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), " Prendre comme réf"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-95 transition cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Télécharger"]
							})
						]
					})]
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
				children: [
					"Grille de session (",
					history.length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onReset,
				className: "text-xs text-amber-soft hover:underline cursor-pointer",
				children: "+ Nouvelle génération"
			})]
		}), history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 sm:grid-cols-3 gap-3",
			children: history.map((item) => {
				const isMenuOpen = activeMenuId === item.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-square rounded-xl border border-border overflow-hidden group hover:border-amber/40 transition duration-200",
					style: { background: `linear-gradient(135deg, ${item.tint}, oklch(0.14 0 0))` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => onSelectHistory(item),
						className: "absolute inset-0 w-full h-full text-left cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-mono text-white bg-black/70 px-2 py-1 rounded shadow",
								children: "Ouvrir"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute bottom-2 left-2 right-2 text-[9px] font-mono text-white/90 bg-black/60 backdrop-blur px-1.5 py-1 rounded truncate",
							children: item.prompt
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-1.5 right-1.5 z-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: (e) => {
								e.stopPropagation();
								setActiveMenuId(isMenuOpen ? null : item.id);
							},
							className: "p-1 rounded-lg bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								scale: .95,
								y: -5
							},
							animate: {
								opacity: 1,
								scale: 1,
								y: 0
							},
							exit: {
								opacity: 0,
								scale: .95,
								y: -5
							},
							className: "absolute right-0 mt-1 w-32 rounded-lg bg-surface-2 border border-border shadow-xl p-1 text-xs text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										onSelectHistory(item);
										setActiveMenuId(null);
									},
									className: "w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer",
									children: "Ouvrir"
								}),
								onRegenerateItem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										onRegenerateItem(item);
										setActiveMenuId(null);
									},
									className: "w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer text-amber-soft",
									children: "Régénérer"
								}),
								onLoadReference && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										onLoadReference(item);
										setActiveMenuId(null);
									},
									className: "w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer text-amber-soft",
									children: "Prendre comme réf"
								}),
								onSetPrompt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										onSetPrompt(item.prompt);
										setActiveMenuId(null);
									},
									className: "w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer",
									children: "Utiliser Prompt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										alert("Simulé : téléchargement lancé.");
										setActiveMenuId(null);
									},
									className: "w-full text-left px-2 py-1 hover:bg-surface-3 rounded transition cursor-pointer",
									children: "Télécharger"
								})
							]
						}) })]
					})]
				}, item.id);
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden relative grid place-items-center aspect-square",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 mx-auto text-amber" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: "Zone de résultat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-sm text-foreground/70",
							children: "Ton rendu apparaîtra ici après génération."
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3",
				children: "Exemples"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					"#3d2a1e",
					"#1e2a3d",
					"#2a3d1e"
				].map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aspect-square rounded-lg border border-border",
					style: { background: `linear-gradient(135deg, ${c}, transparent)` }
				}, i))
			})] })]
		})]
	});
}
function Field({ p, state, setState, prompt, setPrompt, currentModel, setCurrentModel }) {
	if (p.kind === "prompt") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: p.label
			}), setCurrentModel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] text-muted-foreground font-mono",
					children: "Modèle:"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: currentModel?.slug,
					onChange: (e) => {
						const found = MODELS.find((m) => m.slug === e.target.value);
						if (found) setCurrentModel(found);
					},
					className: "bg-surface-3 border border-border text-[11px] rounded px-1.5 py-0.5 outline-none focus:border-amber text-foreground cursor-pointer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
							label: "Images",
							children: MODELS.filter((m) => m.category === "image").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.slug,
								children: m.name
							}, m.slug))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
							label: "Vidéos",
							children: MODELS.filter((m) => m.category === "video").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.slug,
								children: m.name
							}, m.slug))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
							label: "Audios",
							children: MODELS.filter((m) => m.category === "audio").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.slug,
								children: m.name
							}, m.slug))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
							label: "LLM / Texte",
							children: MODELS.filter((m) => m.category === "text").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.slug,
								children: m.name
							}, m.slug))
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			rows: 3,
			value: prompt,
			onChange: (e) => setPrompt(e.target.value),
			placeholder: p.placeholder,
			className: "w-full rounded-xl border border-border bg-surface-0/60 px-4 py-3 text-sm outline-none focus:border-amber/50 resize-none"
		})]
	});
	if (p.kind === "upload") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground mb-1.5",
			children: p.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-dashed border-border bg-surface-0/40 px-4 py-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-amber/40",
			children: "Glisse un fichier ou clique pour choisir"
		})]
	});
	if (p.kind === "select") {
		const val = state[p.key];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground mb-1.5",
			children: p.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-1.5",
			children: p.options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setState((s) => ({
					...s,
					[p.key]: o
				})),
				className: "rounded-full border px-3 py-1 text-xs transition cursor-pointer " + (val === o ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border text-muted-foreground hover:text-foreground"),
				children: o
			}, o))
		})] });
	}
	if (p.kind === "slider") {
		const val = state[p.key];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between mb-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: p.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono tabular text-xs",
				children: [val, p.suffix || ""]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: p.min,
			max: p.max,
			step: p.step,
			value: val,
			onChange: (e) => setState((s) => ({
				...s,
				[p.key]: parseFloat(e.target.value)
			})),
			className: "w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3 cursor-pointer"
		})] });
	}
	if (p.kind === "seed") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground mb-1.5",
			children: p.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			placeholder: "aléatoire",
			className: "w-full rounded-xl border border-border bg-surface-0/60 px-4 py-2 text-sm font-mono outline-none focus:border-amber/50"
		})]
	});
	if (p.kind === "toggle") {
		const val = !!state[p.key];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex items-center justify-between gap-4 cursor-pointer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm",
				children: p.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setState((s) => ({
					...s,
					[p.key]: !val
				})),
				className: "relative h-5 w-9 rounded-full transition cursor-pointer " + (val ? "bg-amber" : "bg-surface-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-0.5 size-4 rounded-full bg-background transition-transform " + (val ? "translate-x-4" : "translate-x-0.5") })
			})]
		});
	}
	return null;
}
function estimatePrice(m, state) {
	let unit = basePrice(m);
	if (m.tiers) {
		const res = state.resolution;
		const found = m.tiers.find((t) => t.label === res);
		if (found) unit = found.priceUSD;
	}
	if (m.unit === "second") {
		const d = state.duration || 5;
		return unit * d;
	}
	return unit;
}
//#endregion
export { ModelPlaygroundContent, ModelPlayground as component };
