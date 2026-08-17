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
import { getModel, type ParamSpec, type Model } from "@/lib/models";
import { getPrimaryParams } from "@/components/canvas/node-params-data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ModelCategory } from "@/lib/models";

/**
 * Renders a single parameter field.
 */
export function ParamField({
  p,
  value,
  onChange,
  disabled,
  compact,
}: {
  p: ParamSpec;
  value: Record<string, unknown>;
  onChange: (key: string, v: unknown) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const t = useT();

  if (p.kind === "prompt" || p.kind === "longtext") {
    const v = (value["prompt"] as string | undefined) ?? "";
    return (
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">{p.label}</Label>
        <Textarea
          rows={compact ? 2 : 3}
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
          {p.multiple ? t("inspector.drag_multi") : t("inspector.drag_single")}
          <input
            type="file"
            className="hidden"
            accept={p.accepts}
            multiple={p.multiple}
            disabled={disabled}
          />
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
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(p.options ?? []).map((o) => (
              <SelectItem key={o} value={o} className="text-xs">
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (p.kind === "slider") {
    const v = (value[p.key] as number | undefined) ?? p.default ?? p.min ?? 0;
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
        <div className="flex gap-2">
          <Input
            value={v}
            onChange={(e) => onChange("seed", e.target.value)}
            placeholder={t("inspector.seed_placeholder")}
            disabled={disabled}
            className="font-mono text-xs h-9"
          />
          <button
            type="button"
            onClick={() => onChange("seed", String(Math.floor(Math.random() * 999999)))}
            disabled={disabled}
            className="shrink-0 size-8 rounded-md border border-border bg-surface-1 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition disabled:opacity-50"
            title="Random seed"
          >
            🎲
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Renders all params for a model.
 */
export function NodeParams({
  model,
  params,
  onChange,
  disabled,
  compact,
}: {
  model: Model;
  params: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  if ((model.params ?? []).length === 0) {
    return <div className="text-xs text-muted-foreground py-2">No configurable parameters</div>;
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {(model.params ?? []).map((p, i) => (
        <ParamField
          key={i}
          p={p}
          value={params}
          onChange={onChange}
          disabled={disabled}
          compact={compact}
        />
      ))}
    </div>
  );
}
