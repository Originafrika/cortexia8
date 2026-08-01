// src/components/playground/chat-input.tsx
import { ArrowUp, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PriceDisplay } from "@/components/price-display";
import { ParamIconButton } from "./param-editor";
import type { Model, ParamSpec } from "@/lib/models";

type Props = {
  model: Model;
  iconParams: ParamSpec[];
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  prompt: string;
  setPrompt: (v: string) => void;
  onSend: () => void;
  isGenerating: boolean;
  currentPrice: number;
};

export function ChatInput({
  model,
  iconParams,
  state,
  setState,
  prompt,
  setPrompt,
  onSend,
  isGenerating,
  currentPrice,
}: Props) {
  const t = useT();
  const canSend = prompt.trim().length >= 3 && !isGenerating;

  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/70 p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          rows={1}
          placeholder={t("playground.placeholder")}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background placeholder:text-muted-foreground/70 rounded-md min-h-[36px] max-h-[120px]"
          style={{ height: "auto", overflow: "hidden" }}
          onInput={(e) => {
            const target = e.currentTarget;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className="shrink-0 inline-flex items-center justify-center size-9 rounded-xl bg-amber text-primary-foreground hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {iconParams.map((p, i) => (
          <ParamIconButton key={i} p={p} state={state} setState={setState} />
        ))}
        <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <PriceDisplay usd={currentPrice} className="text-[10px] text-foreground" />
        </div>
      </div>
    </div>
  );
}
