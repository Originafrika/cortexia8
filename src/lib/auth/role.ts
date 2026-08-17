import { sql } from "@/lib/db";

export type UserRole = "user" | "admin";

export async function getUserRole(userId: number): Promise<UserRole> {
  const result = (await sql`SELECT role FROM users WHERE id = ${userId}`) as { role: string }[];
  return result[0]?.role === "admin" ? "admin" : "user";
}

export async function requireAdmin(userId: number): Promise<void> {
  const role = await getUserRole(userId);
  if (role !== "admin") {
    throw new Response("Forbidden: admin access required", { status: 403 });
  }
}
