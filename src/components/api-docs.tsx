import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";

const endpoints = [
  {
    method: "POST",
    path: "/v1/generate",
    title: "Generate content",
    description: "Starts an image, video, or audio generation based on the chosen model.",
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
  "object": "generation",
  "status": "completed",
  "model": "seedream-5-pro",
  "url": "https://cortexia-assets.r2.dev/gen_3x8kL2.webp",
  "cost": {
    "amount": 0.04,
    "currency": "USD"
  },
  "created_at": "2026-07-24T10:30:00Z"
}`,
    errors: [
      { code: 400, message: "Invalid or missing parameters" },
      { code: 401, message: "Invalid or missing API key" },
      { code: 402, message: "Insufficient credits" },
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
  "model": "seedream-5-pro",
  "url": "https://cortexia-assets.r2.dev/gen_3x8kL2.webp",
  "cost": {
    "amount": 0.04,
    "currency": "USD"
  },
  "created_at": "2026-07-24T10:30:00Z"
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
              Required Headers
            </h4>
            <CodeBlock>
              {ep.headers.map((h) => `${h.name}: ${h.value}`).join("\n")}
            </CodeBlock>
          </div>

          {ep.requestBody && (
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Request Body
              </h4>
              <CodeBlock>{ep.requestBody}</CodeBlock>
            </div>
          )}

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Response
            </h4>
            <CodeBlock>{ep.responseExample}</CodeBlock>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Error Codes
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
        <h3 className="font-display text-2xl tracking-[-0.02em]">Authentication</h3>
        <p className="text-sm text-muted-foreground max-w-2xl">
          All API requests must include an API key in the{" "}
          <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Authorization</code>{" "}
          header. Use the format{" "}
          <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
            Bearer cx_...
          </code>
          . You can create and manage your keys in the section above.
        </p>
        <CodeBlock>{`Authorization: Bearer cx_tes_cle_api_ici`}</CodeBlock>
        <div className="rounded-xl border border-amber/30 bg-amber/5 p-3 flex items-start gap-2 text-xs text-amber-soft">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>
            Never expose your API key on the client side. Use environment variables and
            call the API from a secure server.
          </span>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">Endpoint Reference</h3>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <EndpointCard key={ep.method + ep.path} ep={ep} />
          ))}
        </div>
      </div>

      {/* Rate limits */}
      <div className="surface-gradient-border rounded-2xl bg-surface-1/60 p-6 space-y-4">
        <h3 className="font-display text-2xl tracking-[-0.02em]">Rate Limits</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              60
            </code>
            <span>requests per minute per API key</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              10
            </code>
            <span>concurrent generations per account</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs font-bold">
              100 MB
            </code>
            <span>maximum file size for reference files</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          The <code className="font-mono">X-RateLimit-Remaining</code> and{" "}
          <code className="font-mono">X-RateLimit-Reset</code> headers are included in every response.
          When exceeded, the API returns a{" "}
          <code className="font-mono text-red">429 Too Many Requests</code>.
        </p>
      </div>
    </div>
  );
}
