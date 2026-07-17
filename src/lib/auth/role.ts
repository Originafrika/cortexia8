import { sql } from "@/lib/db";

export type UserRole = "user" | "admin";

export async function getUserRole(email: string): Promise<UserRole> {
  const result = await sql`SELECT role FROM users WHERE email = ${email}`;
  return (result[0]?.role === "admin") ? "admin" : "user";
}

export async function requireAdmin(email: string): Promise<void> {
  const role = await getUserRole(email);
  if (role !== "admin") {
    throw new Response("Forbidden: admin access required", { status: 403 });
  }
}
