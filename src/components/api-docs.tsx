import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n";

const endpoints = [
  {
    method: "POST",
    path: "/v1/generate",
    title: "Generate content",
    description:
      'Starts a text, image, video, audio, or music generation with a verified Cortexia model. The cost is charged from your account credits and the request returns immediately with `status: "processing"`. Poll `GET /v1/generations/:id` to retrieve the result or text once complete.',
    headers: [
      { name: "Authorization", value: "Bearer cx_..." },
      { name: "Content-Type", value: "application/json" },
    ],
    requestBody: `{
  "model": "seedream-5-pro",
  "prompt": "Un flacon ambré sur marbre travertin",
  "resolution": "1K"
}`,
    responseExample: `{
  "id": "gen_3x8kL2",
  "object": "generation",
  "status": "processing",
  "model": "seedream-5-pro",
  "created_at": "2026-07-24T10:30:00Z"
}`,
    errors: [
      { code: 400, message: "Invalid or missing parameters" },
      { code: 401, message: "Invalid or missing API key" },
      { code: 402, message: "Insufficient credits" },
      { code: 403, message: "API key scope does not allow this model category" },
      { code: 429, message: "Rate limit exceeded" },
    ],
  },
  {
    method: "GET",
    path: "/v1/generations/:id",
    title: "Check status",
    description: "Retrieves the status and result of a generation in progress or completed.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "id": "gen_3x8kL2",
  "object": "generation",
  "status": "completed",
  "url": "https://cortexia-assets.r2.dev/gen_3x8kL2.webp",
  "cost": {
    "amount": 0.04,
    "currency": "USD"
  }
}`,
    errors: [
      { code: 404, message: "Generation not found" },
      { code: 401, message: "Invalid API key" },
    ],
  },
  {
    method: "GET",
    path: "/v1/credits",
    title: "Credit balance",
    description: "Returns the available credit balance on your account.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "credits": {
    "amount": 12.40,
    "currency": "USD"
  }
}`,
    errors: [{ code: 401, message: "Invalid API key" }],
  },
  {
    method: "GET",
    path: "/v1/models",
    title: "List models",
    description:
      "Returns all active and verified Cortexia models available to this API key. Optionally filter by category. Use the model slug in `POST /v1/generate`.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "data": [
    {
      "slug": "seedream-5-pro",
      "name": "Seedream 5 Pro",
      "provider": "kie.ai",
      "category": "image",
      "price_usd": 0.04,
      "supports_reference_upload": true,
      "fidelity_status": "fidele"
    }
  ],
  "total": 213
}`,
    errors: [
      { code: 401, message: "Invalid API key" },
      { code: 429, message: "Rate limit exceeded" },
    ],
  },
  {
    method: "POST",
    path: "/v1/workflows",
    title: "Create workflow",
    description: "Creates a new workflow definition composed of multiple generation steps.",
    headers: [
      { name: "Authorization", value: "Bearer cx_..." },
      { name: "Content-Type", value: "application/json" },
    ],
    requestBody: `{
  "name": "Brand Pack Generator",
  "steps": [
    {
      "model": "seedream-5-pro",
      "prompt": "Product shot of {{product_name}}",
      "resolution": "1K"
    }
  ]
}`,
    responseExample: `{
  "id": "wf_brand_pack",
  "object": "workflow",
  "name": "Brand Pack Generator",
  "steps": 1,
  "created_at": "2026-07-24T10:30:00Z"
}`,
    errors: [
      { code: 400, message: "Invalid workflow definition" },
      { code: 401, message: "Invalid API key" },
    ],
  },
  {
    method: "GET",
    path: "/v1/workflows",
    title: "List workflows",
    description: "Returns all workflow definitions on your account.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "data": [
    {
      "id": "wf_brand_pack",
      "object": "workflow",
      "name": "Brand Pack Generator",
      "steps": 1,
      "created_at": "2026-07-24T10:30:00Z"
    }
  ],
  "has_more": false
}`,
    errors: [{ code: 401, message: "Invalid API key" }],
  },
  {
    method: "DELETE",
    path: "/v1/workflows/:id",
    title: "Delete workflow",
    description: "Permanently deletes a workflow and its run history.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "id": "wf_brand_pack",
  "object": "workflow",
  "deleted": true
}`,
    errors: [
      { code: 404, message: "Workflow not found" },
      { code: 401, message: "Invalid API key" },
    ],
  },
  {
    method: "POST",
    path: "/v1/workflows/run",
    title: "Run workflow",
    description: "Executes a custom workflow composed of multiple generation steps.",
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
  "object": "workflow_run",
  "workflow_id": "wf_brand_pack",
  "status": "running",
  "estimated_seconds": 12,
  "created_at": "2026-07-24T10:30:00Z"
}`,
    errors: [
      { code: 400, message: "Workflow not found or invalid parameters" },
      { code: 401, message: "Invalid API key" },
      { code: 402, message: "Insufficient credits for this workflow" },
    ],
  },
  {
    method: "GET",
    path: "/v1/history",
    title: "Generation history",
    description: "Returns a paginated list of all generations on your account.",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "data": [
    {
      "id": "gen_3x8kL2",
      "object": "generation",
      "status": "completed",
      "model": "seedream-5-pro",
      "prompt": "Un flacon ambré sur marbre travertin",
      "url": "https://cortexia-assets.r2.dev/gen_3x8kL2.webp",
      "cost": {
        "amount": 0.04,
        "currency": "USD"
      },
      "created_at": "2026-07-24T10:30:00Z"
    }
  ],
  "has_more": false,
  "total": 1
}`,
    errors: [{ code: 401, message: "Invalid API key" }],
  },
  {
    method: "GET",
    path: "/v1/credits/transactions",
    title: "Credit transactions",
    description: "Returns a paginated list of all credit transactions (charges, top-ups, refunds).",
    headers: [{ name: "Authorization", value: "Bearer cx_..." }],
    requestBody: null,
    responseExample: `{
  "data": [
    {
      "id": "txn_8pLm3",
      "object": "credit_transaction",
      "type": "charge",
      "amount": -0.04,
      "currency": "USD",
      "description": "Generation gen_3x8kL2",
      "balance_after": 12.36,
      "created_at": "2026-07-24T10:30:05Z"
    },
    {
      "id": "txn_7kNv9",
      "object": "credit_transaction",
      "type": "topup",
      "amount": 20.00,
      "currency": "USD",
      "description": "Card payment ending 4242",
      "balance_after": 12.40,
      "created_at": "2026-07-24T09:00:00Z"
    }
  ],
  "has_more": false,
  "total": 2
}`,
    errors: [{ code: 401, message: "Invalid API key" }],
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
            <Check className="size-3 text-emerald" /> Copied
          </>
        ) : (
          <>
            <Copy className="size-3" /> Copy
          </>
        )}
      </button>
    </div>
  );
}

function EndpointCard({ ep }: { ep: (typeof endpoints)[number] }) {
  const [open, setOpen] = useState(false);
  const t = useT();

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
              {t("api_docs.req_headers")}
            </h4>
            <CodeBlock>{ep.headers.map((h) => `${h.name}: ${h.value}`).join("\n")}</CodeBlock>
          </div>

          {ep.requestBody && (
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                {t("api_docs.req_body")}
              </h4>
              <CodeBlock>{ep.requestBody}</CodeBlock>
            </div>
          )}

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              {t("api_docs.res_example")}
            </h4>
            <CodeBlock>{ep.responseExample}</CodeBlock>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              {t("api_docs.error_codes")}
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
  const t = useT();

  return (
    <div className="space-y-8">
      {/* Authentication */}
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">{t("api_docs.auth_title")}</h3>
        <p className="text-sm text-muted-foreground max-w-2xl">{t("api_docs.auth_desc")}</p>
        <CodeBlock>{`Authorization: Bearer cx_tes_cle_api_ici`}</CodeBlock>
        <div className="rounded-xl border border-amber/30 bg-amber/5 p-3 flex items-start gap-2 text-xs text-amber-soft">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{t("api_docs.auth_warning")}</span>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">
          {t("api_docs.endpoints_title")}
        </h3>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <EndpointCard key={ep.method + ep.path} ep={ep} />
          ))}
        </div>
      </div>

      {/* Rate limits */}
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">
          {t("api_docs.ratelimit_title")}
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              30
            </code>
            <span>{t("api_docs.ratelimit_gen")}</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              100
            </code>
            <span>{t("api_docs.ratelimit_poll")}</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              60
            </code>
            <span>{t("api_docs.ratelimit_other")}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t("api_docs.ratelimit_note")}</p>
      </div>

      {/* Webhooks */}
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">{t("api_docs.webhook_title")}</h3>
        <p className="text-sm text-muted-foreground max-w-2xl">{t("api_docs.webhook_desc")}</p>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
            {t("api_docs.webhook_events_title")}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs">
              <code className="rounded-md bg-emerald/10 text-emerald px-1.5 py-0.5 font-mono font-bold">
                generation.completed
              </code>
              <span className="text-muted-foreground">
                Fired when a generation finishes successfully
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <code className="rounded-md bg-red/10 text-red px-1.5 py-0.5 font-mono font-bold">
                generation.failed
              </code>
              <span className="text-muted-foreground">Fired when a generation fails</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
            {t("api_docs.webhook_payload_title")}
          </h4>
          <CodeBlock>{`{
  "event": "generation.completed",
  "data": {
    "id": "gen_3x8kL2",
    "object": "generation",
    "status": "completed",
    "model": "seedream-5-pro",
    "url": "https://cortexia-assets.r2.dev/gen_3x8kL2.webp",
    "cost": { "amount": 0.04, "currency": "USD" },
    "created_at": "2026-07-24T10:30:00Z"
  }
}`}</CodeBlock>
        </div>

        <div className="rounded-xl border border-amber/30 bg-amber/5 p-3 flex items-start gap-2 text-xs text-amber-soft">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{t("api_docs.webhook_verify_desc")}</span>
        </div>
      </div>
    </div>
  );
}
