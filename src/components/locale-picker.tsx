import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { CURRENCIES, useCurrencyStore, type CurrencyCode } from "@/lib/currency";
import { CURRENCY_TO_LANG, LANGS, useLocaleStore, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Combined currency + language picker.
 * - Changing currency updates the language automatically (unless the user
 *   overrode it).
 * - The user can still pick a language independently in the right column.
 */
export function LocalePicker({ className }: { className?: string }) {
  const code = useCurrencyStore((s) => s.code);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const lang = useLocaleStore((s) => s.lang);
  const setLang = useLocaleStore((s) => s.setLang);
  const setFromCurrency = useLocaleStore((s) => s.setFromCurrency);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = CURRENCIES[code];
  const curLang = LANGS[lang];

  function onCurrency(c: CurrencyCode) {
    setCurrency(c);
    setFromCurrency(CURRENCY_TO_LANG[c]);
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground/80 hover:text-foreground hover:border-border-strong transition-colors"
        aria-label="Devise et langue"
      >
        <span aria-hidden>{current.flag}</span>
        <span>{current.code}</span>
        <span className="text-muted-foreground/70">·</span>
        <span className="normal-case tracking-normal">{curLang.native}</span>
        <ChevronDown className="size-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover shadow-2xl shadow-black/60 p-2 z-50 animate-in fade-in-0 zoom-in-95">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Devise
              </div>
              <div className="max-h-64 overflow-y-auto">
                {Object.values(CURRENCIES).map((cur) => (
                  <button
                    key={cur.code}
                    onClick={() => onCurrency(cur.code)}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-2/70 transition-colors",
                      cur.code === code && "bg-surface-2/50",
                    )}
                  >
                    <span aria-hidden>{cur.flag}</span>
                    <span className="font-mono uppercase tracking-wider">{cur.code}</span>
                    <span className="ml-auto text-muted-foreground truncate">{cur.name}</span>
                    {cur.code === code && <Check className="size-3.5 text-amber shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-l border-border pl-2">
              <div className="px-2 py-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                <Globe className="size-3" /> Langue
              </div>
              <div>
                {(Object.keys(LANGS) as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-2/70 transition-colors",
                      l === lang && "bg-surface-2/50",
                    )}
                  >
                    <span aria-hidden>{LANGS[l].flag}</span>
                    <span>{LANGS[l].native}</span>
                    {l === lang && <Check className="ml-auto size-3.5 text-amber" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 rounded-lg bg-surface-2/40 p-2 text-[10px] leading-relaxed text-muted-foreground">
                La devise règle la langue par défaut. Tu peux dissocier les deux à tout moment.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
