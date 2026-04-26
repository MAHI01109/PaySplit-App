import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  currency: "USD" | "EUR" | "INR";
  avatarColor: string;
};

type AuthState = {
  user: User | null;
  isOnboarded: boolean;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  login: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,
      isLoggedIn: false,
      setUser: (user: User) => set({ user, isOnboarded: true }),
      login: () => set({ isLoggedIn: true }),
      logout: () => {
        set({ user: null, isOnboarded: false, isLoggedIn: false });
        [
          "auth-storage",
          "group-storage",
          "expense-storage",
          "settlement-storage",
          "currency-storage",
          "nominatim_cache",
        ].forEach((key) => localStorage.removeItem(key));
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
