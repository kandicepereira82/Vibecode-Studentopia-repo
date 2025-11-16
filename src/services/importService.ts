import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import useGroupStore from "../state/groupStore";
import useStatsStore from "../state/statsStore";
import useFriendStore from "../state/friendStore";
import { ExportData } from "./exportService";

export type ImportStrategy = "replace" | "merge";

export interface ImportResult {
  success: boolean;
  message: string;
  itemsImported?: {
    tasks: number;
    groups: number;
    friends: number;
  };
}

/**
 * Validate import data structure
 */
const validateImportData = (data: any): data is ExportData => {
  if (!data || typeof data !== "object") return false;
  if (!data.version || typeof data.version !== "string") return false;
  if (!data.exportedAt || typeof data.exportedAt !== "string") return false;
  if (!data.user || typeof data.user !== "object") return false;
  if (!Array.isArray(data.tasks)) return false;
  if (!Array.isArray(data.groups)) return false;
  if (!Array.isArray(data.friends)) return false;
  return true;
};

/**
 * Pick a JSON file from device storage
 * @returns File content as JSON or null
 */
export const pickImportFile = async (): Promise<ExportData | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];
    const fileContent = await FileSystem.readAsStringAsync(file.uri, {
      encoding: ((FileSystem as any).EncodingType?.UTF8 as any) || 'utf8' as any,
    });

    const data = JSON.parse(fileContent);

    if (!validateImportData(data)) {
      throw new Error("Invalid backup file format");
    }

    return data;
  } catch (error) {
    console.error("Pick import file error:", error);
    throw error;
  }
};

/**
 * Import data with replace strategy (overwrites everything)
 */
const importWithReplace = async (data: ExportData): Promise<ImportResult> => {
  try {
    // Replace user data
    useUserStore.getState().setUser(data.user);

    // Replace tasks
    useTaskStore.setState({ tasks: data.tasks });

    // Replace groups
    useGroupStore.setState({ groups: data.groups });

    // Replace stats
    useStatsStore.setState({ stats: data.stats });

    // Replace friends
    useFriendStore.setState({ friends: data.friends });

    return {
      success: true,
      message: "Data restored successfully",
      itemsImported: {
        tasks: data.tasks.length,
        groups: data.groups.length,
        friends: data.friends.length,
      },
    };
  } catch (error) {
    console.error("Import with replace error:", error);
    return {
      success: false,
      message: "Failed to restore data",
    };
  }
};

/**
 * Import data with merge strategy (keeps existing data and adds new)
 */
const importWithMerge = async (data: ExportData): Promise<ImportResult> => {
  try {
    const currentUser = useUserStore.getState().user;

    if (!currentUser) {
      // If no current user, just do a replace
      return importWithReplace(data);
    }

    // Merge user preferences (keep current userId but update settings)
    const mergedUser = {
      ...data.user,
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email || data.user.email,
      createdAt: currentUser.createdAt,
    };
    useUserStore.getState().setUser(mergedUser);

    // Merge tasks (avoid duplicates by checking IDs)
    const currentTasks = useTaskStore.getState().tasks;
    const existingTaskIds = new Set(currentTasks.map((t) => t.id));
    const newTasks = data.tasks.filter((t) => !existingTaskIds.has(t.id));
    useTaskStore.setState({ tasks: [...currentTasks, ...newTasks] });

    // Merge groups (avoid duplicates)
    const currentGroups = useGroupStore.getState().groups;
    const existingGroupIds = new Set(currentGroups.map((g) => g.id));
    const newGroups = data.groups.filter((g) => !existingGroupIds.has(g.id));
    useGroupStore.setState({ groups: [...currentGroups, ...newGroups] });

    // Merge stats (keep higher values)
    const currentStats = useStatsStore.getState().stats;
    if (currentStats && data.stats) {
      const mergedStats = {
        ...currentStats,
        totalTasksCompleted: Math.max(
          currentStats.totalTasksCompleted,
          data.stats.totalTasksCompleted || 0
        ),
        longestStreak: Math.max(
          currentStats.longestStreak,
          data.stats.longestStreak || 0
        ),
        totalStudyMinutes: Math.max(
          currentStats.totalStudyMinutes,
          data.stats.totalStudyMinutes || 0
        ),
        achievements: [
          ...currentStats.achievements,
          ...(data.stats.achievements || []).filter(
            (a: any) => !currentStats.achievements.find((ca) => ca.id === a.id)
          ),
        ],
      };
      useStatsStore.setState({ stats: mergedStats });
    } else if (data.stats) {
      useStatsStore.setState({ stats: data.stats });
    }

    // Merge friends (avoid duplicates)
    const currentFriends = useFriendStore.getState().friends;
    const existingFriendIds = new Set(currentFriends.map((f) => f.id));
    const newFriends = data.friends.filter((f) => !existingFriendIds.has(f.id));
    useFriendStore.setState({ friends: [...currentFriends, ...newFriends] });

    return {
      success: true,
      message: "Data merged successfully",
      itemsImported: {
        tasks: newTasks.length,
        groups: newGroups.length,
        friends: newFriends.length,
      },
    };
  } catch (error) {
    console.error("Import with merge error:", error);
    return {
      success: false,
      message: "Failed to merge data",
    };
  }
};

/**
 * Import data from JSON file
 * @param data Parsed import data
 * @param strategy Import strategy (replace or merge)
 */
export const importData = async (
  data: ExportData,
  strategy: ImportStrategy = "replace"
): Promise<ImportResult> => {
  try {
    if (strategy === "replace") {
      return await importWithReplace(data);
    } else {
      return await importWithMerge(data);
    }
  } catch (error) {
    console.error("Import data error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Preview import data without applying it
 */
export const previewImportData = (data: ExportData) => {
  return {
    version: data.version,
    exportedAt: new Date(data.exportedAt),
    username: data.user?.username || "Unknown",
    itemCounts: {
      tasks: data.tasks?.length || 0,
      groups: data.groups?.length || 0,
      friends: data.friends?.length || 0,
      achievements: data.stats?.achievements?.length || 0,
    },
    stats: {
      totalTasksCompleted: data.stats?.totalTasksCompleted || 0,
      longestStreak: data.stats?.longestStreak || 0,
      totalStudyMinutes: data.stats?.totalStudyMinutes || 0,
    },
  };
};
