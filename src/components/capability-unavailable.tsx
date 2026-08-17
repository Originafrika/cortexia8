import { Clock3, Sparkles } from "lucide-react";
import { capabilityLabel, type Capability, capabilityState } from "@/lib/capabilities";
import { useT } from "@/lib/i18n";

export function CapabilityUnavailable({
  capability,
  className = "",
}: {
  capability: Capability;
  className?: string;
}) {
  const t = useT();
  const state = capabilityState(capability);
  const label = capabilityLabel(capability);
  const title =
    state === "beta"
      ? `${label} · ${t("capability.beta")}`
      : `${label} · ${t("capability.coming_soon")}`;
  const description =
    state === "beta" ? t("capability.beta_desc") : t("capability.coming_soon_desc");

  return (
    <div
      className={`mx-auto grid min-h-[min(60vh,520px)] max-w-2xl place-items-center px-5 py-16 ${className}`}
    >
      <div className="w-full text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-amber/30 bg-amber/10 text-amber">
          {state === "beta" ? <Sparkles className="size-6" /> : <Clock3 className="size-6" />}
        </div>
        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("capability.label")}
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-[-0.03em]">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
