import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { PriceDisplay } from "@/components/price-display";
import { Copy, Check, Plus, KeyRound, X, AlertTriangle, Loader2, Play, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generate } from "@/lib/api/generate";
import { generationStatus } from "@/lib/api/generation-status";
import { MODELS, basePrice, unitLabel, type Model, type ParamSpec } from "@/lib/models";

export const Route = createFileRoute("/app/developers")({
  component: DevelopersPage,
});

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  lastUsed: string;
  active: boolean;
};

const KEYS: ApiKey[] = [
  {
    id: "1",
    name: "Production — site principal",
    prefix: "cx_live_9F2a",
    scope: "generate:*",
    lastUsed: "il y a 12 min",
    active: true,
  },
  {
    id: "2",
    name: "Notebook expérimentations",
    prefix: "cx_test_A73k",
    scope: "generate:image",
    lastUsed: "il y a 3 j",
    active: true,
  },
  {
    id: "3",
    name: "Ancienne app (à supprimer)",
    prefix: "cx_live_1B4z",
    scope: "generate:*",
    lastUsed: "il y a 2 mois",
    active: false,
  },
];

const USAGE = [12, 34, 22, 46, 88, 74, 92, 108, 64, 130, 156, 118, 172, 210];

function DevelopersPage() {
  const [tab, setTab] = useState<"curl" | "js" | "py">("curl");
  const [copied, setCopied] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  const snippets = {
    curl: `curl https://api.cortexia.ai/v1/generate \\
  -H "Authorization: Bearer $CORTEXIA_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "seedream-5-pro",
    "prompt": "Un flacon ambré sur marbre travertin",
    "resolution": "1K"
  }'`,
    js: `import Cortexia from "@cortexia/sdk";
const cx = new Cortexia({ apiKey: process.env.CORTEXIA_KEY });

const { url, cost } = await cx.generate({
  model: "seedream-5-pro",
  prompt: "Un flacon ambré sur marbre travertin",
  resolution: "1K",
});`,
    py: `from cortexia import Cortexia
cx = Cortexia(api_key=os.environ["CORTEXIA_KEY"])

result = cx.generate(
    model="seedream-5-pro",
    prompt="Un flacon ambré sur marbre travertin",
    resolution="1K",
)
print(result.url, result.cost)`,
  } as const;

  function copy() {
    navigator.clipboard.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function createKey() {
    // Use Web Crypto CSPRNG. Real secret minting must happen server-side; this is UI mock only.
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    setShowNewKey("cx_live_" + hex);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 space-y-10">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Développeur
        </div>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">API Cortexia.</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Une seule facturation à l'usage pour tous les modèles. Pas de plan mensuel obligatoire,
          pas de minimum.
        </p>
      </div>

      {/* Usage */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Appels ce mois" value="12 480" />
        <StatCard label="Coût ce mois" priceUSD={38.72} />
        <StatCard label="Taux de réussite" value="99,7 %" />
      </div>

      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Usage — 14 derniers jours
          </div>
        </div>
        <div className="flex items-end gap-1 h-32">
          {USAGE.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-amber/70 to-amber-soft/60"
              style={{ height: `${(v / 210) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Keys */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-[-0.02em]">Clés API</h2>
          <button
            onClick={createKey}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Nouvelle clé
          </button>
        </div>
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-4 font-normal">Nom</th>
                <th className="p-4 font-normal">Clé</th>
                <th className="p-4 font-normal">Scope</th>
                <th className="p-4 font-normal">Dernière utilisation</th>
                <th className="p-4 font-normal">Statut</th>
              </tr>
            </thead>
            <tbody>
              {KEYS.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2/40"
                >
                  <td className="p-4 flex items-center gap-2">
                    <KeyRound className="size-3.5 text-muted-foreground" /> {k.name}
                  </td>
                  <td className="p-4 font-mono text-xs">{k.prefix}••••••••</td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{k.scope}</td>
                  <td className="p-4 text-muted-foreground">{k.lastUsed}</td>
                  <td className="p-4">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase " +
                        (k.active
                          ? "bg-emerald/15 text-emerald"
                          : "bg-surface-3 text-muted-foreground")
                      }
                    >
                      {k.active ? "Active" : "Révoquée"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Docs */}
      <div>
        <h2 className="font-display text-2xl tracking-[-0.02em] mb-4">Démarrer en 30 secondes</h2>
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex gap-1">
              {(["curl", "js", "py"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    "rounded-full px-3 py-1 text-xs font-mono transition " +
                    (tab === t
                      ? "bg-surface-3 text-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {t === "curl" ? "cURL" : t === "js" ? "JavaScript" : "Python"}
                </button>
              ))}
            </div>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald" /> Copié
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copier
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre">
            {snippets[tab]}
          </pre>
        </div>
      </div>

      {/* Playground */}
      <DevelopersPlayground />

      <AnimatePresence>
        {showNewKey && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowNewKey(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[520px] surface-gradient-border rounded-2xl bg-surface-1 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">
                    Clé créée
                  </div>
                  <h3 className="mt-2 font-display text-2xl tracking-[-0.02em]">
                    Copie-la maintenant.
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewKey(null)}
                  className="rounded-lg p-1 hover:bg-surface-2"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-amber/30 bg-amber/5 p-3 flex items-start gap-2 text-xs text-amber-soft">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  C'est la seule fois où tu verras ce secret en clair. Après cette fenêtre, il ne
                  pourra plus être récupéré — seulement révoqué.
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs">
                  {showNewKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(showNewKey)}
                  className="rounded-lg border border-border px-3 py-2 text-xs hover:border-amber/40"
                >
                  Copier
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DevelopersPlayground() {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [generating, setGenerating] = useState(false);
  const [pollingId, setPollingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url?: string; type?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const categories = ["all", "image", "video", "audio", "text", "music"] as const;

  const filteredModels = MODELS.filter((m) => {
    if (!m.active) return false;
    if (categoryFilter !== "all" && m.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const selectModel = useCallback(
    (m: Model) => {
      setSelectedModel(m);
      setDropdownOpen(false);
      setSearch("");
      const defaults: Record<string, unknown> = {};
      for (const p of m.params) {
        if (p.kind === "slider") defaults[p.key] = p.default;
        else if (p.kind === "toggle") defaults[p.key] = p.default ?? false;
        else if (p.kind === "select" && p.options.length > 0) defaults[p.key] = p.options[0];
      }
      setFormValues(defaults);
      setResult(null);
      setError(null);
      setPollingId(null);
      setStatus("");
      setProgress(0);
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  const updateField = useCallback((key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const startGeneration = useCallback(async () => {
    if (!selectedModel) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    setStatus("queued");
    setProgress(10);

    try {
      const res = await generate({
        data: { modelSlug: selectedModel.slug, input: formValues },
      });
      setEstimatedCost(res.estimatedCostUsd);
      setPollingId(res.runNodeExecutionId);
      setStatus("queued");
      setProgress(20);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenerating(false);
    }
  }, [selectedModel, formValues]);

  useEffect(() => {
    if (pollingId == null) return;

    pollRef.current = setInterval(async () => {
      try {
        const st = await generationStatus({ data: { id: pollingId } });
        const nodeStatus = st.nodes[0]?.status ?? st.status;
        setStatus(nodeStatus);

        if (nodeStatus === "running") setProgress(60);
        else if (nodeStatus === "success") setProgress(100);
        else if (nodeStatus === "failed" || nodeStatus === "error") {
          setProgress(100);
          setError(st.nodes[0]?.errorMessage ?? "Generation failed");
          setGenerating(false);
          if (pollRef.current) clearInterval(pollRef.current);
          return;
        }

        if (nodeStatus === "success") {
          if (pollRef.current) clearInterval(pollRef.current);
          const asset = st.nodes[0]?.asset;
          if (asset) {
            setResult({ url: asset.previewUrl ?? asset.storageUrl, type: asset.type });
          }
          setGenerating(false);
          setProgress(100);
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollingId]);

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
        Playground
      </div>
      <h2 className="font-display text-2xl tracking-[-0.02em] mb-4">Tester un modèle</h2>

      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 space-y-5">
        {/* Model Selector */}
        <div className="relative" ref={dropdownRef}>
          <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">
            Modèle
          </label>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-surface-2/50 px-3 py-2.5 text-sm text-left hover:border-amber/40 transition"
          >
            {selectedModel ? (
              <span className="truncate">
                {selectedModel.name}{" "}
                <span className="text-muted-foreground">· {selectedModel.provider}</span>
                <span className="text-amber ml-2">
                  <PriceDisplay usd={basePrice(selectedModel)} compact />
                  <span className="text-muted-foreground ml-0.5">{unitLabel(selectedModel)}</span>
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Choisir un modèle…</span>
            )}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface-1 shadow-xl max-h-80 overflow-hidden flex flex-col">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-full rounded-lg bg-surface-2/60 pl-7 pr-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategoryFilter(c)}
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase transition " +
                        (categoryFilter === c
                          ? "bg-amber text-primary-foreground"
                          : "bg-surface-3 text-muted-foreground hover:text-foreground")
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredModels.length === 0 && (
                  <div className="p-4 text-xs text-muted-foreground text-center">Aucun modèle trouvé</div>
                )}
                {filteredModels.map((m) => (
                  <button
                    key={m.slug}
                    onClick={() => selectModel(m)}
                    className={
                      "w-full text-left px-3 py-2 text-sm hover:bg-surface-2/60 transition flex items-center justify-between " +
                      (selectedModel?.slug === m.slug ? "bg-surface-2/40" : "")
                    }
                  >
                    <span className="truncate">
                      {m.name}{" "}
                      <span className="text-muted-foreground text-xs">· {m.provider}</span>
                      {m.badge && (
                        <span className="ml-1 text-[10px] font-mono uppercase text-amber">{m.badge}</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      <PriceDisplay usd={basePrice(m)} compact />{unitLabel(m)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Form */}
        {selectedModel && (
          <div className="space-y-4 pt-2 border-t border-border/50">
            {selectedModel.params
              .filter((p) => !isAdvanced(p))
              .map((p) => (
                <ParamField key={paramKey(p)} param={p} value={formValues} onChange={updateField} />
              ))}

            {/* Advanced toggle */}
            {selectedModel.params.some((p) => isAdvanced(p)) && (
              <details className="group">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition font-mono uppercase tracking-wider">
                  Options avancées
                </summary>
                <div className="mt-3 space-y-4">
                  {selectedModel.params
                    .filter((p) => isAdvanced(p))
                    .map((p) => (
                      <ParamField key={paramKey(p)} param={p} value={formValues} onChange={updateField} />
                    ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Generate button + cost */}
        {selectedModel && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={startGeneration}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber text-primary-foreground px-5 py-2 text-sm font-medium hover:opacity-95 transition disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> En cours…
                </>
              ) : (
                <>
                  <Play className="size-4" /> Générer
                </>
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              Estimation :{" "}
              <PriceDisplay usd={estimatedCost} compact />
            </span>
          </div>
        )}

        {/* Progress bar */}
        {generating && (
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber to-amber-soft"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {status === "queued" ? "En file d'attente…" : status === "running" ? "Génération en cours…" : status}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400 flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result?.url && (
          <div className="pt-2 border-t border-border/50">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Résultat
            </div>
            {result.type === "image" ? (
              <img src={result.url} alt="Generated" className="rounded-xl max-h-96 object-contain" />
            ) : result.type === "video" ? (
              <video src={result.url} controls className="rounded-xl max-h-96 w-full" />
            ) : result.type === "audio" || result.type === "music" ? (
              <audio src={result.url} controls className="w-full" />
            ) : (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber underline text-sm"
              >
                Ouvrir le résultat
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function isAdvanced(p: ParamSpec): boolean {
  return "advanced" in p && p.advanced === true;
}

function paramKey(p: ParamSpec): string {
  if ("key" in p && p.key) return p.key;
  return p.label;
}

function fieldKey(p: ParamSpec): string {
  if ("key" in p && p.key) return p.key;
  return p.label;
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: ParamSpec;
  value: Record<string, unknown>;
  onChange: (key: string, v: unknown) => void;
}) {
  switch (param.kind) {
    case "prompt":
      return (
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">
            {param.label}
          </label>
          <textarea
            value={(value[param.label] as string) ?? ""}
            onChange={(e) => onChange(param.label, e.target.value)}
            placeholder={param.placeholder ?? "Décris ce que tu veux générer…"}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface-2/50 px-3 py-2 text-sm outline-none focus:border-amber/40 transition resize-none placeholder:text-muted-foreground"
          />
        </div>
      );
    case "upload":
      return (
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">
            {param.label}
          </label>
          <div className="rounded-xl border-2 border-dashed border-border hover:border-amber/40 transition p-4 text-center text-xs text-muted-foreground cursor-pointer">
            <input
              type="file"
              accept={param.accepts}
              multiple={param.multiple}
              className="hidden"
              id={`upload-${param.label}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChange(param.label, file);
              }}
            />
            <label htmlFor={`upload-${param.label}`} className="cursor-pointer">
              Glisser un fichier ou cliquer pour sélectionner
            </label>
          </div>
        </div>
      );
    case "select":
      return (
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground block mb-1.5">
            {param.label}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {param.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(param.key, opt)}
                className={
                  "rounded-full px-3 py-1 text-xs font-mono transition border " +
                  (value[param.key] === opt
                    ? "bg-amber text-primary-foreground border-amber"
                    : "border-border text-muted-foreground hover:border-amber/40")
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    case "slider":
      return (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {param.label}
            </label>
            <span className="font-mono text-xs text-foreground">
              {String((value[param.key] as number | undefined) ?? param.default)}
              {param.suffix && <span className="text-muted-foreground ml-0.5">{param.suffix}</span>}
            </span>
          </div>
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={(value[param.key] as number) ?? param.default}
            onChange={(e) => onChange(param.key, parseFloat(e.target.value))}
            className="w-full accent-amber"
          />
        </div>
      );
    case "toggle":
      return (
        <div className="flex items-center justify-between">
          <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {param.label}
          </label>
          <button
            onClick={() => onChange(param.key, !(value[param.key] ?? param.default ?? false))}
            className={
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors " +
              ((value[param.key] ?? param.default) ? "bg-amber" : "bg-surface-3")
            }
          >
            <span
              className={
                "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 " +
                ((value[param.key] ?? param.default) ? "translate-x-4 ml-0" : "translate-x-0.5")
              }
            />
          </button>
        </div>
      );
    case "seed":
      return null;
    default:
      return null;
  }
}

function StatCard({
  label,
  value,
  priceUSD,
}: {
  label: string;
  value?: string;
  priceUSD?: number;
}) {
  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl tracking-[-0.02em]">
        {priceUSD != null ? (
          <PriceDisplay usd={priceUSD} emphasize className="font-display text-3xl" />
        ) : (
          value
        )}
      </div>
    </div>
  );
}
