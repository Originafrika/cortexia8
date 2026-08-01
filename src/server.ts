// Minimal SSR entry — re-exports TanStack Start's default server entry.
// Kept because tanstackStart.server.entry in vite.config.ts needs this file.
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const mod = await import("@tanstack/react-start/server-entry");
    const handler = (mod.default ?? mod) as { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> | Response };
    return handler.fetch(request, env, ctx);
  },
};
