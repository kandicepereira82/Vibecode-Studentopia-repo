import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import useGroupStore from "../state/groupStore";
import useStatsStore from "../state/statsStore";
import useFriendStore from "../state/friendStore";

/**
 * Data export format
 */
export interface ExportData {
  version: string;
  exportedAt: string;
  user: any;
  tasks: any[];
  groups: any[];
  stats: any;
  friends: any[];
}

/**
 * Export all user data to JSON file
 * @returns Export file URI or null if failed
 */
export const exportAllData = async (): Promise<string | null> => {
  try {
    // Get all data from stores
    const user = useUserStore.getState().user;
    const tasks = useTaskStore.getState().tasks;
    const groups = useGroupStore.getState().groups;
    const stats = useStatsStore.getState().stats;
    const friends = useFriendStore.getState().friends;

    if (!user) {
      throw new Error("No user data to export");
    }

    // Create export data object
    const exportData: ExportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      user,
      tasks,
      groups,
      stats,
      friends,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const filename = `studentopia-backup-${timestamp}.json`;

    // Save to file system
    const documentDir = (FileSystem as any).documentDirectory as string | null;
    if (!documentDir) {
      throw new Error("Document directory not available");
    }
    const fileUri = `${documentDir}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: ((FileSystem as any).EncodingType?.UTF8 as any) || 'utf8' as any,
    });

    return fileUri;
  } catch (error) {
    console.error("Export error:", error);
    return null;
  }
};

/**
 * Share exported data file
 * @param fileUri File URI from exportAllData
 */
export const shareExportedData = async (fileUri: string): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: "application/json",
      dialogTitle: "Export Studentopia Data",
      UTI: "public.json",
    });

    return true;
  } catch (error) {
    console.error("Share error:", error);
    return false;
  }
};

/**
 * Delete exported file after sharing
 * @param fileUri File URI to delete
 */
export const deleteExportedFile = async (fileUri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch (error) {
    console.error("Delete file error:", error);
  }
};

/**
 * Get last export timestamp from file system
 * @returns Last export date or null
 */
export const getLastExportTimestamp = async (): Promise<Date | null> => {
  try {
    const dir = (FileSystem as any).documentDirectory as string | null;
    if (!dir) return null;

    const files = await FileSystem.readDirectoryAsync(dir);
    const backupFiles = files
      .filter((f) => f.startsWith("studentopia-backup-"))
      .sort()
      .reverse();

    if (backupFiles.length === 0) return null;

    // Extract timestamp from filename
    const latestFile = backupFiles[0];
    const timestampStr = latestFile
      .replace("studentopia-backup-", "")
      .replace(".json", "");

    // Parse timestamp
    const date = new Date(timestampStr.replace(/-/g, ":").replace("T", "T") + "Z");
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error("Get last export timestamp error:", error);
    return null;
  }
};

/**
 * Get total data size estimate
 * @returns Size in KB
 */
export const getDataSizeEstimate = (): number => {
  try {
    const user = useUserStore.getState().user;
    const tasks = useTaskStore.getState().tasks;
    const groups = useGroupStore.getState().groups;
    const stats = useStatsStore.getState().stats;
    const friends = useFriendStore.getState().friends;

    const data = { user, tasks, groups, stats, friends };
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024);

    return sizeInKB;
  } catch (error) {
    console.error("Get data size error:", error);
    return 0;
  }
};
