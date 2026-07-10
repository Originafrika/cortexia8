import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "USD" | "EUR" | "XOF" | "NGN" | "IDR" | "BRL" | "INR" | "GBP";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  /** How many local units per 1 USD (mocked, stable). */
  rate: number;
  /** Decimals to display for large-ish sums. */
  decimals: number;
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$",    name: "US Dollar",       flag: "🇺🇸", rate: 1,       decimals: 2 },
  EUR: { code: "EUR", symbol: "€",    name: "Euro",            flag: "🇪🇺", rate: 0.92,    decimals: 2 },
  GBP: { code: "GBP", symbol: "£",    name: "Pound Sterling",  flag: "🇬🇧", rate: 0.78,    decimals: 2 },
  XOF: { code: "XOF", symbol: "FCFA", name: "Franc CFA",       flag: "🇸🇳", rate: 605,     decimals: 0 },
  NGN: { code: "NGN", symbol: "₦",    name: "Naira",           flag: "🇳🇬", rate: 1580,    decimals: 0 },
  IDR: { code: "IDR", symbol: "Rp",   name: "Rupiah",          flag: "🇮🇩", rate: 16250,   decimals: 0 },
  BRL: { code: "BRL", symbol: "R$",   name: "Real",            flag: "🇧🇷", rate: 5.35,    decimals: 2 },
  INR: { code: "INR", symbol: "₹",    name: "Rupee",           flag: "🇮🇳", rate: 83.4,    decimals: 2 },
};

type State = {
  code: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
};

export const useCurrencyStore = create<State>()(
  persist(
    (set) => ({
      code: "USD",
      setCurrency: (code) => set({ code }),
    }),
    { name: "cortexia-currency" }
  )
);

export function useCurrency() {
  const code = useCurrencyStore((s) => s.code);
  return CURRENCIES[code];
}

export function convert(usd: number, c: Currency): number {
  return usd * c.rate;
}

export function formatMoney(usd: number, c: Currency, opts?: { compact?: boolean; forceDecimals?: number }): string {
  const value = convert(usd, c);
  const decimals = opts?.forceDecimals ?? (value < 1 ? 4 : c.decimals);
  if (opts?.compact && value >= 1000) {
    return `${c.symbol === "FCFA" ? "" : c.symbol}${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}${c.symbol === "FCFA" ? " FCFA" : ""}`;
  }
  const nf = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return c.symbol === "FCFA" ? `${nf} FCFA` : `${c.symbol}${nf}`;
}
