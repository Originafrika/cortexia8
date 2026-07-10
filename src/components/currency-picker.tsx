import { CURRENCIES, useCurrencyStore, type CurrencyCode } from "@/lib/currency";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CurrencyPicker({ className }: { className?: string }) {
  const code = useCurrencyStore((s) => s.code);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [open, setOpen] = useState(false);
  const current = CURRENCIES[code];

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground/80 hover:text-foreground hover:border-border-strong transition-colors"
      >
        <span aria-hidden>{current.flag}</span>
        <span>{current.code}</span>
        <ChevronDown className="size-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-popover shadow-2xl shadow-black/50 p-1 z-50 animate-in fade-in-0 zoom-in-95">
          {Object.values(CURRENCIES).map((c) => (
            <button
              key={c.code}
              onMouseDown={(e) => { e.preventDefault(); setCurrency(c.code as CurrencyCode); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-surface-2/70 transition-colors",
                c.code === code && "bg-surface-2/50"
              )}
            >
              <span className="flex items-center gap-3">
                <span aria-hidden>{c.flag}</span>
                <span className="font-mono text-xs uppercase tracking-wider">{c.code}</span>
                <span className="text-muted-foreground text-xs">{c.name}</span>
              </span>
              {c.code === code && <Check className="size-4 text-amber" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
