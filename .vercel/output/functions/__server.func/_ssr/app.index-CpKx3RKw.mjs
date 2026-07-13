import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { n as PriceDisplay, r as cn } from "./price-display-CaZPZTYO.mjs";
import { i as useT } from "./i18n-BEBY8TOx.mjs";
import { C as Download, N as ArrowUp, a as Sparkles, c as RefreshCw, d as Paperclip, m as MessageSquare, p as Mic, t as X, v as Image, x as Film } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { n as basePrice, r as getModel } from "./models-C7mRBOxQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.index-CpKx3RKw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PLACEHOLDERS = [
	"Une pub 15s pour une marque de sneakers, plan urbain, énergie matinale…",
	"Un flacon ambré posé sur du marbre travertin, éditorial, lumière naturelle…",
	"La voix off d'un teaser de mini-série en français, ton calme, grave…",
	"Un storyboard 6 cases pour une émission cuisine tournée à Dakar…",
	"Un mockup Instagram Story qui vend une pâtisserie fine à São Paulo…"
];
var STARTERS = [
	{
		useCase: "Pub",
		label: "Pub sneakers 15s",
		prompt: "Une pub 15s pour une marque de sneakers, plan urbain, énergie matinale, musique électro douce."
	},
	{
		useCase: "Pub",
		label: "Mockup packaging bio",
		prompt: "Un mockup produit d'un flacon de savon bio posé sur pierre volcanique, lumière chaude."
	},
	{
		useCase: "UGC",
		label: "Unboxing beauté",
		prompt: "Une créatrice UGC ouvre une palette maquillage, plan macro sur ses mains, lumière naturelle."
	},
	{
		useCase: "UGC",
		label: "Reel Instagram café",
		prompt: "Un latte art versé en gros plan, plateau bois, ambiance café parisien matin."
	},
	{
		useCase: "Émission",
		label: "Générique cuisine",
		prompt: "Le générique d'une émission cuisine tournée à Dakar, plans dynamiques et couleurs vives, 8s."
	},
	{
		useCase: "Film",
		label: "Teaser mini-série",
		prompt: "Voix off française grave pour teaser d'une mini-série policière, ton calme et menaçant."
	}
];
function AgentPage() {
	const t = useT();
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const [phIndex, setPhIndex] = (0, import_react.useState)(0);
	const [focused, setFocused] = (0, import_react.useState)(false);
	const [files, setFiles] = (0, import_react.useState)([]);
	const [turns, setTurns] = (0, import_react.useState)([]);
	const scrollRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (focused) return;
		const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 4200);
		return () => clearInterval(id);
	}, [focused]);
	(0, import_react.useEffect)(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [turns]);
	function inferKind(p) {
		const l = p.toLowerCase();
		if (/(vidéo|video|clip|pub|teaser|reel|travelling|générique)/.test(l)) return "video";
		if (/(voix|voice|voix off|dialogue|narration)/.test(l)) return "voice";
		if (/(image|photo|mockup|storyboard|flacon|assiette|packaging|portrait)/.test(l)) return "image";
		return "text";
	}
	function pickModels(kind) {
		if (kind === "video") return {
			chosen: getModel("kling-3-turbo"),
			reason: "Kling 3 Turbo excelle sur les plans dynamiques et rend en moins d'une minute — parfait pour ton brief.",
			alts: [getModel("seedance-2-fast"), getModel("wan-27-video")]
		};
		if (kind === "voice") return {
			chosen: getModel("eleven-v3"),
			reason: "ElevenLabs V3 gère six langues avec une intonation naturelle — c'est l'option la plus solide pour une voix off éditoriale.",
			alts: [getModel("kling-3-pro")]
		};
		if (kind === "image") return {
			chosen: getModel("seedream-5-pro"),
			reason: "Seedream 5 Pro tient la typographie et les compositions produit — le meilleur choix pour un mockup net.",
			alts: [getModel("nano-banana-2"), getModel("gpt-image-2")]
		};
		return {
			chosen: getModel("claude-sonnet-5"),
			reason: "Claude Sonnet 5 est le meilleur équilibre raisonnement/vitesse pour du texte structuré.",
			alts: [getModel("gpt-55"), getModel("gemini-31-pro")]
		};
	}
	async function runGeneration(turnId, kind) {
		const steps = kind === "video" ? [
			"Analyse du prompt…",
			"Sélection du modèle…",
			"Génération des frames…",
			"Synchronisation audio…",
			"Encodage final…"
		] : kind === "voice" ? [
			"Analyse du texte…",
			"Choix de la voix…",
			"Synthèse acoustique…",
			"Post-traitement…"
		] : kind === "image" ? [
			"Analyse du prompt…",
			"Sélection du modèle…",
			"Débruitage progressif…",
			"Finalisation…"
		] : [
			"Analyse du prompt…",
			"Raisonnement…",
			"Rédaction…"
		];
		const stepMs = (kind === "video" ? 3600 : kind === "voice" ? 1800 : kind === "image" ? 1600 : 1100) / steps.length;
		for (let i = 0; i < steps.length; i++) {
			const p = Math.round((i + 1) / steps.length * 100);
			const step = steps[i];
			setTurns((ts) => ts.map((t) => t.id === turnId ? {
				...t,
				step,
				progress: p
			} : t));
			await new Promise((r) => setTimeout(r, stepMs));
		}
		setTurns((ts) => ts.map((t) => t.id === turnId ? {
			...t,
			status: "done",
			progress: 100,
			step: ""
		} : t));
	}
	async function send(text) {
		const p = (text ?? prompt).trim();
		if (!p) return;
		const kind = inferKind(p);
		const { chosen, reason, alts } = pickModels(kind);
		const id = `${Date.now()}`;
		const turn = {
			id,
			prompt: p,
			model: chosen,
			reason,
			alternatives: alts,
			status: "generating",
			progress: 0,
			step: "",
			kind
		};
		setTurns((ts) => [...ts, turn]);
		setPrompt("");
		await runGeneration(id, kind);
	}
	function switchModel(turnId, m) {
		setTurns((ts) => ts.map((t) => {
			if (t.id !== turnId) return t;
			const alts = [t.model, ...t.alternatives.filter((a) => a.slug !== m.slug)].slice(0, 3);
			return {
				...t,
				model: m,
				alternatives: alts,
				reason: `Basculé sur ${m.name} — ${m.blurb}`
			};
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-[calc(100vh-3.5rem)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollRef,
			className: "flex-1 overflow-y-auto scroll-smooth",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-5 sm:px-8 py-8",
				children: [turns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					t,
					onPick: (p) => {
						setPrompt(p);
						setTimeout(() => send(p), 0);
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-8",
					children: turns.map((turn, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TurnCard, {
						turn,
						index: idx + 1,
						onSwitch: (m) => switchModel(turn.id, m),
						onRefine: (chip) => send(`${turn.prompt} — ${chip}`)
					}, turn.id))
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border bg-background/70 backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-5 sm:px-8 py-4",
				children: [files.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 flex flex-wrap gap-2",
					children: files.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-[160px] truncate",
								children: f.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setFiles((v) => v.filter((_, j) => j !== i)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3 text-muted-foreground hover:text-foreground" })
							})
						]
					}, i))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative rounded-2xl border border-border bg-surface-1/70 focus-within:border-amber/50 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							ref: inputRef,
							value: prompt,
							onChange: (e) => setPrompt(e.target.value),
							onFocus: () => setFocused(true),
							onBlur: () => setFocused(false),
							onKeyDown: (e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									send();
								}
							},
							rows: 2,
							placeholder: "",
							className: "w-full resize-none bg-transparent px-4 pt-3 pb-14 text-sm outline-none"
						}),
						!prompt && !focused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute top-3 left-4 right-16 truncate text-sm text-muted-foreground/70",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
								mode: "wait",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									initial: {
										opacity: 0,
										y: 4
									},
									animate: {
										opacity: 1,
										y: 0
									},
									exit: {
										opacity: 0,
										y: -4
									},
									transition: { duration: .3 },
									children: PLACEHOLDERS[phIndex]
								}, phIndex)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-3 bottom-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									multiple: true,
									className: "hidden",
									onChange: (e) => setFiles((v) => [...v, ...Array.from(e.target.files || [])])
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => send(),
								disabled: !prompt.trim(),
								className: "grid place-items-center size-8 rounded-lg bg-amber text-primary-foreground disabled:opacity-40 hover:opacity-95 transition",
								"aria-label": "Envoyer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" })
							})]
						})
					]
				})]
			})
		})]
	});
}
function EmptyState({ t, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-16 sm:py-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid place-items-center size-14 rounded-2xl bg-gradient-to-br from-amber/30 to-amber/5 border border-amber/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 text-amber" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-6 text-center font-display text-4xl sm:text-5xl tracking-[-0.03em]",
				children: t("app.agent.hello")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-muted-foreground max-w-lg mx-auto",
				children: t("app.agent.hello_sub")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3",
					children: t("app.agent.starters_title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => onPick(s.prompt),
						className: "group rounded-2xl border border-border bg-surface-1/60 p-4 text-left transition-all hover:border-amber/40 hover:bg-surface-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft",
									children: s.useCase
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5 rotate-45 text-muted-foreground group-hover:text-amber transition" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 text-sm font-medium",
								children: s.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-muted-foreground line-clamp-2",
								children: s.prompt
							})
						]
					}, s.label))
				})]
			})
		]
	});
}
function TurnCard({ turn, index, onSwitch, onRefine }) {
	const KindIcon = turn.kind === "video" ? Film : turn.kind === "voice" ? Mic : turn.kind === "image" ? Image : MessageSquare;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: `turn-${index}`,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-right",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-block max-w-xl rounded-2xl bg-amber/15 text-foreground px-4 py-2.5 text-sm text-left",
					children: turn.prompt
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-gradient-border rounded-2xl bg-surface-1/60 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid place-items-center size-9 rounded-xl bg-gradient-to-br from-amber to-amber-soft text-primary-foreground shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindIcon, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft",
										children: "Choisi pour toi"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-sm",
										children: turn.model.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground text-xs",
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
										usd: basePrice(turn.model),
										className: "text-xs"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-sm text-foreground/85 leading-relaxed",
								children: turn.reason
							}),
							turn.alternatives.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5",
									children: "Autres options"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: turn.alternatives.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => onSwitch(m),
										className: "group inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-3 py-1.5 text-xs hover:border-amber/40 hover:bg-surface-2 transition",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: m.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "·"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
												usd: basePrice(m),
												className: "text-xs"
											})
										]
									}, m.slug))
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultBlock, {
				turn,
				onRefine
			})
		]
	});
}
function ResultBlock({ turn, onRefine }) {
	const refineChips = turn.kind === "video" ? [
		"Plus cinématographique",
		"Ambiance nuit",
		"Version 6 s",
		"Ralenti sur le sujet"
	] : turn.kind === "voice" ? [
		"Ton plus grave",
		"Plus rapide",
		"Ambiance intime"
	] : turn.kind === "image" ? [
		"Cadre serré",
		"Lumière du matin",
		"Fond neutre",
		"Variation typographie"
	] : [
		"Plus court",
		"Plus formel",
		"Ajoute des puces"
	];
	const generating = turn.status === "generating";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-gradient-border rounded-3xl bg-surface-1/50 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[16/10] bg-gradient-to-br from-amber/20 via-surface-2 to-surface-0 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: `https://picsum.photos/seed/${turn.id}/900/560`,
						alt: "",
						className: cn("absolute inset-0 h-full w-full object-cover transition-all duration-700", generating ? "blur-xl scale-105 opacity-70" : "blur-0 scale-100 opacity-100")
					}),
					generating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent grid place-items-end p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono uppercase tracking-[0.22em] text-white/80",
									children: turn.step || "…"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono tabular text-white/80",
									children: [turn.progress, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
									className: "h-full bg-gradient-to-r from-amber to-amber-soft",
									animate: { width: `${turn.progress}%` },
									transition: { duration: .3 }
								})
							})]
						})
					}),
					!generating && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-3 left-3 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/90",
						children: ["Résultat prêt · ", turn.model.name]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: ["Facturé ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
						usd: basePrice(turn.model),
						className: "text-xs",
						emphasize: true
					})]
				}), !generating && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-amber/40 transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Télécharger"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-amber/40 transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Régénérer"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/models/$slug",
							params: { slug: turn.model.slug },
							className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-amber/40 transition",
							children: "Ouvrir le playground"
						})
					]
				})]
			}),
			!generating && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2",
					children: "Affiner"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: refineChips.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onRefine(chip),
						className: "rounded-full border border-border bg-surface-2/40 px-3 py-1.5 text-xs text-foreground/85 hover:border-amber/40 hover:text-foreground transition",
						children: chip
					}, chip))
				})]
			})
		]
	});
}
//#endregion
export { AgentPage as component };
