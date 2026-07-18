import { createServerFn } from "@tanstack/react-start";
import { getUserRole } from "@/lib/auth/role";

export const checkUserRole = createServerFn({ method: "GET" })
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const role = await getUserRole(email);
    return { role };
  });
