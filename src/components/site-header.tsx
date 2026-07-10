import { Link } from "@tanstack/react-router";
import { CurrencyPicker } from "./currency-picker";

export function SiteHeader({ variant = "landing" }: { variant?: "landing" | "preview" }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/60 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.78_0.16_70_/_0.6)]">
            <span className="font-display text-sm font-semibold leading-none">C</span>
          </div>
          <span className="font-display text-lg tracking-[-0.02em]">Cortexia</span>
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {variant === "preview" ? "Preview" : "Waitlist"}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {variant === "preview" && (
            <>
              <Link to="/app" className="hidden sm:inline text-xs text-muted-foreground hover:text-foreground transition">
                Ouvrir l'app
              </Link>
            </>
          )}
          <CurrencyPicker />
        </div>
      </div>
    </header>
  );
}
