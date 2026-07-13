import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime, o as twMerge, s as clsx } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/price-display-CaZPZTYO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CURRENCIES = {
	USD: {
		code: "USD",
		symbol: "$",
		name: "US Dollar",
		flag: "🇺🇸",
		rate: 1,
		decimals: 2
	},
	EUR: {
		code: "EUR",
		symbol: "€",
		name: "Euro",
		flag: "🇪🇺",
		rate: .92,
		decimals: 2
	},
	GBP: {
		code: "GBP",
		symbol: "£",
		name: "Pound Sterling",
		flag: "🇬🇧",
		rate: .78,
		decimals: 2
	},
	XOF: {
		code: "XOF",
		symbol: "FCFA",
		name: "Franc CFA",
		flag: "🇸🇳",
		rate: 605,
		decimals: 0
	},
	NGN: {
		code: "NGN",
		symbol: "₦",
		name: "Naira",
		flag: "🇳🇬",
		rate: 1580,
		decimals: 0
	},
	IDR: {
		code: "IDR",
		symbol: "Rp",
		name: "Rupiah",
		flag: "🇮🇩",
		rate: 16250,
		decimals: 0
	},
	BRL: {
		code: "BRL",
		symbol: "R$",
		name: "Real",
		flag: "🇧🇷",
		rate: 5.35,
		decimals: 2
	},
	INR: {
		code: "INR",
		symbol: "₹",
		name: "Rupee",
		flag: "🇮🇳",
		rate: 83.4,
		decimals: 2
	}
};
var useCurrencyStore = create()(persist((set) => ({
	code: "USD",
	setCurrency: (code) => set({ code })
}), { name: "cortexia-currency" }));
function useCurrency() {
	return CURRENCIES[useCurrencyStore((s) => s.code)];
}
function convert(usd, c) {
	return usd * c.rate;
}
function formatMoney(usd, c, opts) {
	const value = convert(usd, c);
	const decimals = opts?.forceDecimals ?? (value < 1 ? 4 : c.decimals);
	if (opts?.compact && value >= 1e3) return `${c.symbol === "FCFA" ? "" : c.symbol}${new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1
	}).format(value)}${c.symbol === "FCFA" ? " FCFA" : ""}`;
	const nf = new Intl.NumberFormat("fr-FR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(value);
	return c.symbol === "FCFA" ? `${nf} FCFA` : `${c.symbol}${nf}`;
}
/** Smooth number tween. Uses rAF, respects prefers-reduced-motion. */
function useCountUp(value, duration = 450) {
	const [display, setDisplay] = (0, import_react.useState)(value);
	const fromRef = (0, import_react.useRef)(value);
	const startRef = (0, import_react.useRef)(null);
	const rafRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || duration <= 0) {
			setDisplay(value);
			fromRef.current = value;
			return;
		}
		fromRef.current = display;
		startRef.current = null;
		const from = fromRef.current;
		const to = value;
		if (from === to) return;
		const step = (t) => {
			if (startRef.current == null) startRef.current = t;
			const p = Math.min(1, (t - startRef.current) / duration);
			const eased = 1 - Math.pow(1 - p, 3);
			setDisplay(from + (to - from) * eased);
			if (p < 1) rafRef.current = requestAnimationFrame(step);
			else fromRef.current = to;
		};
		rafRef.current = requestAnimationFrame(step);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [value, duration]);
	return display;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function PriceDisplay({ usd, className, compact, forceDecimals, suffix, emphasize }) {
	const c = useCurrency();
	const shown = useCountUp(usd, 320);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("font-mono tabular", emphasize && "text-foreground", className),
		"aria-label": formatMoney(usd, c),
		children: [formatMoney(shown, c, {
			compact,
			forceDecimals
		}), suffix ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground ml-1",
			children: suffix
		}) : null]
	});
}
//#endregion
export { useCountUp as a, formatMoney as i, PriceDisplay as n, useCurrency as o, cn as r, useCurrencyStore as s, CURRENCIES as t };
