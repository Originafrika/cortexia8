import { createServerFn } from "@tanstack/react-start";
import { getUserRole } from "@/lib/auth/role";
import { getRequestContext, HttpError, requireUserId, toJsonResponse } from "./auth";

export const checkUserRole = createServerFn({ method: "GET" })
  .validator((_data: void) => _data)
  .handler(async ({ data }) => {
    try {
      const ctx = await getRequestContext();
      const userId = await requireUserId(ctx);
      const role = await getUserRole(String(userId));
      return { role };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw toJsonResponse(err);
    }
  });
