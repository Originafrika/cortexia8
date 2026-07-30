import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";
import { Resend } from "resend";

const APP_URL = process.env.APP_URL ?? "https://cortexia.originafrika.online";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  return new Resend(apiKey);
}

async function sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
  try {
    const resend = getResendClient();
    const magicLink = `${APP_URL}/auth/verify?token=${token}`;

    await resend.emails.send({
      from: "Cortexia <noreply@cortexia.originafrika.online>",
      to: email,
      subject: "Your Cortexia Access Link",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to Cortexia</h1>
          <p style="color: #666; margin-bottom: 24px;">Click the button below to access your account:</p>
          <a href="${magicLink}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Access Cortexia
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("[launch-day] Failed to send email:", err);
    return false;
  }
}

export const sendAllMagicLinks = createServerFn({ method: "POST" })
  .validator((d: { confirm: boolean }) => {
    if (!d.confirm) throw new Error("Confirmation requise");
    return d;
  })
  .handler(async () => {
    const rows = (await sql`SELECT email FROM waitlist ORDER BY created_at ASC`) as { email: string }[];
    const results: { email: string; ok: boolean }[] = [];

    for (const row of rows) {
      // Generate a simple token (in production, use proper JWT or crypto)
      const token = Buffer.from(`${row.email}:${Date.now()}`).toString("base64url");
      const ok = await sendMagicLinkEmail(row.email, token);
      results.push({ email: row.email, ok });
    }

    return { sent: results.filter((r) => r.ok).length, total: rows.length, results };
  });

export const sendMagicLink = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => {
    if (!d.email || !d.email.includes("@")) throw new Error("Email invalide");
    return d;
  })
  .handler(async ({ data }) => {
    const exists = (await sql`SELECT id FROM waitlist WHERE email = ${data.email}`) as { id: number }[];
    if (exists.length === 0) throw new Error("Email non trouvé dans la waitlist");

    const token = Buffer.from(`${data.email}:${Date.now()}`).toString("base64url");
    const ok = await sendMagicLinkEmail(data.email, token);

    return { ok, email: data.email };
  });
