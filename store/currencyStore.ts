import { create } from "zustand";
import { persist } from "zustand/middleware";

type RatesCache = {
  [baseCurrency: string]: {
    rates: Record<string, number>;
    timestamp: number;
  };
};

type CurrencyState = {
  ratesCache: RatesCache;
  fetchRates: (baseCurrency: string) => Promise<void>;
  getRate: (from: string, to: string) => number;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      ratesCache: {},
      fetchRates: async (baseCurrency: string) => {
        const state = get();
        const now = Date.now();
        const cacheEntry = state.ratesCache[baseCurrency];

        // 24 hours TTL
        const isCacheValid = cacheEntry && now - cacheEntry.timestamp < 24 * 60 * 60 * 1000;

        if (isCacheValid) {
          return; // Use cached rates
        }

        try {
          // Frankfurter API doesn't support base=EUR if the from currency is EUR (it's the default).
          // And if base is something else, we pass it. But let's fetch for the specific base.
          // Since EUR is default, if base is EUR we just fetch latest.
          const url = baseCurrency === "EUR" 
            ? "https://api.frankfurter.dev/v1/latest" 
            : `https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`;

          const response = await fetch(url);
          if (!response.ok) throw new Error("Failed to fetch rates");

          const data = await response.json();
          set((s) => ({
            ratesCache: {
              ...s.ratesCache,
              [baseCurrency]: {
                rates: data.rates,
                timestamp: now,
              },
            },
          }));
        } catch (error) {
          console.error("Currency fetch failed:", error);
          // If offline or failed, we just leave whatever was in the cache.
        }
      },
      getRate: (from: string, to: string) => {
        if (from === to) return 1;
        const state = get();
        
        // If we have from-based rates
        if (state.ratesCache[from]?.rates[to]) {
          return state.ratesCache[from].rates[to];
        }

        // If we have to-based rates, invert it
        if (state.ratesCache[to]?.rates[from]) {
          return 1 / state.ratesCache[to].rates[from];
        }

        // Default fallback (should ideally not happen if we pre-fetch)
        return 1;
      },
    }),
    {
      name: "currency-storage",
    }
  )
);
