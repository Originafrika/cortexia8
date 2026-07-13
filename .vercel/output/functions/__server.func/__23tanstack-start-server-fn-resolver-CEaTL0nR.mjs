//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CEaTL0nR.js
var manifest = {
	"66e925108d34f8c96fff7d3bb0be0ea02667165cd0185a3029cefbb6cd738858": {
		functionName: "getWaitlistCount_createServerFn_handler",
		importer: () => import("./_ssr/waitlist-BHm9rnPD.mjs")
	},
	"706cfb33ee1d8b020df4dbc330fef91dc8beebf631124e559cee622522ae7325": {
		functionName: "waitlistSignup_createServerFn_handler",
		importer: () => import("./_ssr/waitlist-BHm9rnPD.mjs")
	},
	"ac8b324354fc52a920ce8935c30696cde878819776f8215001c070962d43044e": {
		functionName: "getRank_createServerFn_handler",
		importer: () => import("./_ssr/waitlist-BHm9rnPD.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
