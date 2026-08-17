import { useEffect, useState } from "react";

const STORAGE_KEY = "cortexia:onboarded";

export function useOnboarding() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      const id = window.setTimeout(() => setOpen(true), 500);
      return () => window.clearTimeout(id);
    }
  }, []);
  return { open, setOpen };
}
