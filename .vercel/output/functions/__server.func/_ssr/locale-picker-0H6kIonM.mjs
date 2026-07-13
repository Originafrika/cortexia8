import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { r as cn, s as useCurrencyStore, t as CURRENCIES } from "./price-display-CaZPZTYO.mjs";
import { n as LANGS, r as useLocaleStore, t as CURRENCY_TO_LANG } from "./i18n-BEBY8TOx.mjs";
import { A as ChevronDown, b as Globe, j as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/locale-picker-0H6kIonM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Combined currency + language picker.
* - Changing currency updates the language automatically (unless the user
*   overrode it).
* - The user can still pick a language independently in the right column.
*/
function LocalePicker({ className }) {
	const code = useCurrencyStore((s) => s.code);
	const setCurrency = useCurrencyStore((s) => s.setCurrency);
	const lang = useLocaleStore((s) => s.lang);
	const setLang = useLocaleStore((s) => s.setLang);
	const setFromCurrency = useLocaleStore((s) => s.setFromCurrency);
	const [open, setOpen] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		function onClick(e) {
			if (!ref.current?.contains(e.target)) setOpen(false);
		}
		window.addEventListener("mousedown", onClick);
		return () => window.removeEventListener("mousedown", onClick);
	}, [open]);
	const current = CURRENCIES[code];
	const curLang = LANGS[lang];
	function onCurrency(c) {
		setCurrency(c);
		setFromCurrency(CURRENCY_TO_LANG[c]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((v) => !v),
			className: "inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground/80 hover:text-foreground hover:border-border-strong transition-colors",
			"aria-label": "Devise et langue",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: current.flag
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: current.code }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground/70",
					children: "·"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "normal-case tracking-normal",
					children: curLang.native
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 opacity-60" })
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover shadow-2xl shadow-black/60 p-2 z-50 animate-in fade-in-0 zoom-in-95",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground",
					children: "Devise"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-64 overflow-y-auto",
					children: Object.values(CURRENCIES).map((cur) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => onCurrency(cur.code),
						className: cn("w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-2/70 transition-colors", cur.code === code && "bg-surface-2/50"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								children: cur.flag
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono uppercase tracking-wider",
								children: cur.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto text-muted-foreground truncate",
								children: cur.name
							}),
							cur.code === code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-amber shrink-0" })
						]
					}, cur.code))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-l border-border pl-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-2 py-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-3" }), " Langue"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: Object.keys(LANGS).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setLang(l),
							className: cn("w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-2/70 transition-colors", l === lang && "bg-surface-2/50"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: LANGS[l].flag
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: LANGS[l].native }),
								l === lang && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "ml-auto size-3.5 text-amber" })
							]
						}, l)) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 rounded-lg bg-surface-2/40 p-2 text-[10px] leading-relaxed text-muted-foreground",
							children: "La devise règle la langue par défaut. Tu peux dissocier les deux à tout moment."
						})
					]
				})]
			})
		})]
	});
}
//#endregion
export { LocalePicker as t };
