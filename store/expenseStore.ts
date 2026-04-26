import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";

export type Split = {
  userId: string;
  amount: number; // For EXACT or calculated final amounts
  percentage?: number; // For PERCENTAGE
  share?: number; // For SHARES
};

export type AuditLog = {
  timestamp: string;
  action: "CREATED" | "EDITED" | "DELETED";
  details: string;
};

export type Expense = {
  id: string;
  groupId: string;
  amount: number;
  currency: "USD" | "EUR" | "INR";
  description: string;
  date: string;
  category: "Food" | "Travel" | "Utilities" | "Entertainment" | "Other";
  paidBy: string;
  splitType: SplitType;
  splits: Split[];
  image?: string; // base64 or object URL
  location?: {
    lat: number;
    lon: number;
    display_name: string;
  };
  auditLog: AuditLog[];
  baseCurrency?: "USD" | "EUR" | "INR";
  rateDate?: string; // YYYY-MM-DD used for FX snapshot
  historicalRates?: Record<string, number>; // Maps 'USD' -> 1.0, 'INR' -> 83.0, etc. at creation
};

type ExpenseState = {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>, editDetails: string) => void;
  deleteExpense: (id: string, deleteDetails: string) => void;
};

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),
      updateExpense: (id, updatedFields, editDetails) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...updatedFields,
                  auditLog: [
                    ...e.auditLog,
                    { timestamp: new Date().toISOString(), action: "EDITED", details: editDetails },
                  ],
                }
              : e
          ),
        })),
      deleteExpense: (id, _deleteDetails) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
    }),
    {
      name: "expense-storage",
    }
  )
);
