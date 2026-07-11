import { Link } from "@tanstack/react-router";
import { LocalePicker } from "./locale-picker";
import { CountdownCompact } from "./editorial-countdown";
import { LAUNCH_DATE, isWaitlist } from "@/lib/launch";
import { useT } from "@/lib/i18n";

export function SiteHeader({ variant = "landing" }: { variant?: "landing" | "preview" }) {
  const t = useT();
  const waitlist = variant === "landing" && isWaitlist();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/60 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground shadow-[0_6px_20px_-6px_oklch(0.78_0.16_70_/_0.6)]">
              <span className="font-display text-sm font-semibold leading-none">C</span>
            </div>
            <span className="font-display text-lg tracking-[-0.02em]">Cortexia</span>
          </Link>
          {waitlist && (
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-amber-soft">
              <span className="size-1.5 rounded-full bg-amber pulse-soft" />
              {t("badge.prelaunch")}
              <span className="text-amber-soft/70">·</span>
              <CountdownCompact target={LAUNCH_DATE} />
            </span>
          )}
          {variant === "preview" && (
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-emerald">
              <span className="size-1.5 rounded-full bg-emerald pulse-soft" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {variant === "preview" && (
            <Link to="/app" className="hidden sm:inline text-xs text-muted-foreground hover:text-foreground transition">
              {t("nav.open_app")}
            </Link>
          )}
          <LocalePicker />
        </div>
      </div>
    </header>
  );
}
