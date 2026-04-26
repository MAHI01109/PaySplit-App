"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/currencyStore";
import { useAuthStore } from "@/store/authStore";

const SUPPORTED_CURRENCIES = ["INR", "USD", "EUR"] as const;

export function CurrencyRatesBootstrap() {
  const { isLoggedIn } = useAuthStore();
  const { fetchRates } = useCurrencyStore();

  useEffect(() => {
    if (!isLoggedIn) return;

    const hydrateRates = async () => {
      await Promise.allSettled(SUPPORTED_CURRENCIES.map((currency) => fetchRates(currency)));
    };

    hydrateRates();
    window.addEventListener("online", hydrateRates);

    return () => {
      window.removeEventListener("online", hydrateRates);
    };
  }, [isLoggedIn, fetchRates]);

  return null;
}
