import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Group } from "../types";

interface GroupStore {
  groups: Group[];
  addGroup: (group: Omit<Group, "id" | "createdAt" | "shareCode" | "shareCodeHash">) => void;
  updateGroup: (groupId: string, userId: string, updates: Partial<Omit<Group, "id" | "createdAt" | "shareCode" | "shareCodeHash" | "teacherId" | "studentIds">>) => boolean;
  joinGroupWithCode: (shareCode: string, studentId: string, authenticatedUserId: string) => { success: boolean; message: string };
  leaveGroup: (groupId: string, studentId: string) => void;
  regenerateShareCode: (groupId: string, userId: string) => string | null;
  getGroupsByStudent: (studentId: string) => Group[];
  getGroupsByTeacher: (teacherId: string) => Group[];
  getGroupByShareCode: (shareCode: string) => Group | undefined;
}

// SECURITY FIX: Generate a random 6-character share code
const generateShareCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// SECURITY FIX: Hash share code before storage
const hashShareCode = async (code: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    code
  );
};

const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      groups: [],
      addGroup: async (groupData) => {
        // SECURITY FIX: Generate share code and hash it
        const shareCode = generateShareCode();
        const shareCodeHash = await hashShareCode(shareCode);
        
        const newGroup: Group = {
          ...groupData,
          id: Date.now().toString() + Math.random().toString(36),
          shareCode, // Keep plain code for display/return, but store hash
          shareCodeHash, // Store hash for security
          createdAt: new Date(),
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
      },
      updateGroup: (groupId, userId, updates) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return false;

        // Permission check: Only the group creator (teacher) can update group details
        if (group.teacherId !== userId) {
          console.error("Permission denied: Only the group creator can update this group");
          return false;
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, ...updates }
              : g
          ),
        }));
        return true;
      },
      joinGroupWithCode: async (shareCode, studentId, authenticatedUserId) => {
        // SECURITY: Validate that studentId matches authenticated user
        if (studentId !== authenticatedUserId) {
          console.error("Permission denied: Cannot join as another user");
          return { success: false, message: "Authentication error" };
        }

        // SECURITY FIX: Hash the provided code and compare with stored hash
        const codeHash = await hashShareCode(shareCode);
        const group = get().groups.find((g) => {
          // Support both old format (plain code) and new format (hashed)
          if (g.shareCodeHash) {
            return g.shareCodeHash === codeHash;
          }
          // Legacy: compare plain codes (for backward compatibility)
          return g.shareCode === shareCode;
        });

        if (!group) {
          return { success: false, message: "Invalid share code" };
        }

        if (group.studentIds.includes(studentId)) {
          return { success: false, message: "Already a member of this group" };
        }

        // Optional: Check maximum group size
        const MAX_GROUP_SIZE = 100;
        if (group.studentIds.length >= MAX_GROUP_SIZE) {
          return { success: false, message: "Group is full" };
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === group.id
              ? { ...g, studentIds: [...g.studentIds, studentId] }
              : g
          ),
        }));

        return { success: true, message: "Successfully joined group" };
      },
      leaveGroup: (groupId: string, studentId: string) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return;

        // Permission check: Teachers cannot leave groups they created
        if (group.teacherId === studentId) {
          console.error("Permission denied: Group creators cannot leave their own groups");
          return;
        }

        // Permission check: Only members can leave
        if (!group.studentIds.includes(studentId)) {
          console.error("Permission denied: You are not a member of this group");
          return;
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  studentIds: g.studentIds.filter((id) => id !== studentId),
                }
              : g,
          ),
        }));
      },
      regenerateShareCode: async (groupId: string, userId: string) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return null;

        // Permission check: Only the group creator (teacher) can regenerate share codes
        if (group.teacherId !== userId) {
          console.error("Permission denied: Only the group creator can regenerate share codes");
          return null;
        }

        // SECURITY FIX: Generate new code and hash it
        const newCode = generateShareCode();
        const newCodeHash = await hashShareCode(newCode);
        
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, shareCode: newCode, shareCodeHash: newCodeHash }
              : g
          ),
        }));
        return newCode;
      },
      getGroupsByStudent: (studentId: string) => {
        return get().groups.filter((group) =>
          group.studentIds.includes(studentId),
        );
      },
      getGroupsByTeacher: (teacherId: string) => {
        return get().groups.filter((group) => group.teacherId === teacherId);
      },
      getGroupByShareCode: async (shareCode: string) => {
        // SECURITY FIX: Hash code before lookup
        const codeHash = await hashShareCode(shareCode);
        return get().groups.find((group) => {
          // Support both old format (plain code) and new format (hashed)
          if (group.shareCodeHash) {
            return group.shareCodeHash === codeHash;
          }
          // Legacy: compare plain codes (for backward compatibility)
          return group.shareCode === shareCode;
        });
      },
    }),
    {
      name: "group-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useGroupStore;
