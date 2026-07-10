import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PriceDisplay } from "@/components/price-display";
import { CurrencyPicker } from "@/components/currency-picker";
import { CreditCard, Smartphone, Bitcoin, Wallet, Check } from "lucide-react";
import { useCurrency, formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/account")({
  component: AccountPage,
});

const TX = [
  { d: "12 nov.", label: "Génération — Kling 3 Turbo 1080p (5s)",     amount: -0.709,  kind: "debit" },
  { d: "12 nov.", label: "Génération — Seedream 5.0 Pro 1K",           amount: -0.0441, kind: "debit" },
  { d: "11 nov.", label: "Recharge — Mobile Money (Orange)",           amount: 10,      kind: "credit" },
  { d: "10 nov.", label: "Génération — ElevenLabs V3 (2 400 car.)",    amount: -0.2117, kind: "debit" },
  { d: "9 nov.",  label: "Génération — GPT-5.5 (input+output)",        amount: -0.0521, kind: "debit" },
  { d: "5 nov.",  label: "Recharge — Carte Visa",                      amount: 20,      kind: "credit" },
];

const METHODS = [
  { key: "mm",    name: "Mobile Money",  desc: "Orange · MTN · Wave · M-Pesa",             icon: Smartphone },
  { key: "card",  name: "Carte",         desc: "Visa · Mastercard · Amex",                 icon: CreditCard },
  { key: "crypto",name: "Crypto",        desc: "USDT · USDC · BTC · ETH",                  icon: Bitcoin },
  { key: "ali",   name: "Alipay",        desc: "Chine et Asie du Sud-Est",                 icon: Wallet },
];

function AccountPage() {
  const c = useCurrency();
  const [method, setMethod] = useState<string>("mm");
  const [amount, setAmount] = useState<number>(10);
  const balance = 24.63;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 space-y-10">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Compte</div>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">Solde et facturation.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        {/* Credit card */}
        <div className="relative aspect-[1.586/1] rounded-3xl overflow-hidden p-6 flex flex-col justify-between surface-gradient-border bg-[linear-gradient(135deg,oklch(0.22_0.05_60),oklch(0.14_0.02_50))]">
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-amber/20 blur-3xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft/90">Solde disponible</div>
              <PriceDisplay usd={balance} className="mt-2 font-display text-5xl tracking-[-0.03em]" emphasize />
            </div>
            <div className="grid place-items-center size-9 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground">
              <span className="font-display text-sm">C</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-mono text-xs text-foreground/70 uppercase tracking-wider">Cortexia — Compte principal</div>
            <div className="mt-1 font-mono text-sm text-foreground/90">•••• •••• •••• {new Date().getFullYear().toString().slice(-4)}</div>
          </div>
        </div>

        {/* Recharge */}
        <div className="surface-gradient-border rounded-3xl bg-surface-1/60 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Recharger</div>
          <h2 className="mt-2 font-display text-2xl tracking-[-0.02em]">Ajoute des crédits.</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {METHODS.map((m) => {
              const active = method === m.key;
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                    active ? "border-amber/60 bg-amber/10" : "border-border bg-surface-2/40 hover:border-border-strong"
                  )}
                >
                  <div className={cn("grid place-items-center size-9 rounded-lg", active ? "bg-amber/20 text-amber" : "bg-surface-3 text-muted-foreground")}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.desc}</div>
                  </div>
                  {active && <Check className="size-4 text-amber" />}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-muted-foreground">Montant à recharger</span>
              <span className="text-xs text-muted-foreground">= {formatMoney(amount, c)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 50, 100].map((v) => (
                <button key={v} onClick={() => setAmount(v)}
                  className={"rounded-full border px-3 py-1.5 text-xs transition " + (amount === v ? "border-amber/60 bg-amber/15 text-amber-soft" : "border-border text-muted-foreground hover:text-foreground")}>
                  {formatMoney(v, c)}
                </button>
              ))}
            </div>
            <button className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition">
              Recharger {formatMoney(amount, c)}
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
          <h2 className="font-display text-2xl tracking-[-0.02em]">Transactions</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Devise d'affichage :</span>
            <CurrencyPicker />
          </div>
        </div>
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Description</th>
                <th className="p-4 font-normal text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {TX.map((t, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-2/40">
                  <td className="p-4 text-muted-foreground font-mono text-xs">{t.d}</td>
                  <td className="p-4">{t.label}</td>
                  <td className={"p-4 text-right font-mono tabular " + (t.amount > 0 ? "text-emerald" : "text-foreground/85")}>
                    {t.amount > 0 ? "+" : ""}<PriceDisplay usd={Math.abs(t.amount)} className={t.amount > 0 ? "text-emerald" : ""} forceDecimals={4} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
