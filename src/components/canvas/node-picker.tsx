import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { MODELS, type Model, type ModelCategory } from "@/lib/models";
import { categoryAccent } from "@/lib/canvas-types";
import { useCanvasStore } from "@/lib/canvas-store";
import { Image as ImageIcon, Film, Music2, MessageSquare, Plus, Search } from "lucide-react";
import { PriceDisplay } from "@/components/price-display";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<ModelCategory, typeof ImageIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music2,
  text: MessageSquare,
  music: Music2,
};

const CATEGORY_LABEL: Record<ModelCategory, string> = {
  image: "Image",
  video: "Vidéo",
  audio: "Voix",
  text: "Texte",
  music: "Musique",
};

type Props = {
  /** Render as a toolbar button instead of a dialog. */
  variant?: "toolbar" | "context";
  className?: string;
  /** Optional callback that returns the flow-coordinate position for a new node. */
  getPosition?: () => { x: number; y: number };
  /** When provided, open state is controlled externally. */
  open?: boolean;
  /** Called when the open state changes (controlled mode). */
  onOpenChange?: (open: boolean) => void;
};

export function NodePicker({ variant = "toolbar", className, getPosition, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const readOnly = useCanvasStore((s) => s.readOnly);

  if (readOnly) return null;

  if (variant === "context") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className={cn(
          "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-surface-2 transition cursor-pointer",
          className,
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Plus className="size-3.5" /> Ajouter un nœud
        </span>
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1/70 px-3.5 h-9 text-sm hover:border-amber/40 transition cursor-pointer",
            className,
          )}
        >
          <Plus className="size-4" /> Ajouter un modèle
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-surface-1/95 backdrop-blur border-border">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-sm font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Catalogue · ajoute un modèle au canvas
          </DialogTitle>
        </DialogHeader>
        <PickerBody onPick={() => setOpen(false)} getPosition={getPosition} />
      </DialogContent>
    </Dialog>
  );
}

function PickerBody({
  onPick,
  getPosition,
}: {
  onPick: () => void;
  getPosition?: () => { x: number; y: number };
}) {
  const [q, setQ] = useState("");
  const addNode = useCanvasStore((s) => s.addNode);

  const grouped = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = MODELS.filter(
      (m) =>
        term === "" ||
        m.name.toLowerCase().includes(term) ||
        m.provider.toLowerCase().includes(term) ||
        m.blurb.toLowerCase().includes(term),
    );
    const out: Record<ModelCategory, Model[]> = { image: [], video: [], audio: [], text: [], music: [] };
    filtered.forEach((m) => out[m.category].push(m));
    return out;
  }, [q]);

  return (
    <Command className="rounded-none border-t border-border">
      <div className="flex items-center border-b border-border px-3">
        <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
        <CommandInput
          value={q}
          onValueChange={setQ}
          placeholder="Kling, Seedream, Claude…"
          className="h-11"
        />
      </div>
      <CommandList className="max-h-[55vh]">
        {MODELS.every(
          (m) =>
            q.trim() !== "" &&
            !m.name.toLowerCase().includes(q.toLowerCase()) &&
            !m.provider.toLowerCase().includes(q.toLowerCase()) &&
            !m.blurb.toLowerCase().includes(q.toLowerCase()),
        ) && <CommandEmpty>Aucun modèle ne correspond.</CommandEmpty>}
        {(Object.keys(grouped) as ModelCategory[]).map((cat) => {
          const list = grouped[cat];
          if (list.length === 0) return null;
          const Icon = CATEGORY_ICON[cat];
          const accent = categoryAccent(cat);
          return (
            <CommandGroup
              key={cat}
              heading={
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]">
                  <Icon className="size-3" /> {CATEGORY_LABEL[cat]}
                </span>
              }
            >
              {list.map((m) => {
                const price = m.priceUSD ?? m.tiers?.[0]?.priceUSD ?? m.io?.outputUSD ?? 0;
                return (
                  <CommandItem
                    key={m.slug}
                    value={`${m.slug} ${m.name} ${m.provider}`}
                    onSelect={() => {
                      addNode(m.slug, getPosition?.() ?? { x: 200, y: 200 });
                      onPick();
                    }}
                    className="cursor-pointer"
                  >
                    <span
                      className={cn(
                        "grid place-items-center size-7 rounded-lg bg-gradient-to-br text-primary-foreground shrink-0",
                        accent.IconBg,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{m.name}</div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground truncate">
                        {m.provider} · {m.category}
                      </div>
                    </div>
                    <PriceDisplay usd={price} className="text-xs" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </Command>
  );
}
