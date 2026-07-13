import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { r as cn } from "./price-display-CaZPZTYO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ambient-background-CMKitxnZ.js
var import_jsx_runtime = require_jsx_runtime();
/** Full-page ambient background: slow-drifting warm mesh gradient over deep near-black. */
function AmbientBackground({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-[0.55] mesh-anim",
				style: { background: `
            radial-gradient(60% 45% at 20% 20%, oklch(0.78 0.16 70 / 0.28), transparent 60%),
            radial-gradient(50% 40% at 80% 10%, oklch(0.55 0.12 30 / 0.22), transparent 60%),
            radial-gradient(70% 55% at 70% 90%, oklch(0.35 0.08 50 / 0.35), transparent 70%),
            radial-gradient(40% 30% at 10% 90%, oklch(0.72 0.14 155 / 0.10), transparent 60%)
          ` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-[0.06] mix-blend-overlay",
				style: { backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" })
		]
	});
}
//#endregion
export { AmbientBackground as t };
