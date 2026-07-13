import { c as require_jsx_runtime, n as AuthView } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { t as Route } from "./auth._pathname-r_f80-4J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth._pathname-DgcVQaGq.js
var import_jsx_runtime = require_jsx_runtime();
function Auth() {
	const { pathname } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthView, { pathname })
	});
}
//#endregion
export { Auth as component };
