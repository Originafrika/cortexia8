import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Cell = { label: string; value: number };

function getTime(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function EditorialCountdown({ target }: { target: Date }) {
  const [t, setT] = useState(() => getTime(target));
  useEffect(() => {
    const id = setInterval(() => setT(getTime(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: Cell[] = [
    { label: "jours", value: t.days },
    { label: "heures", value: t.hours },
    { label: "minutes", value: t.minutes },
    { label: "secondes", value: t.seconds },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-amber pulse-soft" />
        Lancement — 1er août
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {cells.map((c) => (
          <div key={c.label} className="relative">
            <div className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.04em] tabular text-foreground">
              <FlipDigit value={c.value} />
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlipDigit({ value }: { value: number }) {
  const shown = String(value).padStart(2, "0");
  return (
    <span className="inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={shown}
          initial={{ y: "40%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-40%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {shown}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
