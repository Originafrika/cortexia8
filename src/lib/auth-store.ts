const SESSION_KEY = "cortexia_session";

export interface StoredSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export function saveSession(data: { user: StoredSession["user"] }) {
  if (typeof window === "undefined") return; // SSR guard
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // silently ignore storage failures
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

export function clearSession() {
  if (typeof window === "undefined") return; // SSR guard
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
