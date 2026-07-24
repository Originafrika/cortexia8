import { cn } from "@/lib/utils";

/** Full-page ambient background: slow-drifting warm mesh gradient over deep near-black. */
export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.55] mesh-anim"
        style={{
          background: `
            radial-gradient(60% 45% at 20% 20%, color-mix(in oklab, var(--amber) 28%, transparent), transparent 60%),
            radial-gradient(50% 40% at 80% 10%, color-mix(in oklab, var(--amber-soft) 22%, transparent), transparent 60%),
            radial-gradient(70% 55% at 70% 90%, color-mix(in oklab, var(--surface-3) 35%, transparent), transparent 70%),
            radial-gradient(40% 30% at 10% 90%, color-mix(in oklab, var(--emerald) 10%, transparent), transparent 60%)
          `,
        }}
      />
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}
