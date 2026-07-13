import { c as require_jsx_runtime, t as AccountView } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { t as Route } from "./account._pathname-WSEhitF9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account._pathname-CUHjfdrr.js
var import_jsx_runtime = require_jsx_runtime();
function Account() {
	const { pathname } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-lg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountView, { pathname })
		})
	});
}
//#endregion
export { Account as component };
