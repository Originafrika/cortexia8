import { useMemo } from "react";
import { useCanvasStore } from "@/lib/canvas-store";
import { categoryAccent, portLabel, portsForCategory } from "@/lib/canvas-types";
import { PriceDisplay } from "@/components/price-display";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getModel, type ParamSpec, type Model } from "@/lib/models";
import {
  ChevronRight,
  Copy,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  Download,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InspectorPanel({ onClose }: { onClose: () => void }) {
  const selectedId = useCanvasStore((s) => s.selectedNodeId);
  const node = useCanvasStore((s) => s.nodes.find((n) => n.id === selectedId) ?? null);
  const readOnly = useCanvasStore((s) => s.readOnly);

  if (!node) {
    return (
      <div className="flex h-full flex-col gap-4 p-4 text-sm text-muted-foreground">
        <PanelHeader onClose={onClose} title="Inspecteur" subtitle="Aucune sélection" />
        <div className="mt-8 grid place-items-center text-center">
          <div className="grid place-items-center size-12 rounded-2xl border border-dashed border-border text-muted-foreground">
            <Settings2 className="size-4" />
          </div>
          <div className="mt-3 text-sm">Sélectionne un nœud</div>
          <div className="mt-1 text-xs text-muted-foreground max-w-[220px]">
            Clique sur un nœud du canvas pour voir ses paramètres, son coût et son résultat.
          </div>
        </div>
      </div>
    );
  }

  const m = getModel(node.data.modelSlug);
  if (!m) return null;
  const accent = categoryAccent(node.data.category);
  const ports = portsForCategory(node.data.category);

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        onClose={onClose}
        title={node.data.modelName}
        subtitle={`${node.data.provider} · ${node.data.category}`}
        accent={accent}
      />
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Status + price + actions */}
        <section className="grid grid-cols-2 gap-2">
          <Stat label="Coût" value={<PriceDisplay usd={node.data.priceUSD} className="text-base" emphasize />} />
          <Stat
            label="Statut"
            value={<StatusBadge status={node.data.status} progress={node.data.progress} step={node.data.step} />}
          />
        </section>

        <section className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => void useCanvasStore.getState().runNode(node.id)}
            disabled={readOnly || node.data.status === "running"}
            className="flex-1"
          >
            {node.data.status === "running" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : node.data.status === "done" ? (
              <RefreshCw className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {node.data.status === "running"
              ? "En cours…"
              : node.data.status === "done"
                ? "Re-lancer"
                : "Lancer"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              useCanvasStore.getState().updateNodeParams(node.id, initStateForModel(m));
            }}
            disabled={readOnly}
            title="Réinitialiser les paramètres"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => useCanvasStore.getState().removeNode(node.id)}
            disabled={readOnly}
            className="text-muted-foreground hover:text-foreground"
            title="Supprimer le nœud"
          >
            <Trash2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => useCanvasStore.getState().duplicateBranch([node.id])}
            disabled={readOnly}
            title="Dupliquer le nœud"
          >
            <Copy className="size-3.5" />
          </Button>
        </section>

        <Separator />

        {/* Ports */}
        <section>
          <SectionTitle>Ports</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <PortPill label="Entrée" types={ports.in} />
            <PortPill label="Sortie" types={[ports.out]} />
          </div>
        </section>

        <Separator />

        {/* Parameters */}
        <section>
          <SectionTitle>Paramètres</SectionTitle>
          <div className="mt-2 space-y-3">
            {m.params.length === 0 && (
              <div className="text-xs text-muted-foreground">Aucun paramètre.</div>
            )}
            {m.params.map((p, i) => (
              <ParamField
                key={i}
                p={p}
                value={node.data.params}
                onChange={(k, v) =>
                  useCanvasStore.getState().updateNodeParams(node.id, { [k]: v })
                }
                disabled={readOnly}
              />
            ))}
          </div>
        </section>

        <Separator />

        {/* Result preview */}
        <section>
          <SectionTitle>Résultat</SectionTitle>
          <div className="mt-2">
            {node.data.status !== "done" || !node.data.result ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-0/40 px-3 py-6 text-center text-xs text-muted-foreground">
                {node.data.status === "running"
                  ? "Génération en cours…"
                  : node.data.status === "error"
                    ? "Échec de la génération."
                    : "Lance le nœud pour voir le résultat."}
              </div>
            ) : (
              <ResultPreview
                category={node.data.category}
                result={node.data.result}
                priceUSD={node.data.priceUSD}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PanelHeader({
  onClose,
  title,
  subtitle,
  accent,
}: {
  onClose: () => void;
  title: string;
  subtitle?: string;
  accent?: ReturnType<typeof categoryAccent>;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 border-b border-border", accent?.bg)}>
      <div className="grid place-items-center size-9 rounded-xl border border-border bg-surface-0/60 shrink-0">
        <Sparkles className="size-4 text-amber" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{title}</div>
        {subtitle && (
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground truncate">
            {subtitle}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="grid place-items-center size-7 rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground transition cursor-pointer"
        aria-label="Fermer l'inspecteur"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1/60 px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({
  status,
  progress,
  step,
}: {
  status: "idle" | "running" | "done" | "error" | "unconfigured" | "ready" | "completed" | "failed";
  progress: number;
  step: string;
}) {
  if (status === "running") {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-amber-soft text-xs">
          <Loader2 className="size-3 animate-spin" /> {step || "En cours…"}
        </span>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full bg-gradient-to-r from-amber to-amber-soft transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald text-xs">
        <Check className="size-3" /> Prêt
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-destructive text-xs">
        <AlertTriangle className="size-3" /> Échec
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">En attente</span>;
}

function PortPill({ label, types }: { label: string; types: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface-0/40 px-2.5 py-1.5 flex items-center gap-2">
      <ChevronRight className="size-3 text-muted-foreground" />
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="ml-auto text-[11px]">
        {types.map((t) => portLabel(t as never)).join(" / ")}
      </span>
    </div>
  );
}

function ParamField({
  p,
  value,
  onChange,
  disabled,
}: {
  p: ParamSpec;
  value: Record<string, unknown>;
  onChange: (key: string, v: unknown) => void;
  disabled?: boolean;
}) {
  if (p.kind === "prompt") {
    const v = (value["prompt"] as string | undefined) ?? "";
    return (
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">{p.label}</Label>
        <Textarea
          rows={3}
          value={v}
          onChange={(e) => onChange("prompt", e.target.value)}
          placeholder={p.placeholder}
          disabled={disabled}
          className="text-sm"
        />
      </div>
    );
  }
  if (p.kind === "upload") {
    return (
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">{p.label}</Label>
        <label
          className={cn(
            "block rounded-lg border border-dashed border-border bg-surface-0/40 px-3 py-4 text-center text-[11px] text-muted-foreground transition",
            !disabled && "hover:border-amber/40 cursor-pointer",
          )}
        >
          {p.multiple ? "Glisse des fichiers ou clique" : "Glisse un fichier ou clique"}
          <input type="file" className="hidden" accept={p.accepts} multiple={p.multiple} disabled={disabled} />
        </label>
      </div>
    );
  }
  if (p.kind === "select") {
    const v = (value[p.key] as string | undefined) ?? p.options[0];
    return (
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">{p.label}</Label>
        <Select value={v} onValueChange={(nv) => onChange(p.key, nv)} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {p.options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (p.kind === "slider") {
    const v = (value[p.key] as number | undefined) ?? p.default;
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">{p.label}</Label>
          <span className="font-mono text-[11px] tabular text-foreground">
            {v}
            {p.suffix ?? ""}
          </span>
        </div>
        <Slider
          min={p.min}
          max={p.max}
          step={p.step}
          value={[v]}
          onValueChange={(vals) => onChange(p.key, vals[0])}
          disabled={disabled}
        />
      </div>
    );
  }
  if (p.kind === "toggle") {
    const v = !!value[p.key];
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-0/40 px-3 py-2">
        <Label className="text-xs">{p.label}</Label>
        <Switch checked={v} onCheckedChange={(c) => onChange(p.key, c)} disabled={disabled} />
      </div>
    );
  }
  if (p.kind === "seed") {
    const v = (value["seed"] as string | undefined) ?? "";
    return (
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">{p.label}</Label>
        <Input
          value={v}
          onChange={(e) => onChange("seed", e.target.value)}
          placeholder="aléatoire"
          disabled={disabled}
          className="font-mono"
        />
      </div>
    );
  }
  return null;
}

function ResultPreview({
  category,
  result,
  priceUSD,
}: {
  category: Model["category"];
  result: NonNullable<ReturnType<typeof useCanvasStore.getState>["nodes"][number]["data"]["result"]>;
  priceUSD: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-0/40 overflow-hidden">
      {category === "image" && result.kind === "image" && (
        <img src={result.url} alt="" className="w-full aspect-video object-cover" />
      )}
      {category === "video" && result.kind === "video" && (
        <div
          className="w-full aspect-video grid place-items-center"
          style={{ background: "linear-gradient(135deg, oklch(0.45 0.18 290), oklch(0.18 0.01 60))" }}
        >
          <Play className="size-6 text-white fill-white" />
        </div>
      )}
      {category === "audio" && result.kind === "audio" && (
        <div className="px-3 py-4 flex items-center gap-3">
          <div className="grid place-items-center size-9 rounded-full bg-emerald/20 text-emerald">
            <Play className="size-3.5 fill-current" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Voix prête
          </div>
        </div>
      )}
      {category === "text" && result.kind === "text" && (
        <div className="px-3 py-3 text-[12px] leading-relaxed text-foreground/90">
          {result.text}
        </div>
      )}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          Facturé
        </span>
        <div className="flex items-center gap-2">
          <PriceDisplay usd={priceUSD} className="text-xs" emphasize />
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] hover:border-amber/40 transition"
          >
            <Download className="size-2.5" /> Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}

function initStateForModel(m: Model): Record<string, unknown> {
  const init: Record<string, unknown> = {};
  m.params.forEach((p) => {
    if (p.kind === "slider") init[p.key] = p.default;
    if (p.kind === "select") init[p.key] = p.options[0];
    if (p.kind === "toggle") init[p.key] = !!p.default;
  });
  return init;
}
