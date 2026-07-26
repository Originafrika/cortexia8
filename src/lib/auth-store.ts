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
  try {
    console.log("[auth-store] saveSession token:", data.token ? data.token.slice(0, 12) + "..." : "EMPTY/UNDEFINED");
    console.log("[auth-store] saveSession user:", data.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    console.log("[auth-store] saveSession OK, localStorage now:", localStorage.getItem(SESSION_KEY)?.slice(0, 80));
  } catch (e) {
    console.error("[auth-store] saveSession FAILED:", e);
  }
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null; // SSR guard
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    console.log("[auth-store] loadSession raw:", raw ? raw.slice(0, 100) + "..." : "NULL");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    console.log("[auth-store] loadSession parsed token:", parsed.token ? parsed.token.slice(0, 12) + "..." : "EMPTY/UNDEFINED");
    return parsed;
  } catch (e) {
    console.error("[auth-store] loadSession FAILED:", e);
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return; // SSR guard
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
