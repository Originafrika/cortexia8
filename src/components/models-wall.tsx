import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Play, Music2, Mic, ImageIcon, X, ArrowRight } from "lucide-react";
import { WALL_ITEMS, type WallItem, type WallKind, type UseCase } from "@/lib/wall-data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const KIND_META: Record<WallKind, { icon: typeof Play; labelKey: string }> = {
  image: { icon: ImageIcon, labelKey: "wall.filters.image" },
  video: { icon: Play,      labelKey: "wall.filters.video" },
  music: { icon: Music2,    labelKey: "wall.filters.music" },
  voice: { icon: Mic,       labelKey: "wall.filters.voice" },
};

const USE_CASES: UseCase[] = ["ad", "ugc", "show", "film"];

export function ModelsWall() {
  const t = useT();
  const [kind, setKind] = useState<WallKind | "all">("all");
  const [useCase, setUseCase] = useState<UseCase | "all">("all");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<WallItem | null>(null);

  const filtered = useMemo(() => {
    return WALL_ITEMS.filter(
      (w) =>
        (kind === "all" || w.kind === kind) &&
        (useCase === "all" || w.useCase === useCase),
    );
  }, [kind, useCase]);

  // Illusion d'infini : batch pattern (répète le pool si l'utilisateur charge encore).
  const BATCH = 12;
  const visible = useMemo(() => {
    const total = page * BATCH;
    const out: WallItem[] = [];
    for (let i = 0; i < total; i++) {
      const source = filtered[i % filtered.length];
      if (!source) break;
      out.push({ ...source, id: `${source.id}-${i}` });
    }
    return out;
  }, [filtered, page]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FilterPill
          active={kind === "all"}
          onClick={() => setKind("all")}
          label={t("wall.filters.all")}
        />
        {(Object.keys(KIND_META) as WallKind[]).map((k) => {
          const Icon = KIND_META[k].icon;
          return (
            <FilterPill
              key={k}
              active={kind === k}
              onClick={() => setKind(k)}
              icon={<Icon className="size-3" />}
              label={t(KIND_META[k].labelKey)}
            />
          );
        })}
        <span className="mx-2 h-4 w-px bg-border hidden sm:block" />
        <FilterPill
          size="sm"
          active={useCase === "all"}
          onClick={() => setUseCase("all")}
          label={t("wall.usecase.all")}
        />
        {USE_CASES.map((u) => (
          <FilterPill
            key={u}
            size="sm"
            active={useCase === u}
            onClick={() => setUseCase(u)}
            label={t(`wall.usecase.${u}`)}
          />
        ))}
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
        {visible.map((item, i) => (
          <WallCard key={item.id} item={item} index={i} onOpen={() => setActive(item)} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={() => setPage((p) => p + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1/60 px-5 py-2.5 text-sm hover:border-amber/40 transition"
        >
          {t("wall.load_more")}
          <ArrowRight className="size-4" />
        </button>
      </div>

      <WallModal item={active} onClose={() => setActive(null)} />
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  icon,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all",
        size === "sm" ? "px-3 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
        active
          ? "border-amber/60 bg-amber/15 text-amber-soft"
          : "border-border bg-surface-2/50 text-muted-foreground hover:border-border-strong hover:text-foreground/90",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function WallCard({ item, index, onOpen }: { item: WallItem; index: number; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  const heights = { sm: "h-56 sm:h-60", md: "h-72 sm:h-80", lg: "h-96 sm:h-[26rem]" } as const;
  const KindIcon = KIND_META[item.kind].icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(0.5, (index % 12) * 0.04), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      className={cn(
        "group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface-1/40 text-left relative",
        heights[item.span ?? "md"],
      )}
    >
      {/* poster */}
      <img
        src={item.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      {/* video overlay */}
      {item.kind === "video" && item.video && (
        <video
          src={hover ? item.video : undefined}
          muted
          loop
          playsInline
          autoPlay={hover}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            hover ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      {/* audio card */}
      {(item.kind === "music" || item.kind === "voice") && item.audio && (
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/50 backdrop-blur px-3 py-2.5 border border-white/10">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
            <Waveform playing={hover} />
            <span className="ml-auto tabular">{item.audio.duration}</span>
          </div>
          <div className="mt-1 text-xs text-white truncate">{item.audio.title}</div>
        </div>
      )}
      {/* gradient + kind badge */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 pointer-events-none" />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/90 border border-white/10">
        <KindIcon className="size-3" />
        {item.kind}
      </div>
      <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">
          {item.model}
        </div>
      </div>
    </motion.button>
  );
}

function Waveform({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex items-end gap-[2px] h-3">
      {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8].map((h, i) => (
        <span
          key={i}
          className="w-[2px] bg-amber-soft rounded-full origin-bottom"
          style={{
            height: `${h * 100}%`,
            animation: playing ? `wave 900ms ease-in-out ${i * 90}ms infinite` : undefined,
          }}
        />
      ))}
      <style>{`@keyframes wave { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }`}</style>
    </span>
  );
}

function WallModal({ item, onClose }: { item: WallItem | null; onClose: () => void }) {
  const t = useT();
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-3xl border border-border bg-surface-1 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 grid place-items-center size-9 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
            <div className="relative bg-black">
              {item.kind === "video" && item.video ? (
                <video src={item.video} controls autoPlay loop className="w-full max-h-[60vh] object-contain bg-black" />
              ) : (
                <img src={item.image} alt="" className="w-full max-h-[60vh] object-contain bg-black" />
              )}
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
                {t("wall.modal.model")} · {item.model}
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("wall.modal.prompt")}
              </div>
              <p className="mt-2 text-foreground/90 leading-relaxed">« {item.prompt} »</p>
              <div className="mt-6">
                <Link
                  to="/app/models/$slug"
                  params={{ slug: item.modelSlug }}
                  className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
                >
                  {t("wall.modal.cta")}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Condensed teaser used above the fold on landings. */
export function WallPreview() {
  const items = WALL_ITEMS.slice(0, 6);
  return (
    <div className="relative">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {items.map((item, i) => {
          const KindIcon = KIND_META[item.kind].icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 * i }}
              className={cn(
                "relative overflow-hidden rounded-xl border border-border aspect-[3/4]",
                i === 1 && "sm:row-span-2 sm:aspect-auto",
                i === 4 && "sm:row-span-2 sm:aspect-auto",
              )}
            >
              <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-1.5 left-1.5 grid place-items-center size-5 rounded-full bg-black/60 backdrop-blur border border-white/10">
                <KindIcon className="size-2.5 text-white" />
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
