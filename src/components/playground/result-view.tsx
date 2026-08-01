import { RefreshCw, Download, Settings2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { PriceDisplay } from "@/components/price-display";
import { proxiedUrl } from "@/lib/storage/r2";
import type { Result } from "@/routes/app.models.$slug";

type ResultViewProps = {
  result: Result;
  onRegenerate: () => void;
};

export function ResultView({ result, onRegenerate }: ResultViewProps) {
  const t = useT();
  const hasResult = !!result.resultUrl;
  const isImage = result.model.category === "image";
  const isVideo = result.model.category === "video";
  const isAudio = result.model.category === "audio";
  const displayUrl = proxiedUrl(result.resultUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div className="flex items-center justify-center min-w-0">
        <div
          className={cn(
            "surface-gradient-border rounded-2xl overflow-hidden relative",
            "h-[min(58dvh,520px)] max-w-full w-auto",
            !hasResult && "aspect-square",
          )}
          style={
            hasResult
              ? undefined
              : { background: `linear-gradient(135deg, var(--surface-2), var(--background))` }
          }
        >
          {hasResult && isImage && (
            <img
              src={displayUrl}
              alt={result.prompt}
              className="w-full h-full object-contain"
            />
          )}
          {hasResult && isVideo && (
            <video
              src={displayUrl}
              controls
              className="w-full h-full object-contain"
            />
          )}
          {hasResult && isAudio && (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
              <audio src={displayUrl} controls className="w-full max-w-xs" />
            </div>
          )}
          {!hasResult && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <div className="rounded-full bg-foreground/60 backdrop-blur px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-background/90 truncate">
              {result.model.category}
            </div>
            <div className="rounded-full bg-foreground/60 backdrop-blur px-2 py-1 shrink-0 text-background/90">
              <PriceDisplay usd={result.cost} className="text-[10px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 min-w-0">
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            {t("history.prompt")}
          </div>
          <div className="mt-1.5 text-sm text-foreground/90 leading-relaxed line-clamp-4">
            {result.prompt}
          </div>
        </div>
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            {t("playground.params")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.state).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                <Settings2 className="size-3" /> {k}: {String(v)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/40 px-3 py-2 text-xs hover:border-amber/40 transition cursor-pointer"
          >
            <RefreshCw className="size-3.5" /> {t("playground.regenerate")}
          </button>
          {hasResult && (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-95 transition"
            >
              <Download className="size-3.5" /> {t("playground.download")}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
