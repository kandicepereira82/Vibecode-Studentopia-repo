import { create } from "zustand";
import { connectivityService, ConnectivityState } from "../services/connectivityService";

interface ConnectivityStore {
  isOnline: boolean;
  isInternetReachable: boolean;
  connectionType: string;
  isSyncing: boolean;
  pendingActions: number;
  offlineMessage: string;
  setConnectivityState: (state: ConnectivityState) => void;
  setSyncStatus: (syncing: boolean) => void;
  setPendingActions: (count: number) => void;
  initialize: () => void;
  cleanup: () => void;
}

const useConnectivityStore = create<ConnectivityStore>((set) => ({
  isOnline: true,
  isInternetReachable: true,
  connectionType: "unknown",
  isSyncing: false,
  pendingActions: 0,
  offlineMessage: "",

  setConnectivityState: (state: ConnectivityState) => {
    set({
      isOnline: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      connectionType: state.type,
      offlineMessage: !state.isConnected
        ? "📡 You're offline. Changes will sync when online."
        : state.type === "wifi"
        ? "🌐 Connected to WiFi"
        : state.type === "cellular"
        ? "📶 Connected to Mobile Data"
        : "🌐 Connected",
    });
  },

  setSyncStatus: (syncing: boolean) => {
    set({ isSyncing: syncing });
  },

  setPendingActions: (count: number) => {
    set({ pendingActions: count });
  },

  initialize: () => {
    // Subscribe to connectivity changes
    connectivityService.subscribe((state) => {
      useConnectivityStore.setState((store) => ({
        isOnline: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
        offlineMessage: !state.isConnected
          ? "📡 You're offline. Changes will sync when online."
          : state.type === "wifi"
          ? "🌐 Connected to WiFi"
          : state.type === "cellular"
          ? "📶 Connected to Mobile Data"
          : "🌐 Connected",
      }));
    });
  },

  cleanup: () => {
    connectivityService.destroy();
  },
}));

export default useConnectivityStore;
