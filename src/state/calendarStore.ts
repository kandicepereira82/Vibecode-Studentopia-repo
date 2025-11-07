import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarConnection, LinkedAccount } from "../types";

interface CalendarStore {
  // Calendar Connections
  connections: CalendarConnection[];

  // Linked Accounts (Parent-Child)
  linkedAccounts: LinkedAccount[];

  // Calendar Connection Management
  addConnection: (connection: CalendarConnection) => void;
  updateConnection: (id: string, updates: Partial<CalendarConnection>) => void;
  removeConnection: (id: string) => void;
  getConnectionsByUserId: (userId: string) => CalendarConnection[];
  toggleConnectionVisibility: (id: string) => void;
  toggleConnectionSync: (id: string) => void;

  // Linked Account Management
  addLinkedAccount: (linkedAccount: LinkedAccount) => void;
  removeLinkedAccount: (id: string) => void;
  getLinkedAccountsByParentId: (parentUserId: string) => LinkedAccount[];
  getLinkedAccountsByChildId: (childUserId: string) => LinkedAccount[];
  updateLinkedAccountNotifications: (id: string, enabled: boolean) => void;

  // Utility
  clearAllConnections: () => void;
}

const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      connections: [],
      linkedAccounts: [],

      // Calendar Connection Management
      addConnection: (connection) => {
        set((state) => ({
          connections: [...state.connections, connection],
        }));
      },

      updateConnection: (id, updates) => {
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
        }));
      },

      removeConnection: (id) => {
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
        }));
      },

      getConnectionsByUserId: (userId) => {
        return get().connections.filter((conn) => conn.userId === userId);
      },

      toggleConnectionVisibility: (id) => {
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, isVisible: !conn.isVisible } : conn
          ),
        }));
      },

      toggleConnectionSync: (id) => {
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, syncEnabled: !conn.syncEnabled } : conn
          ),
        }));
      },

      // Linked Account Management
      addLinkedAccount: (linkedAccount) => {
        set((state) => ({
          linkedAccounts: [...state.linkedAccounts, linkedAccount],
        }));
      },

      removeLinkedAccount: (id) => {
        set((state) => ({
          linkedAccounts: state.linkedAccounts.filter((acc) => acc.id !== id),
        }));
      },

      getLinkedAccountsByParentId: (parentUserId) => {
        return get().linkedAccounts.filter((acc) => acc.parentUserId === parentUserId);
      },

      getLinkedAccountsByChildId: (childUserId) => {
        return get().linkedAccounts.filter((acc) => acc.childUserId === childUserId);
      },

      updateLinkedAccountNotifications: (id, enabled) => {
        set((state) => ({
          linkedAccounts: state.linkedAccounts.map((acc) =>
            acc.id === id ? { ...acc, notificationsEnabled: enabled } : acc
          ),
        }));
      },

      // Utility
      clearAllConnections: () => {
        set({ connections: [], linkedAccounts: [] });
      },
    }),
    {
      name: "calendar-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCalendarStore;
