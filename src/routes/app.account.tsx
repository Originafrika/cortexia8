import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PriceDisplay } from "@/components/price-display";
import { CurrencyPicker } from "@/components/currency-picker";
import { CreditCard, Smartphone, Bitcoin, Wallet, Check, Loader2 } from "lucide-react";
import { useCurrency, formatMoney, CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { verifyFedaPayTransaction, createStripeCheckout } from "@/lib/api/payments";
import { getUserBalance, getTransactionHistory, type TxRow } from "@/lib/api/balance";
import { useT } from "@/lib/i18n";
import { loadSession } from "@/lib/auth-store";

export const Route = createFileRoute("/app/account")({
  head: () => ({
    meta: [
      { title: "Cortexia — Account & Recharge" },
      { name: "description", content: "Manage your Cortexia account balance, recharge credits via Mobile Money, card, or crypto, and view transaction history." },
    ],
  }),
  component: AccountPage,
});

const ALL_METHODS = [
  { key: "mm", nameKey: "Mobile Money", desc: "Orange · MTN · Wave · M-Pesa", icon: Smartphone },
  { key: "card", nameKey: "account.method_card", desc: "Visa · Mastercard · Amex", icon: CreditCard },
  { key: "crypto", nameKey: "Crypto", desc: "USDT · USDC · BTC · ETH", icon: Bitcoin },
  { key: "ali", nameKey: "Alipay", descKey: "account.method_ali_desc", icon: Wallet },
];

function AccountPage() {
  const t = useT();
  const c = useCurrency();
  const [method, setMethod] = useState<string>("mm");
  const [amount, setAmount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [txRows, setTxRows] = useState<TxRow[]>([]);

  const fedapayKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY as string | undefined;
  const METHODS = fedapayKey ? ALL_METHODS : ALL_METHODS.filter((m) => m.key !== "mm");

  async function fetchBalance() {
    try {
      const result = await getUserBalance({ data: { sessionToken: loadSession()?.token } });
      setBalance(result.balance);
    } catch {
      // silently ignore — balance stays null
    }
  }

  async function fetchTransactions() {
    try {
      const result = await getTransactionHistory({ data: { sessionToken: loadSession()?.token } });
      setTxRows(result?.transactions ?? []);
    } catch {
      setTxRows([]);
    }
  }

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    if (window.location.search.includes("payment=success")) {
      fetchBalance();
    }
  }, []);

  async function handleRecharge() {
    setLoading(true);
    try {
      if (method === "mm") {
        // FedaPay: the button handles its own flow.
        // We only reach here if FedaPay isn't loaded — fall through.
        toast.info(t("account.use_fedapay"));
        return;
      }

      // card, crypto, and alipay all go through Stripe Checkout
      if (method === "card" || method === "crypto" || method === "ali") {
        const result = await createStripeCheckout({
          data: {
            amount,
            currency: c.code.toLowerCase(),
            method: method === "ali" ? "alipay" : method,
            sessionToken: loadSession()?.token,
          },
        });
        if (result.ok && result.url) {
          window.location.href = result.url;
        } else {
          toast.error(result.error ?? t("account.stripe_error"));
        }
        return;
      }

      toast.info(t("account.method_unavailable"));
    } catch (err) {
      console.error(err);
      toast.error(t("account.error_retry"));
    } finally {
      setLoading(false);
    }
  }

  async function handleFedaPayComplete(transactionId: string) {
    console.log(`[Browser] FedaPay onComplete called with transactionId: ${transactionId}`);
    try {
      console.log(`[Browser] Calling verifyFedaPayTransaction for transaction ${transactionId}`);
      const result = await verifyFedaPayTransaction({
        data: { transactionId, amount: Math.round(amount * CURRENCIES.XOF.rate), sessionToken: loadSession()?.token },
      });
      console.log(`[Browser] verifyFedaPayTransaction result:`, result);
      if (result.ok) {
        if (result.balance != null) {
          setBalance(result.balance);
        } else {
          fetchBalance();
        }
        fetchTransactions();
        toast.success(t("account.credits_added"));
      } else {
        toast.error(result.message ?? t("account.verification_failed"));
      }
    } catch (err) {
      console.error("[Browser] FedaPay verification failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`${t("account.fedapay_error")}: ${msg}`);
    }
  }

  const isFedaPayReady = method === "mm" && !!fedapayKey;
  const isStripeReady = method === "card" || method === "crypto" || method === "ali";
  const canRecharge = isFedaPayReady || isStripeReady;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 space-y-10">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("account.section")}
        </div>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">{t("account.title")}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        {/* Credit card */}
        <div className="relative aspect-[1.586/1] rounded-3xl overflow-hidden p-6 flex flex-col justify-between surface-gradient-border bg-[linear-gradient(135deg,var(--surface-2),var(--background))]">
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-amber/20 blur-3xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft/90">
                {t("account.balance_available")}
              </div>
              <PriceDisplay
                usd={balance ?? 0}
                className="mt-2 font-display text-5xl tracking-[-0.03em]"
                emphasize
              />
            </div>
            <div className="grid place-items-center size-9 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground">
              <span className="font-display text-sm">C</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-mono text-xs text-foreground/70 uppercase tracking-wider">
              {t("account.card_name")}
            </div>
            <div className="mt-1 font-mono text-sm text-foreground/90">
              •••• •••• •••• {new Date().getFullYear().toString().slice(-4)}
            </div>
          </div>
        </div>

        {/* Recharge */}
        <div className="surface-gradient-border rounded-3xl bg-surface-1/60 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t("account.recharge_section")}
          </div>
          <h2 className="mt-2 font-display text-2xl tracking-[-0.02em]">{t("account.add_credits")}</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {METHODS.map((m) => {
              const active = method === m.key;
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  aria-label={m.nameKey?.startsWith("account.") ? t(m.nameKey) : m.nameKey}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                    active
                      ? "border-amber/60 bg-amber/10"
                      : "border-border bg-surface-2/40 hover:border-border-strong",
                  )}
                >
                  <div
                    className={cn(
                      "grid place-items-center size-9 rounded-lg",
                      active ? "bg-amber/20 text-amber" : "bg-surface-3 text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{m.nameKey?.startsWith("account.") ? t(m.nameKey) : m.nameKey}</div>
                    <div className="text-[11px] text-muted-foreground">{m.descKey ? t(m.descKey) : m.desc}</div>
                  </div>
                  {active && <Check className="size-4 text-amber" />}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t("account.amount_to_recharge")}</span>
              <span className="text-xs text-muted-foreground">= {formatMoney(amount, c)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  aria-label={`Recharge ${formatMoney(v, c)}`}
                  aria-pressed={amount === v}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs transition " +
                    (amount === v
                      ? "border-amber/60 bg-amber/15 text-amber-soft"
                      : "border-border text-muted-foreground hover:text-foreground")
                  }
                >
                  {formatMoney(v, c)}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="text-xs text-muted-foreground mb-1 block">{t("account.custom_amount")}</label>
              <input
                type="number"
                min={1}
                max={500}
                value={amount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 1 && v <= 500) setAmount(v);
                }}
                placeholder={t("account.custom_amount_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-2/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber/60"
              />
            </div>

            {/* FedaPay button (Mobile Money) */}
            {isFedaPayReady && (
              <div className="mt-5">
                <FedaPayWidget
                  key={amount}
                  amount={amount}
                  currency={c}
                  public_key={fedapayKey!}
                  onComplete={handleFedaPayComplete}
                  onCancel={() => toast.info(t("account.payment_cancelled"))}
                />
              </div>
            )}

            {/* Generic recharge button (Stripe) */}
            {!isFedaPayReady && (
              <button
                onClick={handleRecharge}
                disabled={loading}
                aria-label={`Recharge ${formatMoney(amount, c)}`}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t("account.recharge_btn").replace("{amount}", formatMoney(amount, c))
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
          <h2 className="font-display text-2xl tracking-[-0.02em]">Transactions</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{t("account.display_currency")}</span>
            <CurrencyPicker />
          </div>
        </div>
        <div className="surface-gradient-border rounded-2xl bg-surface-1/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-4 font-normal">{t("account.date")}</th>
                <th className="p-4 font-normal">{t("account.description")}</th>
                <th className="p-4 font-normal text-right">{t("account.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {(txRows ?? []).map((tx) => {
                const txAmount = Number(tx.amount);
                const date = new Date(tx.created_at);
                const d = date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
                const label = tx.reference ?? tx.type;
                return (
                  <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-surface-2/40">
                    <td className="p-4 text-muted-foreground font-mono text-xs">{d}</td>
                    <td className="p-4">{label}</td>
                    <td
                      className={
                        "p-4 text-right font-mono tabular " +
                        (txAmount > 0 ? "text-emerald" : "text-foreground/85")
                      }
                    >
                      {txAmount > 0 ? "+" : ""}
                      <PriceDisplay
                        usd={Math.abs(txAmount)}
                        className={txAmount > 0 ? "text-emerald" : ""}
                        forceDecimals={4}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FedaPay wrapper (lazy-loads the button to avoid SSR issues)
// ---------------------------------------------------------------------------

function FedaPayWidget({
  amount,
  currency,
  public_key,
  onComplete,
  onCancel,
}: {
  amount: number;
  currency: { code: string; rate: number; symbol: string };
  public_key: string;
  onComplete: (transactionId: string) => void;
  onCancel?: () => void;
}) {
  const t = useT();
  const [FedaCheckoutButton, setFedaCheckoutButton] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.querySelector('script[src*="cdn.fedapay.com/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
      script.async = true;
      script.onload = () => {
        import("fedapay-reactjs").then((mod) => {
          setFedaCheckoutButton(() => mod.FedaCheckoutButton);
        });
      };
      document.body.appendChild(script);
    script.onerror = (e) => {
      console.error("[Browser] Failed to load FedaPay SDK:", e);
    };
    } else {
      import("fedapay-reactjs").then((mod) => {
        setFedaCheckoutButton(() => mod.FedaCheckoutButton);
      });
    }
  }, []);

  if (!FedaCheckoutButton || typeof window === "undefined" || !(window as any).FedaPay) {
    return (
      <button disabled className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground opacity-60 cursor-wait">
        <Loader2 className="size-4 animate-spin" />
        {t("account.loading_fedapay")}
      </button>
    );
  }

  const options = {
    public_key,
    transaction: {
      amount: Math.round(amount * CURRENCIES.XOF.rate), // Convert USD to XOF (CFA Franc), must be integer
      description: t("account.fedapay_description"),
    },
    currency: {
      iso: "XOF" as const,
    },
    button: {
      class: "mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
      text: t("account.recharge_btn").replace("{amount}", formatMoney(amount, currency)),
    },
    onComplete(resp: { reason?: string; transaction?: { id?: number } }) {
      const FedaPay = (window as any).FedaPay;
      if (FedaPay && resp.reason === FedaPay.DIALOG_DISMISSED) {
        onCancel?.();
        return;
      }
      console.log(`[Browser] FedaPay widget onComplete:`, resp);
      if (resp.transaction?.id) {
        console.log(`[Browser] Transaction ID: ${resp.transaction.id}`);
        onComplete(String(resp.transaction.id));
      }
    },
  };

  return <FedaCheckoutButton options={options as any} />;
}
