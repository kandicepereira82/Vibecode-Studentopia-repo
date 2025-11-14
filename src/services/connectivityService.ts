import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ConnectivityListener {
  (state: ConnectivityState): void;
}

export interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  timestamp: number;
}

class ConnectivityService {
  private listeners: Set<ConnectivityListener> = new Set();
  private currentState: ConnectivityState = {
    isConnected: true,
    isInternetReachable: true,
    type: "unknown",
    timestamp: Date.now(),
  };
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize connectivity monitoring
   */
  initialize(): void {
    if (this.unsubscribe) {
      return; // Already initialized
    }

    // Subscribe to connectivity changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.handleConnectivityChange(state);
    });

    // Get initial state
    NetInfo.fetch()
      .then((state) => {
        this.handleConnectivityChange(state);
      })
      .catch((error) => {
        console.error("Error fetching initial connectivity state:", error);
      });
  }

  /**
   * Handle connectivity state changes
   */
  private handleConnectivityChange(state: NetInfoState): void {
    const newState: ConnectivityState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type ?? "unknown",
      timestamp: Date.now(),
    };

    this.currentState = newState;

    // Save to AsyncStorage for offline access
    this.saveConnectivityState(newState);

    // Notify all listeners
    this.notifyListeners(newState);
  }

  /**
   * Subscribe to connectivity changes
   */
  subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.currentState);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of connectivity change
   */
  private notifyListeners(state: ConnectivityState): void {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error("Error in connectivity listener:", error);
      }
    });
  }

  /**
   * Get current connectivity state
   */
  getState(): ConnectivityState {
    return this.currentState;
  }

  /**
   * Check if device is connected to internet
   */
  isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  /**
   * Check if device has internet reachability
   */
  hasInternetReachability(): boolean {
    return this.currentState.isInternetReachable;
  }

  /**
   * Save connectivity state to AsyncStorage
   */
  private async saveConnectivityState(state: ConnectivityState): Promise<void> {
    try {
      await AsyncStorage.setItem(
        "@studentopia/connectivity_state",
        JSON.stringify(state)
      );
    } catch (error) {
      console.error("Error saving connectivity state:", error);
    }
  }

  /**
   * Get last known connectivity state from AsyncStorage
   */
  async getLastKnownState(): Promise<ConnectivityState | null> {
    try {
      const state = await AsyncStorage.getItem("@studentopia/connectivity_state");
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error("Error retrieving connectivity state:", error);
      return null;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

// Create singleton instance
export const connectivityService = new ConnectivityService();

export default connectivityService;
