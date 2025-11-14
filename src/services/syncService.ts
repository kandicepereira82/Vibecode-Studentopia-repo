import AsyncStorage from "@react-native-async-storage/async-storage";
import { connectivityService } from "./connectivityService";
import { Task } from "../types";

export interface QueuedAction {
  id: string;
  type: "create" | "update" | "delete";
  entity: "task" | "reminder";
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class SyncService {
  private syncQueue: QueuedAction[] = [];
  private isSyncing = false;
  private syncListeners: Set<(syncing: boolean) => void> = new Set();
  private connectivityUnsubscribe: (() => void) | null = null;
  // OPTIMIZATION: Promise-based lock to prevent race conditions
  private syncPromise: Promise<void> | null = null;

  /**
   * Initialize sync service and listen for connectivity
   */
  initialize(): void {
    this.connectivityUnsubscribe = connectivityService.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable && !this.isSyncing) {
        this.processSyncQueue();
      }
    });
    // Load queued actions on startup
    this.loadSyncQueue();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.connectivityUnsubscribe) {
      this.connectivityUnsubscribe();
      this.connectivityUnsubscribe = null;
    }
    this.syncListeners.clear();
  }

  /**
   * Add action to offline queue
   */
  async queueAction(action: Omit<QueuedAction, "id" | "timestamp" | "retryCount">): Promise<string> {
    const id = Date.now().toString() + Math.random().toString(36);
    const queuedAction: QueuedAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(queuedAction);
    await this.saveSyncQueue();

    // If online, process immediately
    if (connectivityService.isOnline()) {
      this.processSyncQueue();
    }

    return id;
  }

  /**
   * Process all queued actions
   * OPTIMIZATION: Uses promise-based lock to prevent concurrent execution
   */
  async processSyncQueue(): Promise<void> {
    // If already processing, return the existing promise
    if (this.syncPromise) {
      return this.syncPromise;
    }

    if (this.syncQueue.length === 0) {
      return;
    }

    // Create and store the promise
    this.syncPromise = this._processSyncQueueInternal();

    try {
      await this.syncPromise;
    } finally {
      this.syncPromise = null;
    }
  }

  /**
   * Internal method that does the actual processing
   */
  private async _processSyncQueueInternal(): Promise<void> {
    this.isSyncing = true;
    this.notifySyncListeners(true);

    try {
      while (this.syncQueue.length > 0) {
        const action = this.syncQueue[0];

        const success = await this.processAction(action);

        if (success) {
          // Remove from queue on success
          this.syncQueue.shift();
        } else {
          // Increment retry count
          action.retryCount++;

          if (action.retryCount >= action.maxRetries) {
            // Remove from queue if max retries exceeded
            console.warn(`Max retries exceeded for action ${action.id}`);
            this.syncQueue.shift();
          } else {
            // Stop processing, will retry later
            break;
          }
        }
      }

      await this.saveSyncQueue();
    } catch (error) {
      console.error("Error processing sync queue:", error);
    } finally {
      this.isSyncing = false;
      this.notifySyncListeners(false);
    }
  }

  /**
   * Process a single queued action
   */
  private async processAction(action: QueuedAction): Promise<boolean> {
    try {
      // Simulate sync operation
      // In a real app, this would sync with a backend server
      // For now, we're syncing local data structures

      // Check connectivity before attempting
      if (!connectivityService.isOnline()) {
        return false;
      }

      // For demonstration, all local operations succeed
      // In production, replace with actual server sync
      return true;
    } catch (error) {
      console.error(`Error processing action ${action.id}:`, error);
      return false;
    }
  }

  /**
   * Save sync queue to AsyncStorage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        "@studentopia/sync_queue",
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      console.error("Error saving sync queue:", error);
    }
  }

  /**
   * Load sync queue from AsyncStorage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const queue = await AsyncStorage.getItem("@studentopia/sync_queue");
      this.syncQueue = queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error("Error loading sync queue:", error);
    }
  }

  /**
   * Subscribe to sync status changes
   */
  subscribeSyncStatus(listener: (syncing: boolean) => void): () => void {
    this.syncListeners.add(listener);
    // Immediately notify with current status
    listener(this.isSyncing);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  /**
   * Notify listeners of sync status
   */
  private notifySyncListeners(syncing: boolean): void {
    this.syncListeners.forEach((listener) => {
      try {
        listener(syncing);
      } catch (error) {
        console.error("Error in sync listener:", error);
      }
    });
  }

  /**
   * Get pending sync action count
   */
  getPendingActionCount(): number {
    return this.syncQueue.length;
  }

  /**
   * Get all pending actions (for debugging)
   */
  getPendingActions(): QueuedAction[] {
    return [...this.syncQueue];
  }

  /**
   * Clear sync queue (use with caution)
   */
  async clearQueue(): Promise<void> {
    this.syncQueue = [];
    await AsyncStorage.removeItem("@studentopia/sync_queue");
  }

  /**
   * Is currently syncing
   */
  isSyncing_(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new SyncService();

export default syncService;
