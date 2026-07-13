import { createServerFn } from "@tanstack/react-start";
import { createAuthClient, BetterAuthVanillaAdapter } from "@neondatabase/neon-js/auth";
import { sql } from "./db";

const auth = createAuthClient(process.env.VITE_NEON_AUTH_URL!, {
  adapter: BetterAuthVanillaAdapter(),
});

export const sendAllMagicLinks = createServerFn({ method: "POST" })
  .validator((d: { confirm: boolean }) => {
    if (!d.confirm) throw new Error("Confirmation requise");
    return d;
  })
  .handler(async () => {
    const rows = await sql`SELECT email, created_at FROM waitlist ORDER BY created_at ASC`;
    const results: { email: string; ok: boolean; error?: string }[] = [];

    for (const row of rows) {
      try {
        await auth.magicLink.send({ email: row.email });
        results.push({ email: row.email, ok: true });
      } catch (err) {
        results.push({ email: row.email, ok: false, error: String(err) });
      }
    }

    return { sent: results.filter((r) => r.ok).length, total: results.length, results };
  });

export const sendMagicLink = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => {
    if (!d.email || !d.email.includes("@")) throw new Error("Email invalide");
    return d;
  })
  .handler(async ({ data }) => {
    const exists = await sql`SELECT id FROM waitlist WHERE email = ${data.email}`;
    if (exists.length === 0) throw new Error("Email non trouvé dans la waitlist");

    await auth.magicLink.send({ email: data.email });
    return { ok: true, email: data.email };
  });
