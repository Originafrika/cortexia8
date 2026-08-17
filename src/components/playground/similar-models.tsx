import { useMemo } from "react";
import { useT } from "@/lib/i18n";
import { MODELS, basePrice, unitLabel } from "@/lib/models";
import { ModelCard } from "@/components/model-card";
import type { Model } from "@/lib/models";

type SimilarModelsProps = {
  model: Model;
};

export function SimilarModels({ model }: SimilarModelsProps) {
  const t = useT();
  const similar = useMemo(
    () => MODELS.filter((m) => m.category === model.category && m.slug !== model.slug).slice(0, 3),
    [model.category, model.slug],
  );

  if (similar.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
        {t("playground.similar")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((m) => (
          <ModelCard key={m.slug} model={m} compact />
        ))}
      </div>
    </div>
  );
}
