import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PriceDisplay } from "@/components/price-display";
import { CurrencyPicker } from "@/components/currency-picker";
import { CreditCard, Smartphone, Bitcoin, Wallet, Check, Loader2 } from "lucide-react";
import { useCurrency, formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { verifyFedaPayTransaction, createStripeCheckout } from "@/lib/api/payments";
import { getUserBalance, getTransactionHistory } from "@/lib/api/balance";
import { loadSession } from "@/lib/auth-store";

export const Route = createFileRoute("/app/account")({
  component: AccountPage,
});

type TxRow = { d: string; label: string; amount: number; kind: "debit" | "credit" };

const METHODS = [
  { key: "mm", name: "Mobile Money", desc: "Orange · MTN · Wave · M-Pesa", icon: Smartphone },
  { key: "card", name: "Carte", desc: "Visa · Mastercard · Amex", icon: CreditCard },
  { key: "crypto", name: "Crypto", desc: "USDT · USDC · BTC · ETH", icon: Bitcoin },
  { key: "ali", name: "Alipay", desc: "Chine et Asie du Sud-Est", icon: Wallet },
];

function AccountPage() {
  const c = useCurrency();
  const [method, setMethod] = useState<string>("mm");
  const [amount, setAmount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [txRows, setTxRows] = useState<TxRow[]>([]);

  const fedapayKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY as string | undefined;

  async function fetchBalance() {
    try {
      const session = loadSession();
      if (!session?.user?.id) return;
      const userId = Number(session.user.id);
      if (isNaN(userId)) return;
      const result = await getUserBalance({ data: { userId } });
      setBalance(result.balance);
    } catch {
      // silently ignore — balance stays null
    }
  }

  async function fetchTransactions() {
    try {
      const session = loadSession();
      const userId = Number(session?.user?.id);
      if (isNaN(userId)) return;
      const result = await getTransactionHistory({ data: { userId } });
      setTxRows(result.transactions);
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
        toast.info("Veuillez utiliser le bouton FedaPay ci-dessous.");
        return;
      }

      if (method === "card") {
        const result = await createStripeCheckout({
          data: { amount, currency: "usd" },
        });
        if (result.ok && result.url) {
          window.location.href = result.url;
        } else {
          toast.error(result.error ?? "Impossible de créer la session Stripe.");
        }
        return;
      }

      toast.info("Ce mode de paiement n'est pas encore disponible.");
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFedaPayComplete(transactionId: string) {
    try {
      const result = await verifyFedaPayTransaction({
        data: { transactionId, amount },
      });
      if (result.ok) {
        if (result.balance != null) {
          setBalance(result.balance);
        } else {
          fetchBalance();
        }
        toast.success("Crédits ajoutés avec succès !");
      } else {
        toast.error(result.message ?? "Vérification échouée.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la vérification FedaPay.");
    }
  }

  const isFedaPayReady = method === "mm" && !!fedapayKey;
  const isStripeReady = method === "card";
  const canRecharge = isStripeReady || method === "mm";
  const isUnsupported = method === "crypto" || method === "ali";

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 space-y-10">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Compte
        </div>
        <h1 className="mt-2 font-display text-4xl tracking-[-0.03em]">Solde et facturation.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        {/* Credit card */}
        <div className="relative aspect-[1.586/1] rounded-3xl overflow-hidden p-6 flex flex-col justify-between surface-gradient-border bg-[linear-gradient(135deg,oklch(0.22_0.05_60),oklch(0.14_0.02_50))]">
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-amber/20 blur-3xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft/90">
                Solde disponible
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
              Cortexia — Compte principal
            </div>
            <div className="mt-1 font-mono text-sm text-foreground/90">
              •••• •••• •••• {new Date().getFullYear().toString().slice(-4)}
            </div>
          </div>
        </div>

        {/* Recharge */}
        <div className="surface-gradient-border rounded-3xl bg-surface-1/60 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Recharger
          </div>
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
                <button
                  key={v}
                  onClick={() => setAmount(v)}
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

            {/* FedaPay button (Mobile Money) */}
            {isFedaPayReady && (
              <div className="mt-5">
                <FedaPayWidget
                  amount={amount}
                  public_key={fedapayKey!}
                  onComplete={handleFedaPayComplete}
                />
              </div>
            )}

            {/* Generic recharge button (Stripe / unsupported) */}
            {!isFedaPayReady && (
              <button
                onClick={handleRecharge}
                disabled={loading || isUnsupported}
                className={cn(
                  "mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition",
                  isUnsupported
                    ? "bg-surface-3 text-muted-foreground cursor-not-allowed"
                    : "bg-amber text-primary-foreground hover:opacity-95",
                )}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  `Recharger ${formatMoney(amount, c)}`
                )}
              </button>
            )}

            {isUnsupported && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Bientôt disponible.
              </p>
            )}
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
              {txRows.map((t) => {
                const amount = Number(t.amount);
                const date = new Date(t.created_at);
                const d = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                const label = t.reference ?? t.type;
                return (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-2/40">
                    <td className="p-4 text-muted-foreground font-mono text-xs">{d}</td>
                    <td className="p-4">{label}</td>
                    <td
                      className={
                        "p-4 text-right font-mono tabular " +
                        (amount > 0 ? "text-emerald" : "text-foreground/85")
                      }
                    >
                      {amount > 0 ? "+" : ""}
                      <PriceDisplay
                        usd={Math.abs(amount)}
                        className={amount > 0 ? "text-emerald" : ""}
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
  public_key,
  onComplete,
}: {
  amount: number;
  public_key: string;
  onComplete: (transactionId: string) => void;
}) {
  const [FedaCheckoutButton, setFedaCheckoutButton] = useState<any>(null);

  // Dynamic import to avoid SSR issues with the FedaPay CDN script
  useState(() => {
    if (typeof window !== "undefined") {
      import("fedapay-reactjs").then((mod) => {
        setFedaCheckoutButton(() => mod.FedaCheckoutButton);
      });
    }
  });

  if (!FedaCheckoutButton) {
    return (
      <button disabled className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground opacity-60 cursor-wait">
        <Loader2 className="size-4 animate-spin" />
        Chargement FedaPay…
      </button>
    );
  }

  const options = {
    public_key,
    transaction: {
      amount,
      description: "Recharge de crédits Cortexia",
    },
    currency: {
      iso: "XOF" as const,
    },
    button: {
      class: "mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95 transition",
      text: `Recharger ${amount} XOF`,
    },
    onComplete(resp: { reason?: string; transaction?: { id?: number } }) {
      const FedaPay = window.FedaPay;
      if (FedaPay && resp.reason === FedaPay.DIALOG_DISMISSED) return;
      if (resp.transaction?.id) {
        onComplete(String(resp.transaction.id));
      }
    },
  };

  return <FedaCheckoutButton options={options as any} />;
}
