const STORAGE_KEY = "cortexia-theme";

export function getInitialTheme(): "light" | "dark" {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export function initTheme() {
  if (typeof document === "undefined") return;
  const initial = getInitialTheme();
  document.documentElement.classList.toggle("light", initial === "light");
  document.documentElement.classList.toggle("dark", initial === "dark");
}
