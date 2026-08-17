import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "USD" | "EUR" | "XOF" | "NGN" | "IDR" | "BRL" | "INR" | "GBP";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  /** How many local units per 1 USD. */
  rate: number;
  /** Decimals to display for large-ish sums. */
  decimals: number;
};

// Default rates (used as fallback if API fails)
const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  XOF: 605,
  NGN: 1580,
  IDR: 16250,
  BRL: 5.35,
  INR: 83.4,
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    rate: DEFAULT_RATES.USD,
    decimals: 2,
  },
  EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: DEFAULT_RATES.EUR, decimals: 2 },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "Pound Sterling",
    flag: "🇬🇧",
    rate: DEFAULT_RATES.GBP,
    decimals: 2,
  },
  XOF: {
    code: "XOF",
    symbol: "FCFA",
    name: "Franc CFA",
    flag: "🇸🇳",
    rate: DEFAULT_RATES.XOF,
    decimals: 0,
  },
  NGN: {
    code: "NGN",
    symbol: "₦",
    name: "Naira",
    flag: "🇳🇬",
    rate: DEFAULT_RATES.NGN,
    decimals: 0,
  },
  IDR: {
    code: "IDR",
    symbol: "Rp",
    name: "Rupiah",
    flag: "🇮🇩",
    rate: DEFAULT_RATES.IDR,
    decimals: 0,
  },
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Real",
    flag: "🇧🇷",
    rate: DEFAULT_RATES.BRL,
    decimals: 2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Rupee",
    flag: "🇮🇳",
    rate: DEFAULT_RATES.INR,
    decimals: 2,
  },
};

// In-memory cache for live rates
let cachedRates: Record<CurrencyCode, number> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch live exchange rates from ExchangeRate-API (free tier).
 * Falls back to default rates if API fails.
 */
export async function fetchLiveRates(): Promise<Record<CurrencyCode, number>> {
  // Return cached rates if still valid
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number> };

    if (data.rates) {
      const rates: Record<CurrencyCode, number> = {
        USD: 1,
        EUR: data.rates.EUR ?? DEFAULT_RATES.EUR,
        GBP: data.rates.GBP ?? DEFAULT_RATES.GBP,
        XOF: data.rates.XOF ?? DEFAULT_RATES.XOF,
        NGN: data.rates.NGN ?? DEFAULT_RATES.NGN,
        IDR: data.rates.IDR ?? DEFAULT_RATES.IDR,
        BRL: data.rates.BRL ?? DEFAULT_RATES.BRL,
        INR: data.rates.INR ?? DEFAULT_RATES.INR,
      };

      cachedRates = rates;
      cacheTimestamp = Date.now();
      return rates;
    }
  } catch (err) {
    console.error("[currency] Failed to fetch live rates:", err);
  }

  // Fallback to default rates
  return DEFAULT_RATES;
}

/**
 * Update CURRENCIES object with live rates.
 * Call this on app init or periodically.
 */
export async function updateCurrencyRates(): Promise<void> {
  const rates = await fetchLiveRates();
  for (const [code, rate] of Object.entries(rates)) {
    if (code in CURRENCIES) {
      CURRENCIES[code as CurrencyCode].rate = rate;
    }
  }
}

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
    { name: "cortexia-currency", skipHydration: true },
  ),
);

export function useCurrency() {
  const code = useCurrencyStore((s) => s.code);
  return CURRENCIES[code];
}

// Auto-update rates on module load (client-side only)
if (typeof window !== "undefined") {
  updateCurrencyRates().catch(() => {});
}

export function convert(usd: number, c: Currency): number {
  return usd * c.rate;
}

export function formatMoney(
  usd: number,
  c: Currency,
  opts?: { compact?: boolean; forceDecimals?: number },
): string {
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
