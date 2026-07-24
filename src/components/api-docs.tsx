import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";

const endpoints = [
  {
    method: "POST",
    path: "/v1/generate",
    title: "Générer du contenu",
    description: "Lance une génération d'image, vidéo ou audio selon le modèle choisi.",
    headers: [
      { name: "Authorization", value: "Bearer cx_..." },
      { name: "Content-Type", value: "application/json" },
    ],
    requestBody: `{
  "model": "seedream-5-pro",
  "prompt": "Un flacon ambré sur marbre travertin",
  "resolution": "1K",
  "reference_files": []
}`,
    responseExample: `{
  "id": "gen_3x8kL2",
  "status": "completed",
  "url": "https://cdn.cortexia.ai/gen_3x8kL2.webp",
  "cost": 0.04,
  "model": "seedream-5-pro"
}`,
    errors: [
      { code: 400, message: "Paramètres invalides ou manquants" },
      { code: 401, message: "Clé API invalide ou absente" },
      { code: 402, message: "Crédits insuffisants" },
      { code: 429, message: "Limite de débit atteinte" },
    ],
  },
  {
    method: "GET",
    path: "/v1/generations/:id",
    title: "Vérifier le statut",
    description: "Récupère le statut et le résultat d'une génération en cours ou terminée.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "id": "gen_3x8kL2",
  "status": "completed",
  "url": "https://cdn.cortexia.ai/gen_3x8kL2.webp",
  "cost": 0.04,
  "created_at": "2026-07-24T10:30:00Z"
}`,
    errors: [
      { code: 404, message: "Génération introuvable" },
      { code: 401, message: "Clé API invalide" },
    ],
  },
  {
    method: "GET",
    path: "/v1/credits",
    title: "Crédits restants",
    description: "Retourne le solde de crédits disponible sur ton compte.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "credits": 12.40,
  "currency": "USD"
}`,
    errors: [{ code: 401, message: "Clé API invalide" }],
  },
  {
    method: "POST",
    path: "/v1/workflows/run",
    title: "Exécuter un workflow",
    description: "Lance un workflow personnalisé composé de plusieurs étapes de génération.",
    headers: [
      { name: "Authorization", value: "Bearer cx_..." },
      { name: "Content-Type", value: "application/json" },
    ],
    requestBody: `{
  "workflow_id": "wf_brand_pack",
  "inputs": {
    "product_name": "Cortexia Noir",
    "style": "minimaliste"
  }
}`,
    responseExample: `{
  "id": "run_9mK4",
  "status": "running",
  "estimated_seconds": 12
}`,
    errors: [
      { code: 400, message: "Workflow introuvable ou paramètres invalides" },
      { code: 401, message: "Clé API invalide" },
      { code: 402, message: "Crédits insuffisants pour ce workflow" },
    ],
  },
] as const;

const methodColors: Record<string, string> = {
  POST: "bg-emerald/15 text-emerald",
  GET: "bg-sky/15 text-sky",
  PUT: "bg-amber/15 text-amber",
  DELETE: "bg-red/15 text-red",
};

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative group">
      <pre className="overflow-x-auto rounded-xl bg-[#0a0a0c] border border-border/50 p-4 font-mono text-xs leading-relaxed text-foreground/80 whitespace-pre">
        {children}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-surface-2/80 px-2 py-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald" /> Copié
          </>
        ) : (
          <>
            <Copy className="size-3" /> Copier
          </>
        )}
      </button>
    </div>
  );
}

function EndpointCard({ ep }: { ep: (typeof endpoints)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="surface-gradient-border rounded-xl bg-surface-1/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/30 transition"
      >
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${methodColors[ep.method]}`}
        >
          {ep.method}
        </span>
        <code className="font-mono text-sm text-foreground/90">{ep.path}</code>
        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">— {ep.title}</span>
        <ChevronDown
          className={`ml-auto size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-5 pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">{ep.description}</p>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Headers requis
            </h4>
            <CodeBlock>
              {ep.headers.map((h) => `${h.name}: ${h.value}`).join("\n")}
            </CodeBlock>
          </div>

          {ep.requestBody && (
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Corps de la requête
              </h4>
              <CodeBlock>{ep.requestBody}</CodeBlock>
            </div>
          )}

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Réponse
            </h4>
            <CodeBlock>{ep.responseExample}</CodeBlock>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Codes d'erreur
            </h4>
            <div className="space-y-1">
              {ep.errors.map((e) => (
                <div key={e.code} className="flex items-center gap-3 text-xs">
                  <code className="rounded-md bg-red/10 text-red px-1.5 py-0.5 font-mono font-bold">
                    {e.code}
                  </code>
                  <span className="text-muted-foreground">{e.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApiDocs() {
  return (
    <div className="space-y-8">
      {/* Authentication */}
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">Authentification</h3>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Toutes les requêtes API doivent inclure une clé API dans le header{" "}
          <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Authorization</code>.
          Utilise le format{" "}
          <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
            Bearer cx_...
          </code>
          . Tu peux créer et gérer tes clés dans la section ci-dessus.
        </p>
        <CodeBlock>{`Authorization: Bearer cx_tes_cle_api_ici`}</CodeBlock>
        <div className="rounded-xl border border-amber/30 bg-amber/5 p-3 flex items-start gap-2 text-xs text-amber-soft">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>
            Ne jamais exposer ta clé API côté client. Utilise des variables d'environnement et
            appelle l'API depuis un serveur sécurisé.
          </span>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">Référence des endpoints</h3>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <EndpointCard key={ep.method + ep.path} ep={ep} />
          ))}
        </div>
      </div>

      {/* Rate limits */}
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">Limites de débit</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              60
            </code>
            <span>requêtes par minute par clé API</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              10
            </code>
            <span>générations simultanées par compte</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              100 MB
            </code>
            <span>taille maximale pour les fichiers de référence</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Les headers <code className="font-mono">X-RateLimit-Remaining</code> et{" "}
          <code className="font-mono">X-RateLimit-Reset</code> sont inclus dans chaque réponse.
          En cas de dépassement, l'API renvoie un{" "}
          <code className="font-mono text-red">429 Too Many Requests</code>.
        </p>
      </div>
    </div>
  );
}
