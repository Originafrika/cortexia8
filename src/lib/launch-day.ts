import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";

// TODO: wire real magic-link dispatch once the Neon auth server adapter is available.
export const sendAllMagicLinks = createServerFn({ method: "POST" })
  .validator((d: { confirm: boolean }) => {
    if (!d.confirm) throw new Error("Confirmation requise");
    return d;
  })
  .handler(async () => {
    const rows = await sql`SELECT email FROM waitlist ORDER BY created_at ASC`;
    return { sent: 0, total: rows.length, results: [] as { email: string; ok: boolean }[] };
  });

export const sendMagicLink = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => {
    if (!d.email || !d.email.includes("@")) throw new Error("Email invalide");
    return d;
  })
  .handler(async ({ data }) => {
    const exists = await sql`SELECT id FROM waitlist WHERE email = ${data.email}`;
    if (exists.length === 0) throw new Error("Email non trouvé dans la waitlist");
    return { ok: true, email: data.email };
  });
