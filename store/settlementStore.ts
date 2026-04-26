import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Settlement = {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: "USD" | "EUR" | "INR";
  date: string;
};

type SettlementState = {
  settlements: Settlement[];
  addSettlement: (settlement: Settlement) => void;
  deleteSettlement: (id: string) => void;
};

export const useSettlementStore = create<SettlementState>()(
  persist(
    (set) => ({
      settlements: [],
      addSettlement: (settlement) =>
        set((state) => ({ settlements: [...state.settlements, settlement] })),
      deleteSettlement: (id) =>
        set((state) => ({
          settlements: state.settlements.filter((s) => s.id !== id),
        })),
    }),
    {
      name: "settlement-storage",
    }
  )
);
