import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as createFileRoute, h as notFound, u as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@neondatabase/auth-ui+[...].mjs";
import { r as getModel } from "./models-C7mRBOxQ.mjs";
require_react();
require_jsx_runtime();
var $$splitNotFoundComponentImporter = () => import("./app.models._slug-C1PEs1IQ.mjs");
var $$splitErrorComponentImporter = () => import("./app.models._slug-BCKmEwRP.mjs");
var $$splitComponentImporter = () => import("./app.models._slug-CG7-1KYC.mjs");
var Route = createFileRoute("/app/models/$slug")({
	loader: ({ params }) => {
		const m = getModel(params.slug);
		if (!m) throw notFound();
		return { model: m };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
