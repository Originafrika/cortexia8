import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MODELS, basePrice, type Model, type ModelCategory } from "@/lib/models";
import { PriceDisplay } from "@/components/price-display";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Search, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHistory, type HistoryItem } from "@/lib/api/history";
import { useT } from "@/lib/i18n";
import { loadSession } from "@/lib/auth-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { proxiedUrl } from "@/lib/storage/r2";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Cortexia — Generation History" },
      { name: "description", content: "Review your past AI generation jobs on Cortexia — prompts, models used, costs, and preview outputs." },
    ],
  }),
  component: HistoryPage,
});

type DisplayItem = {
  id: string;
  model: Model;
  prompt: string;
  date: string;
  cost: number;
  ratio: string;
  tint: string;
  previewUrl: string | null;
  status: string;
};

const TINTS = ["#3d2a1e", "#2a1e3d", "#1e3d2a", "#3d1e2a", "#2a3d1e", "#1e2a3d"];

function formatRelative(dateStr: string, t: (key: string) => string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t("time.now");
  if (diffMin < 60) return t("time.minutes").replace("{n}", String(diffMin));
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t("time.hours").replace("{n}", String(diffH));
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return t("time.days").replace("{n}", String(diffD));
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function HistoryPage() {
  const t = useT();
  const navigate = useNavigate();
  const CATS: { key: ModelCategory | "all"; label: string }[] = [
    { key: "all", label: t("cat.all") },
    { key: "image", label: t("cat.image") },
    { key: "video", label: t("cat.video") },
    { key: "audio", label: t("cat.audio") },
    { key: "text", label: t("cat.text") },
  ];
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DisplayItem | null>(null);
  const [cat, setCat] = useState<ModelCategory | "all">("all");
  const [q, setQ] = useState("");
  const [modelSlug, setModelSlug] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const result = await getHistory({ data: { limit: 100, sessionToken: loadSession()?.token } });
        const mapped: DisplayItem[] = result.items.map((item: HistoryItem, i: number) => {
          const model = MODELS.find((m) => m.slug === item.modelSlug) ?? MODELS[0];
          return {
            id: item.id,
            model,
            prompt: item.prompt,
            date: formatRelative(item.date, t),
            cost: item.cost || basePrice(model) * (model.unit === "second" ? 5 : 1),
            ratio: item.modelCategory === "video" ? "aspect-[9/16]" : item.modelCategory === "audio" ? "aspect-[4/3]" : "aspect-square",
            tint: TINTS[i % TINTS.length],
            previewUrl: item.previewUrl,
            status: item.status,
          };
        });
        setItems(mapped);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const modelOptions = useMemo(() => {
    const set = new Map<string, Model>();
    items.forEach((it) => set.set(it.model.slug, it.model));
    return Array.from(set.values());
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      if (cat !== "all" && it.model.category !== cat) return false;
      if (modelSlug !== "all" && it.model.slug !== modelSlug) return false;
      if (
        term &&
        !it.prompt.toLowerCase().includes(term) &&
        !it.model.name.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [items, cat, modelSlug, q]);

  function copyPrompt(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <div className="mb-8 grid gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("history.title")}
          </div>
          <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">{t("history.subtitle")}</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {loading
              ? t("history.loading")
              : `${filtered.length === 1 ? t("history.count_one") : t("history.count_many").replace("{n}", String(filtered.length))} · ${items.length} ${t("history.count_total")}`}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("history.search")}
            aria-label="Search history"
            className="w-full sm:w-72 h-9 rounded-full border border-input bg-transparent pl-9 pr-4 py-2 text-sm focus:border-amber/40 focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCat(c.key);
              setModelSlug("all");
            }}
            aria-label={`Filter by ${c.label}`}
            aria-pressed={cat === c.key}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              cat === c.key
                ? "border-amber/60 bg-amber/15 text-amber-soft"
                : "border-border bg-surface-1/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("history.model")}
          </label>
          <Select value={modelSlug} onValueChange={setModelSlug}>
            <SelectTrigger className="w-[180px] h-8 rounded-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">{t("history.all")}</SelectItem>
              {modelOptions
                .filter((m) => cat === "all" || m.category === cat)
                .map((m) => (
                  <SelectItem key={m.slug} value={m.slug} className="text-xs">
                    {m.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="mt-16 text-center text-muted-foreground">
          <div className="font-display text-2xl mb-2">{t("history.loading")}</div>
          <div className="text-sm">{t("history.loading_sub")}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <div className="font-display text-2xl mb-2">{t("history.empty")}</div>
          <div className="text-sm">{t("history.empty_desc")}</div>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {filtered.map((it) => (
            <button
              key={it.id}
              onClick={() => setSelected(it)}
              aria-label={`${it.model.name}: ${it.prompt}`}
              className={
                "mb-3 block w-full break-inside-avoid group relative overflow-hidden rounded-xl border border-border " +
                it.ratio
              }
              style={{ background: `linear-gradient(135deg, ${it.tint}, oklch(0.14 0 0))` }}
            >
              {it.previewUrl ? (
                <img
                  src={proxiedUrl(it.previewUrl)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-foreground/80">
                {it.model.category}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all text-left">
                <div className="text-[11px] font-mono text-amber-soft truncate">
                  {it.model.name}
                </div>
                <div className="text-xs text-foreground/90 line-clamp-1">{it.prompt}</div>
                <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                  <span>{it.date}</span>
                  <PriceDisplay usd={it.cost} className="text-[10px]" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-surface-1 border-l border-border overflow-y-auto"
            >
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-surface-1/95 backdrop-blur">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("history.detail")}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close detail panel"
                  className="rounded-lg p-1 hover:bg-surface-2"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div
                className={"m-4 rounded-xl overflow-hidden " + selected.ratio}
                style={{ background: `linear-gradient(135deg, ${selected.tint}, oklch(0.14 0 0))` }}
              >
                {selected.previewUrl && (
                  <img
                    src={proxiedUrl(selected.previewUrl)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="px-4 pb-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{t("history.prompt")}</div>
                  <button
                    onClick={() => copyPrompt(selected.prompt)}
                    aria-label="Copy prompt"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-emerald" /> {t("history.copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" /> {t("history.copy")}
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-1 text-foreground/90 leading-relaxed">{selected.prompt}</div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">{t("history.model")}</div>
                    <div className="mt-1">{selected.model.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {selected.model.provider}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("history.cost")}</div>
                    <div className="mt-1">
                      <PriceDisplay usd={selected.cost} emphasize />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("history.date")}</div>
                    <div className="mt-1">{selected.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("history.category")}</div>
                    <div className="mt-1 capitalize">{selected.model.category}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (selected?.model) {
                      navigate({ to: `/app/models/${selected.model.slug}` });
                    }
                  }}
                  aria-label="Regenerate with these parameters"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
                >
                  <RefreshCw className="size-4" /> {t("history.regenerate")}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
