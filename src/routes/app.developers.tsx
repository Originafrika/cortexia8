import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PriceDisplay } from "@/components/price-display";
import { Copy, Check, Plus, KeyRound, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/app/developers")({
  component: DevelopersPage,
});

type ApiKey = { id: string; name: string; prefix: string; scope: string; lastUsed: string; active: boolean };

const KEYS: ApiKey[] = [
  { id: "1", name: "Production — site principal", prefix: "cx_live_9F2a", scope: "generate:*", lastUsed: "il y a 12 min", active: true },
  { id: "2", name: "Notebook expérimentations", prefix: "cx_test_A73k", scope: "generate:image", lastUsed: "il y a 3 j", active: true },
  { id: "3", name: "Ancienne app (à supprimer)", prefix: "cx_live_1B4z", scope: "generate:*", lastUsed: "il y a 2 mois", active: false },
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
    setCopied(true); setTimeout(() => setCopied(false), 1500);
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
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Développeur</div>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">API Cortexia.</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">Une seule facturation à l'usage pour tous les modèles. Pas de plan mensuel obligatoire, pas de minimum.</p>
      </div>

      {/* Usage */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Appels ce mois" value="12 480" />
        <StatCard label="Coût ce mois" priceUSD={38.72} />
        <StatCard label="Taux de réussite" value="99,7 %" />
      </div>

      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Usage — 14 derniers jours</div>
        </div>
        <div className="flex items-end gap-1 h-32">
          {USAGE.map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-amber/70 to-amber-soft/60" style={{ height: `${(v / 210) * 100}%` }} />
          ))}
        </div>
      </div>

      {/* Keys */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-[-0.02em]">Clés API</h2>
          <button onClick={createKey} className="inline-flex items-center gap-1.5 rounded-full bg-amber text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-95 transition">
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
                <tr key={k.id} className="border-b border-border last:border-0 hover:bg-surface-2/40">
                  <td className="p-4 flex items-center gap-2"><KeyRound className="size-3.5 text-muted-foreground" /> {k.name}</td>
                  <td className="p-4 font-mono text-xs">{k.prefix}••••••••</td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{k.scope}</td>
                  <td className="p-4 text-muted-foreground">{k.lastUsed}</td>
                  <td className="p-4">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-mono uppercase " + (k.active ? "bg-emerald/15 text-emerald" : "bg-surface-3 text-muted-foreground")}>
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
                <button key={t} onClick={() => setTab(t)}
                  className={"rounded-full px-3 py-1 text-xs font-mono transition " + (tab === t ? "bg-surface-3 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {t === "curl" ? "cURL" : t === "js" ? "JavaScript" : "Python"}
                </button>
              ))}
            </div>
            <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              {copied ? <><Check className="size-3.5 text-emerald" /> Copié</> : <><Copy className="size-3.5" /> Copier</>}
            </button>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre">{snippets[tab]}</pre>
        </div>
      </div>

      <AnimatePresence>
        {showNewKey && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewKey(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[520px] surface-gradient-border rounded-2xl bg-surface-1 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft">Clé créée</div>
                  <h3 className="mt-2 font-display text-2xl tracking-[-0.02em]">Copie-la maintenant.</h3>
                </div>
                <button onClick={() => setShowNewKey(null)} className="rounded-lg p-1 hover:bg-surface-2"><X className="size-4" /></button>
              </div>
              <div className="mt-4 rounded-xl border border-amber/30 bg-amber/5 p-3 flex items-start gap-2 text-xs text-amber-soft">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>C'est la seule fois où tu verras ce secret en clair. Après cette fenêtre, il ne pourra plus être récupéré — seulement révoqué.</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs">{showNewKey}</code>
                <button onClick={() => navigator.clipboard.writeText(showNewKey)} className="rounded-lg border border-border px-3 py-2 text-xs hover:border-amber/40">Copier</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, priceUSD }: { label: string; value?: string; priceUSD?: number }) {
  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl tracking-[-0.02em]">
        {priceUSD != null ? <PriceDisplay usd={priceUSD} emphasize className="font-display text-3xl" /> : value}
      </div>
    </div>
  );
}
