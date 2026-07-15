import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";

function generateReferralCode(email: string): string {
  const hash = Array.from(email.trim().toLowerCase()).reduce(
    (acc, c) => acc + c.charCodeAt(0),
    0,
  );
  return `CX${hash.toString(36).slice(0, 6).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

export const waitlistSignup = createServerFn({ method: "POST" })
  .validator((d: { email: string; profession: string; referred_by?: string }) => {
    if (!d.email || !d.email.includes("@")) throw new Error("Email invalide");
    const valid = ["Pub", "UGC", "Émission", "Film", "Autre"];
    if (!valid.includes(d.profession)) throw new Error("Profession invalide");
    return d;
  })
  .handler(async ({ data }) => {
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
      return existing[0] as { id: number; referral_code: string; created_at: string };
    }

    return result[0] as { id: number; referral_code: string; created_at: string };
  });

export const getWaitlistCount = createServerFn({ method: "GET" })
  .handler(async () => {
    const result = await sql`SELECT COUNT(*) as count FROM waitlist`;
    return Number(result[0].count);
  });

export const getRank = createServerFn({ method: "GET" })
  .validator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    const result = await sql`
      SELECT rank FROM (
        SELECT email, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rank
        FROM waitlist
      ) sub WHERE email = ${data.email}
    `;
    return result.length > 0 ? Number(result[0].rank) : null;
  });

export const lookupReferralCode = createServerFn({ method: "GET" })
  .validator((d: { code: string }) => {
    if (!d.code) throw new Error("Code invalide");
    return d;
  })
  .handler(async ({ data }) => {
    const result = await sql`
      SELECT email FROM waitlist WHERE referral_code = ${data.code}
    `;
    return result.length > 0 ? (result[0].email as string) : null;
  });
