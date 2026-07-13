import { useCurrency, formatMoney } from "@/lib/currency";
import { useCountUp } from "@/lib/use-count-up";
import { cn } from "@/lib/utils";

type Props = {
  usd: number;
  className?: string;
  compact?: boolean;
  forceDecimals?: number;
  suffix?: string;
  emphasize?: boolean;
};

export function PriceDisplay({ usd, className, compact, forceDecimals, suffix, emphasize }: Props) {
  const c = useCurrency();
  const shown = useCountUp(usd, 320);
  return (
    <span
      className={cn("font-mono tabular", emphasize && "text-foreground", className)}
      aria-label={formatMoney(usd, c)}
    >
      {formatMoney(shown, c, { compact, forceDecimals })}
      {suffix ? <span className="text-muted-foreground ml-1">{suffix}</span> : null}
    </span>
  );
}
