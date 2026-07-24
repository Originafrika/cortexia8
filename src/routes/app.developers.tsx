import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Copy, Check, Plus, KeyRound, X, AlertTriangle, Loader2 } from "lucide-react";
import { ApiDocs } from "@/components/api-docs";
import { motion, AnimatePresence } from "framer-motion";
import { createApiKey, listApiKeys, revokeApiKey, type ApiKeyRow } from "@/lib/api/api-keys";

export const Route = createFileRoute("/app/developers")({
  component: DevelopersPage,
});


function DevelopersPage() {
  const [tab, setTab] = useState<"curl" | "js" | "py">("curl");
  const [copied, setCopied] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [keyScope, setKeyScope] = useState("generate:*");
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    listApiKeys()
      .then((data) => setKeys(data as ApiKeyRow[]))
      .catch(() => setKeys([]))
      .finally(() => setKeysLoading(false));
  }, []);

  const snippets = {
    curl: `curl https://api.cortexia.ai/v1/generate \\
  -H "Authorization: Bearer $CORTEXIA_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "seedream-5-pro",
    "prompt": "Un flacon ambré sur marbre travertin",
    "resolution": "1K"
  }'`,
    js: `const res = await fetch("https://api.cortexia.ai/v1/generate", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.CORTEXIA_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "seedream-5-pro",
    prompt: "Un flacon ambré sur marbre travertin",
    resolution: "1K",
  }),
});
const { url, cost } = await res.json();`,
    py: `import os, requests

res = requests.post(
    "https://api.cortexia.ai/v1/generate",
    headers={"Authorization": f"Bearer {os.environ['CORTEXIA_KEY']}"},
    json={
        "model": "seedream-5-pro",
        "prompt": "Un flacon ambré sur marbre travertin",
        "resolution": "1K",
    },
)
url, cost = res.json()["url"], res.json()["cost"]
print(url, cost)`,
  } as const;

  function copy() {
    navigator.clipboard.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleCreateKey() {
    if (!keyName.trim() || creatingKey) return;
    setCreatingKey(true);
    try {
      const result = await createApiKey({ data: { name: keyName.trim(), scope: keyScope } });
      setShowNewKey(result.rawKey);
      setKeyName("");
      // Refresh the key list
      const updated = await listApiKeys();
      setKeys(updated as ApiKeyRow[]);
    } catch (err) {
      console.error("Failed to create API key:", err);
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(keyId: number) {
    try {
      await revokeApiKey({ data: { keyId } });
      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" } : k))
      );
    } catch (err) {
      console.error("Failed to revoke API key:", err);
    }
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
        <StatCard label="Appels ce mois" value="—" />
        <StatCard label="Coût ce mois" value="—" />
        <StatCard label="Taux de réussite" value="—" />
      </div>

      {/* Keys */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-[-0.02em]">Clés API</h2>
          <div className="flex items-center gap-2">
            <input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Nom de la clé"
              className="rounded-full border border-border bg-surface-1/70 px-3 py-1.5 text-sm focus:border-amber/40 outline-none w-48"
            />
            <select
              value={keyScope}
              onChange={(e) => setKeyScope(e.target.value)}
              className="rounded-full border border-border bg-surface-1/70 px-3 py-1.5 text-sm focus:border-amber/40 outline-none"
            >
              <option value="generate:*">generate:* (all)</option>
              <option value="generate:image">generate:image</option>
              <option value="generate:video">generate:video</option>
              <option value="generate:audio">generate:audio</option>
            </select>
            <button
              onClick={handleCreateKey}
              disabled={creatingKey || !keyName.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-95 transition disabled:opacity-50"
            >
              {creatingKey ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Nouvelle clé
            </button>
          </div>
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
                <th className="p-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {keysLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    <Loader2 className="size-4 animate-spin inline-block" />
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground text-xs">
                    Aucune clé API. Crée ta première clé pour commencer.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b border-border last:border-0 hover:bg-surface-2/40"
                  >
                    <td className="p-4 flex items-center gap-2">
                      <KeyRound className="size-3.5 text-muted-foreground" /> {k.name}
                    </td>
                    <td className="p-4 font-mono text-xs">{k.prefix}••••••••</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{k.permissions}</td>
                    <td className="p-4 text-muted-foreground">{k.lastUsed}</td>
                    <td className="p-4">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase " +
                          (k.status === "active"
                            ? "bg-emerald/15 text-emerald"
                            : "bg-surface-3 text-muted-foreground")
                        }
                      >
                        {k.status === "active" ? "Active" : "Révoquée"}
                      </span>
                    </td>
                    <td className="p-4">
                      {k.status === "active" && (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Révoquer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
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

      {/* API Documentation */}
      <div>
        <h2 className="font-display text-2xl tracking-[-0.02em] mb-4">Référence API</h2>
        <ApiDocs />
      </div>

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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl tracking-[-0.02em]">
        {value}
      </div>
    </div>
  );
}
