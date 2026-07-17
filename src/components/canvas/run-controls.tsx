import { useCanvasStore } from "@/lib/canvas-store";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

export function RunControls({ className, compact }: Props) {
  const runAll = useCanvasStore((s) => s.runAll);
  const readOnly = useCanvasStore((s) => s.readOnly);
  const running = useCanvasStore((s) => s.nodes.some((n) => n.data.status === "running"));

  if (readOnly) return null;

  return (
    <button
      type="button"
      onClick={() => void runAll()}
      disabled={running}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition",
        compact ? "h-9 px-3.5 text-xs" : "h-9 px-4 text-sm",
        running
          ? "bg-amber/60 text-primary-foreground cursor-wait"
          : "bg-amber text-primary-foreground hover:opacity-95",
        "disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer",
        className,
      )}
      aria-label="Tout lancer"
    >
      {running ? (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          <span>Génération…</span>
        </>
      ) : (
        <>
          <Play className="size-3.5 fill-current" />
          <span>Tout lancer</span>
          <RotateCcw className="ml-1 size-3 opacity-60" />
        </>
      )}
    </button>
  );
}
