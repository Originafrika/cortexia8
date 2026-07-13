import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BfDQLD5K.mjs";
import { t as cs } from "../_libs/neondatabase__serverless.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/waitlist-BHm9rnPD.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var sql = cs(process.env.DATABASE_URL);
function generateReferralCode(email) {
	return `CX${Array.from(email.trim().toLowerCase()).reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(36).slice(0, 6).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}
var waitlistSignup_createServerFn_handler = createServerRpc({
	id: "706cfb33ee1d8b020df4dbc330fef91dc8beebf631124e559cee622522ae7325",
	name: "waitlistSignup",
	filename: "src/lib/waitlist.ts"
}, (opts) => waitlistSignup.__executeServer(opts));
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
}).handler(waitlistSignup_createServerFn_handler, async ({ data }) => {
	const code = generateReferralCode(data.email);
	const result = await sql`
      INSERT INTO waitlist (email, profession, referral_code, referred_by)
      VALUES (${data.email}, ${data.profession}, ${code}, ${data.referred_by ?? null})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, referral_code, created_at
    `;
	if (result.length === 0) {
		const existing = await sql`
        SELECT id, referral_code, created_at FROM waitlist WHERE email = ${data.email}
      `;
		if (existing.length === 0) throw new Error("Erreur d'inscription");
		return existing[0];
	}
	return result[0];
});
var getWaitlistCount_createServerFn_handler = createServerRpc({
	id: "66e925108d34f8c96fff7d3bb0be0ea02667165cd0185a3029cefbb6cd738858",
	name: "getWaitlistCount",
	filename: "src/lib/waitlist.ts"
}, (opts) => getWaitlistCount.__executeServer(opts));
var getWaitlistCount = createServerFn({ method: "GET" }).handler(getWaitlistCount_createServerFn_handler, async () => {
	const result = await sql`SELECT COUNT(*) as count FROM waitlist`;
	return Number(result[0].count);
});
var getRank_createServerFn_handler = createServerRpc({
	id: "ac8b324354fc52a920ce8935c30696cde878819776f8215001c070962d43044e",
	name: "getRank",
	filename: "src/lib/waitlist.ts"
}, (opts) => getRank.__executeServer(opts));
var getRank = createServerFn({ method: "GET" }).validator((d) => d).handler(getRank_createServerFn_handler, async ({ data }) => {
	const result = await sql`
      SELECT rank FROM (
        SELECT email, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rank
        FROM waitlist
      ) sub WHERE email = ${data.email}
    `;
	return result.length > 0 ? Number(result[0].rank) : null;
});
//#endregion
export { getRank_createServerFn_handler, getWaitlistCount_createServerFn_handler, waitlistSignup_createServerFn_handler };
