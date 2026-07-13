import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { a as useCountUp, n as PriceDisplay } from "./price-display-CaZPZTYO.mjs";
import { t as AmbientBackground } from "./ambient-background-CMKitxnZ.mjs";
import { i as useT } from "./i18n-BEBY8TOx.mjs";
import { A as ChevronDown, P as ArrowRight, T as Copy, i as TriangleAlert, j as Check, r as Users } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { a as ModelsWall, i as ModelsMarquee, n as EditorialCountdown, o as SiteHeader, r as LAUNCH_DATE, s as WallPreview, t as CreditSimulator } from "./models-wall-DjYYCNDC.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BfDQLD5K.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-CEaTL0nR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bmf1woyL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var waitlistSignup = createServerFn({ method: "POST" }).validator((d) => {
	if (!d.email || !d.email.includes("@")) throw new Error("Email invalide");
	if (![
		"Pub",
		"UGC",
		"Émission",
		"Film",
		"Autre"
	].includes(d.profession)) throw new Error("Profession invalide");
	return d;
}).handler(createSsrRpc("706cfb33ee1d8b020df4dbc330fef91dc8beebf631124e559cee622522ae7325"));
createServerFn({ method: "GET" }).handler(createSsrRpc("66e925108d34f8c96fff7d3bb0be0ea02667165cd0185a3029cefbb6cd738858"));
createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("ac8b324354fc52a920ce8935c30696cde878819776f8215001c070962d43044e"));
var PROFESSIONS = [
	"Pub",
	"UGC",
	"Émission",
	"Film",
	"Autre"
];
var RECAP = {
	Pub: "Parfait pour les créatifs pub — Kling, Seedance et GPT Image seront dans ta boîte à outils dès l'ouverture.",
	UGC: "Parfait pour les créateurs UGC — on te prévient dès que Cortexia ouvre, avec un accès prioritaire au playground vidéo.",
	Émission: "Parfait pour les équipes d'émission — voix, montage IA et musiques seront disponibles dès le lancement.",
	Film: "Parfait pour la production audiovisuelle — Kling 4K et modèles cinéma prêts dès l'ouverture.",
	Autre: "On te met de côté un accès dès l'ouverture, avec un mot d'accueil personnel."
};
function WaitlistForm() {
	const t = useT();
	const [email, setEmail] = (0, import_react.useState)("");
	const [profession, setProfession] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [rank, setRank] = (0, import_react.useState)(0);
	const [referralCode, setReferralCode] = (0, import_react.useState)("");
	const [errorMsg, setErrorMsg] = (0, import_react.useState)("");
	async function submit(e) {
		e.preventDefault();
		if (!email || !profession) return;
		setStatus("loading");
		setErrorMsg("");
		try {
			const result = await waitlistSignup({
				email,
				profession
			});
			setReferralCode(result.referral_code);
			setRank(result.id);
			setStatus("done");
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : "Erreur d'inscription");
			setStatus("error");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
			mode: "wait",
			children: status !== "done" && status !== "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.form, {
				initial: {
					opacity: 0,
					y: 6
				},
				animate: {
					opacity: 1,
					y: 0
				},
				exit: {
					opacity: 0,
					y: -6
				},
				transition: { duration: .35 },
				onSubmit: submit,
				className: "surface-gradient-border rounded-2xl bg-surface-1/70 backdrop-blur-xl p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
						children: t("waitlist.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-[1fr,auto]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: t("waitlist.email_placeholder"),
							className: "w-full min-w-0 rounded-xl border border-border bg-surface-0/80 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-amber/50"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: status === "loading" || !email || !profession,
							className: "group inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 hover:opacity-95 transition",
							children: status === "loading" ? "…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								t("waitlist.cta"),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 transition-transform group-hover:translate-x-0.5" })
							] })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground mb-2",
							children: t("waitlist.i_create")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: PROFESSIONS.map((p) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setProfession(p),
									className: "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all " + (profession === p ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border bg-surface-2/50 text-muted-foreground hover:border-border-strong hover:text-foreground/90"),
									children: p
								}, p);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-[11px] text-muted-foreground/80",
						children: t("waitlist.no_spam")
					})
				]
			}, "form") : status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					y: 6
				},
				animate: {
					opacity: 1,
					y: 0
				},
				className: "surface-gradient-border rounded-2xl bg-surface-1/70 backdrop-blur-xl p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 text-amber shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-lg",
							children: "Une erreur est survenue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: errorMsg
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setStatus("idle"),
							className: "mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
							children: "Réessayer"
						})
					] })]
				})
			}, "error") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationCard, {
				rank,
				email,
				profession,
				referralCode
			}, "done")
		})
	});
}
function ConfirmationCard({ rank, email, profession, referralCode }) {
	const t = useT();
	const displayRank = useCountUp(rank, 800);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const invitedCount = 0;
	const link = `cortexia.ai/r/${referralCode}`;
	const referredPct = 12;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
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
		className: "surface-gradient-border rounded-2xl bg-surface-1/80 backdrop-blur-xl p-6 sm:p-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft",
				children: t("waitlist.done")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: t("waitlist.your_seat")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display text-5xl sm:text-6xl tracking-[-0.03em] tabular text-foreground",
					children: ["#", Math.round(displayRank).toLocaleString("fr-FR")]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { width: 0 },
					animate: { width: `${referredPct}%` },
					transition: {
						duration: 1.2,
						ease: "easeOut"
					},
					className: "h-full bg-gradient-to-r from-amber to-amber-soft"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 font-mono text-[11px] text-muted-foreground",
				children: [referredPct, "% de la file franchie. Parraine pour avancer plus vite."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-xl border border-amber/30 bg-amber/10 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft",
					children: ["Profil enregistré : ", profession]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-sm text-foreground/90 leading-relaxed",
					children: RECAP[profession]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-xl border border-border bg-surface-0/60 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
							children: t("waitlist.referral")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground tabular",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground/90",
									children: invitedCount
								}),
								" ",
								t("waitlist.friends_invited")
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "flex-1 truncate rounded-lg bg-surface-2/70 px-3 py-2 font-mono text-xs text-foreground/90",
							children: link
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								navigator.clipboard.writeText(link);
								setCopied(true);
								setTimeout(() => setCopied(false), 1500);
							},
							className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-xs hover:border-amber/40 transition",
							children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-emerald" }),
								" ",
								t("waitlist.copied")
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }),
								" ",
								t("waitlist.copy")
							] })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-foreground/85 leading-relaxed",
						children: [
							"Chaque ami inscrit via ton lien te fait gagner",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-amber-soft font-medium",
								children: "3 places"
							}),
							" et",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-amber-soft font-medium",
								children: "2 $ de crédits offerts"
							}),
							" au lancement."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							"X",
							"WhatsApp",
							"Telegram",
							"LinkedIn"
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "rounded-full border border-border bg-surface-2/50 px-3 py-1.5 text-xs text-foreground/85 hover:border-border-strong hover:text-foreground transition",
							children: ["Partager sur ", n]
						}, n))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-xs text-muted-foreground leading-relaxed",
				children: t("waitlist.launch_email")
			})
		]
	});
}
function WaitlistLanding() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmbientBackground, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallPreviewSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimulatorSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelsSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparisonSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialProofSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaqSection, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterSection, {})
		]
	});
}
function LangFade({ children }) {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
		mode: "wait",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 },
			transition: { duration: .25 },
			children
		}, t("hero.title.a"))
	});
}
function Hero() {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-7xl px-5 sm:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-12 lg:grid-cols-[1.15fr,0.85fr] lg:gap-16 items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { duration: .6 },
					className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 backdrop-blur px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-amber pulse-soft" }), t("badge.launch")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LangFade, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-6 font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.035em]",
					children: [
						t("hero.title.a"),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "italic text-amber-soft",
							children: t("hero.title.b")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-xl text-lg text-foreground/80 leading-relaxed",
					children: t("hero.subtitle")
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .7,
						delay: .25
					},
					className: "mt-8 max-w-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaitlistForm, {})
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 12
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .8,
					delay: .1
				},
				className: "lg:sticky lg:top-24 surface-gradient-border rounded-3xl bg-surface-1/40 backdrop-blur-xl p-6 sm:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialCountdown, { target: LAUNCH_DATE }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("stat.models"),
							value: "30+"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("stat.currencies"),
							value: "8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("stat.no_sub"),
							value: "0 €"
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-16 flex justify-center text-muted-foreground/70",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-5 animate-bounce" })
		})]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "font-display text-2xl tracking-[-0.02em]",
		children: value
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
		children: label
	})] });
}
function WallPreviewSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-7xl px-5 sm:px-8 pb-16 sm:pb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-2xl mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
				children: useT()("wall.eyebrow")
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallPreview, {})]
	});
}
function SimulatorSection() {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl mb-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
					children: t("sim.eyebrow")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]",
					children: [
						t("sim.title.a"),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground italic",
							children: t("sim.title.b")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-foreground/75",
					children: t("sim.subtitle")
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditSimulator, {})]
	});
}
function WallSection() {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
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
	});
}
function ModelsSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "py-16 sm:py-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-5 sm:px-8 mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
				children: "Catalogue"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]",
				children: "Tous les modèles qui comptent. Sous un seul compte."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelsMarquee, {})]
	});
}
function ComparisonSection() {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
				children: t("compare.eyebrow")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]",
				children: [
					t("compare.title.a"),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					" ",
					t("compare.title.b")
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanCard, {
				kind: "old",
				title: t("compare.old.title"),
				subtitle: t("compare.old.subtitle"),
				items: [
					{
						label: "Higgsfield Pro",
						usd: 39
					},
					{
						label: "Midjourney Standard",
						usd: 30
					},
					{
						label: "ElevenLabs Starter",
						usd: 22
					}
				],
				note: t("compare.old.note")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanCard, {
				kind: "cortexia",
				title: t("compare.new.title"),
				subtitle: t("compare.new.subtitle"),
				items: [
					{
						label: "30 s de vidéo Kling 3 Turbo 1080p",
						usd: 30 * .1418
					},
					{
						label: "40 images Seedream Pro 1K",
						usd: 40 * .0441
					},
					{
						label: "6 000 caractères ElevenLabs V3",
						usd: 6 * .0882
					}
				],
				note: t("compare.new.note")
			})]
		})]
	});
}
function PlanCard({ kind, title, subtitle, items, note }) {
	const t = useT();
	const total = items.reduce((s, i) => s + i.usd, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl p-7 sm:p-8 border transition-all " + (kind === "cortexia" ? "surface-gradient-border bg-surface-1/70 border-transparent shadow-[0_30px_80px_-30px_oklch(0.78_0.16_70_/_0.25)]" : "border-border bg-surface-0/40 text-muted-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] " + (kind === "cortexia" ? "text-amber-soft" : "text-muted-foreground/70"),
				children: subtitle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 font-display text-3xl tracking-[-0.02em] " + (kind === "cortexia" ? "text-foreground" : "text-foreground/70"),
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-3",
				children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: kind === "cortexia" ? "text-foreground/85" : "",
						children: i.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
						usd: i.usd,
						className: "text-sm " + (kind === "cortexia" ? "text-foreground" : "line-through decoration-1")
					})]
				}, i.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 pt-6 border-t border-border flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs uppercase tracking-wider font-mono",
					children: t("compare.total")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceDisplay, {
					usd: total,
					className: "font-display text-3xl tracking-[-0.02em] " + (kind === "cortexia" ? "text-amber-soft" : "line-through decoration-1 text-muted-foreground")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs " + (kind === "cortexia" ? "text-foreground/70" : "text-muted-foreground/70"),
				children: note
			})
		]
	});
}
function SocialProofSection() {
	const t = useT();
	const [count, setCount] = (0, import_react.useState)(4218);
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setCount((v) => v + Math.floor(Math.random() * 3)), 8e3);
		return () => clearInterval(id);
	}, []);
	const displayed = useCountUp(count, 900);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-12 lg:grid-cols-[0.9fr,1.1fr] items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
					children: t("social.eyebrow")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 font-display text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] tracking-[-0.035em] tabular text-foreground",
					children: Math.round(displayed).toLocaleString("fr-FR")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-foreground/75 max-w-md",
					children: t("social.copy")
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Testimonial, {
						name: "Amara",
						role: "Créatrice UGC",
						city: "Lomé",
						quote: "Je paie enfin ce que je consomme. Trois vidéos ce mois-ci, trois vidéos facturées. Pas de forfait qui me pique."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Testimonial, {
						name: "Julien",
						role: "Fondateur d'agence",
						city: "São Paulo",
						quote: "Je compare Kling et Seedance sur le même prompt en trois clics. Avant, c'était deux abonnements et deux onboardings."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Testimonial, {
						name: "Wei",
						role: "Développeur solo",
						city: "Jakarta",
						quote: "Une API, une facture à l'usage, pas de minimum mensuel. Ma trésorerie respire enfin."
					})
				]
			})]
		})
	});
}
function Testimonial({ name, role, city, quote }) {
	const initial = name[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-gradient-border rounded-2xl bg-surface-1/50 backdrop-blur p-5 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-foreground/90 leading-relaxed",
			children: [
				"« ",
				quote,
				" »"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center size-9 rounded-full bg-gradient-to-br from-amber to-amber-soft/60 text-primary-foreground font-display text-sm",
				children: initial
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: [
						" ",
						"· ",
						role,
						" · ",
						city
					]
				})]
			})]
		})]
	});
}
var FAQS = [
	{
		q: "Vraiment sans abonnement ?",
		a: "Sans. Tu recharges le montant que tu veux, tu génères, tu repars. Reviens dans 3 mois sans avoir rien perdu."
	},
	{
		q: "Comment sont fixés les prix ?",
		a: "Un prix unique par modèle, visible avant chaque génération. Pas de palier caché, pas d'engagement, pas de minimum mensuel."
	},
	{
		q: "Je peux payer en Mobile Money ?",
		a: "Oui — Orange Money, MTN, Wave. Aussi carte, crypto (USDT / USDC), Alipay. Le paiement local n'est pas une option de plus, c'est le cœur du produit."
	},
	{
		q: "Quels modèles au lancement ?",
		a: "Toute la famille Kling 3, Seedance 2, Nano Banana 2, GPT-5, Claude Sonnet/Opus, Gemini 3, ElevenLabs V3, et une douzaine d'autres. Nouveaux modèles ajoutés dès leur sortie."
	},
	{
		q: "Vous avez une API ?",
		a: "Oui, dès le lancement. Endpoints REST, clés self-service, même moteur de facturation à l'usage, sans minimum mensuel."
	}
];
function FaqSection() {
	const t = useT();
	const [open, setOpen] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
				children: t("faq.eyebrow")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-4xl sm:text-5xl tracking-[-0.03em]",
				children: t("faq.title")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border border-y border-border",
			children: FAQS.map((f, i) => {
				const isOpen = open === i;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpen(isOpen ? null : i),
					className: "flex w-full items-center justify-between gap-4 py-5 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg sm:text-xl tracking-[-0.01em]",
						children: f.q
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-5 text-muted-foreground transition-transform " + (isOpen ? "rotate-180 text-amber" : "") })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: false,
					animate: {
						height: isOpen ? "auto" : 0,
						opacity: isOpen ? 1 : 0
					},
					transition: {
						duration: .3,
						ease: [
							.22,
							1,
							.36,
							1
						]
					},
					className: "overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pb-5 text-foreground/80 leading-relaxed pr-8",
						children: f.a
					})
				})] }, f.q);
			})
		})]
	});
}
function FooterSection() {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "mt-8 border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-sm",
							children: "C"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display tracking-[-0.02em]",
						children: "Cortexia"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground text-xs",
						children: t("footer.copy")
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground transition",
						children: t("footer.policy")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground transition",
						children: t("footer.contact")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/app-preview",
						className: "opacity-40 hover:opacity-80 transition inline-flex items-center gap-1",
						children: [
							t("footer.team"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })
						]
					})
				]
			})]
		})
	});
}
//#endregion
export { WaitlistLanding as component };
