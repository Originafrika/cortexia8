const SESSION_KEY = "cortexia_session";

export interface StoredSession {
  /**
   * Legacy field kept optional for type compatibility. New sessions never
   * persist a bearer token; server functions authenticate through the
   * HttpOnly Neon Auth cookie.
   */
  token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export function saveSession(data: { token?: string; user: StoredSession["user"] }) {
  if (typeof window === "undefined") return;
  try {
    // Deliberately persist only non-sensitive profile data. The session token
    // is owned by the Auth provider's HttpOnly cookie and must not be exposed
    // to JavaScript or stored in localStorage.
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.user }));
  } catch (err) {
    console.error("[Auth] Failed to save session profile:", err);
  }
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (!parsed.user || typeof parsed.user !== "object") return null;

    // Migrate old token-bearing entries in place so a previous session token
    // is removed the next time the app reads local state.
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: parsed.user }));
    return { user: parsed.user as StoredSession["user"] };
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const session = loadSession();
  return session?.user?.role === "admin";
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures during logout.
  }
}
