"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { iconForParam } from "@/routes/app.models.$slug";
import type { Model, ParamSpec } from "@/lib/models";

type ParamEditorProps = {
  p: ParamSpec;
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
};

export function ParamIconButton({
  p,
  state,
  setState,
}: {
  p: ParamSpec;
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  const t = useT();
  const key = p.key;
  const Icon = iconForParam(key, p.kind);
  const label = p.label;

  let preview: string | null = null;
  if (p.kind === "select") preview = String(state[p.key] ?? "");
  else if (p.kind === "slider")
    preview = `${state[p.key] ?? p.default}${p.suffix ?? ""}`;
  else if (p.kind === "toggle") preview = state[p.key] ? t("playground.toggle_on") : null;

  const uploadCount = p.kind === "upload" && "multiple" in p ? ((state[p.key] as File[]) ?? []).length : 0;

  const isActive =
    (p.kind === "toggle" && !!state[p.key]) ||
    (p.kind === "select" && p.options[0] !== state[p.key]) ||
    (p.kind === "slider" && state[p.key] !== p.default) ||
    (p.kind === "upload" && uploadCount > 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border h-8 px-2.5 text-xs transition cursor-pointer",
            isActive
              ? "border-amber/60 bg-amber/10 text-amber-soft"
              : "border-border bg-surface-2/40 text-muted-foreground hover:text-foreground hover:border-border-strong",
          )}
          title={label}
        >
          <Icon className="size-3.5" />
          {preview && (
            <span className="font-mono text-[10px] uppercase tracking-wider">{preview}</span>
          )}
          {p.kind === "upload" && uploadCount > 0 && (
            <span className="inline-flex items-center justify-center size-4 rounded-full bg-amber text-[9px] font-bold text-primary-foreground">
              {uploadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 bg-surface-1/95 backdrop-blur border-border"
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon className="size-4 text-amber" />
          <div className="text-xs font-medium">{label}</div>
        </div>
        <ParamEditor p={p} state={state} setState={setState} />
      </PopoverContent>
    </Popover>
  );
}

function UploadParamEditor({
  p,
  state,
  setState,
}: {
  p: Extract<ParamSpec, { kind: "upload" }>;
  state: Record<string, unknown>;
  setState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  const t = useT();
  const files = (state[p.key] as File[]) ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    setState((s) => ({
      ...s,
      [p.key]: p.multiple ? [...((s[p.key] as File[]) ?? []), ...newFiles] : newFiles,
    }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function removeFile(index: number) {
    setState((s) => ({
      ...s,
      [p.key]: ((s[p.key] as File[]) ?? []).filter((_, i) => i !== index),
    }));
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "rounded-xl border px-3 py-6 text-center text-xs cursor-pointer transition",
          files.length === 0 && !isDragOver ? "border-dashed" : "border-solid",
          files.length > 0 || isDragOver
            ? "border-amber/60 bg-amber/5 text-amber-soft"
            : "border-border bg-surface-0/40 text-muted-foreground hover:border-amber/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={p.accepts}
          multiple={p.multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {files.length > 0 ? (
          <div className="space-y-1">
            <Upload className="size-4 mx-auto text-amber" />
            <span>
              {files.length} {t("playground.files_selected")}
            </span>
          </div>
        ) : (
          <span>{t("playground.upload_text")}</span>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-surface-2/40 px-2.5 py-1.5 text-[11px]">
              <span className="truncate text-foreground">{f.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParamEditor({
  p,
  state,
  setState,
}: ParamEditorProps) {
  const t = useT();
  if (p.kind === "upload") {
    return <UploadParamEditor p={p} state={state} setState={setState} />;
  }
  if (p.kind === "select") {
    const val = state[p.key] as string;
    return (
      <div className="flex flex-wrap gap-1.5">
        {p.options.map((o) => (
          <button
            key={o}
            onClick={() => setState((s) => ({ ...s, [p.key]: o }))}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition cursor-pointer",
              val === o
                ? "border-amber/60 bg-amber/15 text-amber-soft"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (p.kind === "slider") {
    const val = state[p.key] as number;
    return (
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">
            {p.min}
            {p.suffix ?? ""} – {p.max}
            {p.suffix ?? ""}
          </span>
          <span className="font-mono text-xs">
            {val}
            {p.suffix ?? ""}
          </span>
        </div>
        <input
          type="range"
          min={p.min}
          max={p.max}
          step={p.step}
          value={val}
          onChange={(e) => setState((s) => ({ ...s, [p.key]: parseFloat(e.target.value) }))}
          className="w-full accent-amber h-1.5 appearance-none rounded-full bg-surface-3 cursor-pointer"
        />
      </div>
    );
  }
  if (p.kind === "seed") {
    const val = state[p.key] as number | undefined;
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={val ?? ""}
          placeholder={t("playground.seed_placeholder")}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              [p.key]: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
            }))
          }
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <button
          type="button"
          onClick={() => setState((s) => ({ ...s, [p.key]: Math.floor(Math.random() * 0xffffffff) }))}
          className="shrink-0 rounded-xl border border-border bg-surface-0/60 px-3 py-2 text-xs hover:border-amber/50 hover:bg-amber/5 transition"
          title={t("playground.seed_tooltip")}
        >
          🎲
        </button>
      </div>
    );
  }
  if (p.kind === "longtext") {
    const val = (state[p.key] as string) ?? "";
    return (
      <textarea
        value={val}
        onChange={(e) => setState((s) => ({ ...s, [p.key]: e.target.value }))}
        rows={4}
        placeholder={("placeholder" in p ? (p as any).placeholder : undefined) || ""}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono outline-none focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background resize-none"
      />
    );
  }
  if (p.kind === "toggle") {
    const val = !!state[p.key];
    return (
      <button
        onClick={() => setState((s) => ({ ...s, [p.key]: !val }))}
        className="w-full flex items-center justify-between rounded-lg bg-surface-2/40 px-3 py-2 cursor-pointer"
      >
        <span className="text-xs">{p.label}</span>
        <span
          className={cn(
            "relative h-5 w-9 rounded-full transition",
            val ? "bg-amber" : "bg-surface-3",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-4 rounded-full bg-background transition-transform",
              val ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </span>
      </button>
    );
  }
  return null;
}
