import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "./authStore";

export type Group = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  archived: boolean;
  members: User[];
  createdAt: string;
  updatedAt: string;
};

// Hardcoded mock contacts
export const MOCK_CONTACTS: User[] = [
  { id: "u1", name: "Alice Smith", email: "alice@example.com", currency: "USD", avatarColor: "red" },
  { id: "u2", name: "Bob Johnson", email: "bob@example.com", currency: "USD", avatarColor: "blue" },
  { id: "u3", name: "Charlie Brown", email: "charlie@example.com", currency: "EUR", avatarColor: "green" },
  { id: "u4", name: "Diana Prince", email: "diana@example.com", currency: "USD", avatarColor: "purple" },
  { id: "u5", name: "Evan Wright", email: "evan@example.com", currency: "INR", avatarColor: "orange" },
  { id: "u6", name: "Fiona Gallagher", email: "fiona@example.com", currency: "USD", avatarColor: "pink" },
];

type GroupState = {
  groups: Group[];
  addGroup: (group: Group) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  archiveGroup: (id: string, archived: boolean) => void;
};

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [],
      addGroup: (group) =>
        set((state) => ({ groups: [...state.groups, group] })),
      updateGroup: (id, updatedFields) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, ...updatedFields, updatedAt: new Date().toISOString() } : g
          ),
        })),
      archiveGroup: (id, archived) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, archived, updatedAt: new Date().toISOString() } : g
          ),
        })),
    }),
    {
      name: "group-storage",
    }
  )
);
