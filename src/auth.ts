import { createAuthClient } from "@neondatabase/neon-js/auth";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react";

// Suppress Neon Auth 401 errors from browser console.
// Neon Auth makes POST requests that return 401 when checking sessions —
// this is expected behavior, not a real error. Wrap fetch to silently
// handle 401 responses from Neon Auth endpoints.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const request = args[0];
  const url =
    typeof request === "string"
      ? request
      : request instanceof URL
        ? request.toString()
        : (request?.url ?? "");
  if (url.includes("neon.tech") && response.status === 401) {
    // Return the 401 silently — Neon Auth client handles this internally
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
  return response;
};

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter({
    fetchOptions: {
      credentials: "include",
    },
  }),
});
