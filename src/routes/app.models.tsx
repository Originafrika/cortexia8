import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MODELS, type Model, type ModelCategory } from "@/lib/models";
import { ModelCard } from "@/components/model-card";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { isAdmin } from "@/lib/auth-store";

export const Route = createFileRoute("/app/models")({
  head: () => ({
    meta: [
      { title: "Cortexia — Models Catalog" },
      { name: "description", content: "Browse the full catalog of AI models available on Cortexia — image, video, audio, music, and text generation." },
    ],
  }),
  component: ModelsLayout,
});

function ModelsLayout() {
  const matchRoute = useMatchRoute();
  const onChild = matchRoute({ to: "/app/models/$slug" });

  if (onChild) {
    return <Outlet />;
  }

  return <ModelsCatalog />;
}

const CATS: { key: ModelCategory | "all"; labelKey: string }[] = [
  { key: "all", labelKey: "models.cat_all" },
  { key: "image", labelKey: "models.cat_image" },
  { key: "video", labelKey: "models.cat_video" },
  { key: "audio", labelKey: "models.cat_voice" },
  { key: "music", labelKey: "models.cat_music" },
  { key: "text", labelKey: "models.cat_text" },
];

const visibleCats = useMemo(() => {
  const admin = isAdmin();
  if (admin) return CATS;
  return CATS.filter((c) => c.key === "all" || c.key === "image" || c.key === "video");
}, []);

const PAGE_SIZE = 12;

export function ModelsCatalog() {
  const t = useT();
  const [cat, setCat] = useState<ModelCategory | "all">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "az">("newest");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const admin = isAdmin();
    return MODELS.filter(
      (m) =>
        (cat === "all" || m.category === cat) &&
        (admin || (m.category !== "text" && m.category !== "audio" && m.category !== "music")) &&
        (term === "" ||
          m.name.toLowerCase().includes(term) ||
          m.provider.toLowerCase().includes(term) ||
          m.blurb.toLowerCase().includes(term)),
    );
  }, [cat, q]);

  const sorted = useMemo(() => {
    const result = [...filtered];
    switch (sortBy) {
      case "newest":
        return result.sort((a, b) => b.order - a.order);
      case "price_asc":
        return result.sort((a, b) => a.priceUSD - b.priceUSD);
      case "price_desc":
        return result.sort((a, b) => b.priceUSD - a.priceUSD);
      case "az":
        return result.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return result;
    }
  }, [sortBy, filtered]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  useEffect(() => {
    setPage(1);
  }, [cat, q, sortBy]);
  const safePage = Math.min(page, pageCount);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
      <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("models.section")}
          </div>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-[-0.03em]">
            {t("models.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("models.subtitle")}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("models.search_placeholder")}
            aria-label="Search models"
            className="w-full sm:w-72 h-9 rounded-full border border-input bg-transparent pl-9 pr-4 py-2 text-sm focus:border-amber/40 focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {visibleCats.map((c) => {
          const active = cat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              aria-label={`Filter by ${t(c.labelKey)}`}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer",
                active
                  ? "border-amber/60 bg-amber/15 text-amber-soft"
                  : "border-border bg-surface-1/50 text-muted-foreground hover:text-foreground hover:border-border-strong",
              )}
            >
              {t(c.labelKey)}
            </button>
          );
        })}
        <div className="ml-auto text-xs text-muted-foreground font-mono">
          {sorted.length === 1 ? t("models.count_one") : t("models.count_many").replace("{n}", String(sorted.length))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="size-3" />
          <span>{t("models.sort")}</span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-full border border-border bg-surface-1/50 px-3 py-1.5 text-xs text-foreground focus:border-amber/40 focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none cursor-pointer"
        >
          <option value="newest">{t("models.sort_newest")}</option>
          <option value="price_asc">{t("models.sort_price_asc")}</option>
          <option value="price_desc">{t("models.sort_price_desc")}</option>
          <option value="az">{t("models.sort_az")}</option>
        </select>
      </div>

      {paged.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <div className="font-display text-2xl mb-2">{t("models.empty")}</div>
          <div className="text-sm">{t("models.empty_hint")}</div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((m) => (
              <ModelCard key={m.slug} model={m} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-1/50 px-3 py-1.5 text-xs disabled:opacity-40 hover:border-amber/40 transition cursor-pointer"
              >
                <ChevronLeft className="size-3.5" /> {t("models.prev")}
              </button>
              <div className="flex items-center gap-1 overflow-x-auto max-w-[300px]">
                {(() => {
                  const pageNumbers: (number | "ellipsis")[] = [];
                  if (pageCount <= 7) {
                    for (let i = 1; i <= pageCount; i++) pageNumbers.push(i);
                  } else {
                    pageNumbers.push(1);
                    if (safePage > 3) pageNumbers.push("ellipsis");
                    const start = Math.max(2, safePage - 1);
                    const end = Math.min(pageCount - 1, safePage + 1);
                    for (let i = start; i <= end; i++) pageNumbers.push(i);
                    if (safePage < pageCount - 2) pageNumbers.push("ellipsis");
                    pageNumbers.push(pageCount);
                  }
                  return pageNumbers.map((pageNum, idx) =>
                    pageNum === "ellipsis" ? (
                      <span key={`e${idx}`} className="px-1 text-xs text-muted-foreground font-mono">…</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        className={cn(
                          "size-8 shrink-0 rounded-full text-xs font-mono transition cursor-pointer",
                          safePage === pageNum
                            ? "bg-amber text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  );
                })()}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage === pageCount}
                aria-label="Next page"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-1/50 px-3 py-1.5 text-xs disabled:opacity-40 hover:border-amber/40 transition cursor-pointer"
              >
                {t("models.next")} <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
