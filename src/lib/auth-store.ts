const SESSION_KEY = "cortexia_session";

export interface StoredSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export function saveSession(data: { token: string; user: StoredSession["user"] }) {
  if (typeof window === "undefined") return; // SSR guard
  console.log("[Auth] Saving session with token:", data.token ? data.token.slice(0, 10) + "..." : "MISSING");
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    console.log("[Auth] Session saved to localStorage");
  } catch (err) {
    console.error("[Auth] Failed to save session:", err);
  }
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null; // SSR guard
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const session = loadSession();
  return session?.user?.role === "admin";
}

export function clearSession() {
  if (typeof window === "undefined") return; // SSR guard
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
