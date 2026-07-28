import { Settings2, ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { PriceDisplay } from "@/components/price-display";
import { ParamIconButton } from "./param-editor";
import type { Model, ParamSpec } from "@/lib/models";
import type { Status } from "@/routes/app.models.$slug";

type PromptBarProps = {
  model: Model;
  iconParams: ParamSpec[];
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  prompt: string;
  setPrompt: (v: string) => void;
  hasPrompt: boolean;
  onGenerate: () => void;
  status: Status;
  progress: number;
  currentPrice: number;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  canGenerate: boolean;
};

export function PromptBar({
  model,
  iconParams,
  state,
  setState,
  prompt,
  setPrompt,
  hasPrompt,
  onGenerate,
  status,
  progress,
  currentPrice,
  showAdvanced,
  onToggleAdvanced,
  canGenerate,
}: PromptBarProps) {
  const t = useT();
  const promptSpec = model.params.find((p) => p.kind === "prompt");
  const placeholder =
    (promptSpec && "placeholder" in promptSpec && promptSpec.placeholder) ||
    t("playground.placeholder");

  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/70 p-3">
      {hasPrompt ? (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onGenerate();
            }
          }}
          rows={2}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          {t("playground.helper")}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {iconParams.map((p, i) => (
          <ParamIconButton key={i} p={p} state={state} setState={setState} />
        ))}

        {model.params.some((p) => "advanced" in p && p.advanced) && (
          <button
            type="button"
            onClick={onToggleAdvanced}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border h-8 px-2.5 text-[11px] transition cursor-pointer",
              showAdvanced
                ? "border-amber/60 bg-amber/10 text-amber-soft"
                : "border-border bg-surface-2/40 text-muted-foreground hover:text-foreground hover:border-border-strong",
            )}
          >
            <Settings2 className="size-3" />
            <span className="hidden sm:inline">{showAdvanced ? t("playground.advanced") : t("playground.simple")}</span>
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <span>{t("playground.cost")}</span>
            <PriceDisplay usd={currentPrice} className="text-[11px] text-foreground" />
          </div>
          <button
            onClick={onGenerate}
            disabled={status === "loading" || !canGenerate}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber px-4 h-9 text-sm font-medium text-primary-foreground hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="hidden sm:inline">{progress}%</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{t("playground.generate")}</span>
                <ArrowUp className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
