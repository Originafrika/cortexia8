import { createServerFn } from "@tanstack/react-start";
import { getUserRole } from "@/lib/auth/role";
import { getRequestContext, HttpError, requireUserId } from "./auth";

export const checkUserRole = createServerFn({ method: "GET" })
  .validator((_data: { sessionToken?: string } | void) => _data ?? {})
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext((data as { sessionToken?: string })?.sessionToken);
      const userId = await requireUserId(ctx);
      const role = await getUserRole(userId);
      return { role };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, "Internal server error");
    }
  });
