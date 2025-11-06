import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Group } from "../types";

interface GroupStore {
  groups: Group[];
  addGroup: (group: Omit<Group, "id" | "createdAt" | "shareCode">) => void;
  updateGroup: (groupId: string, userId: string, updates: Partial<Omit<Group, "id" | "createdAt" | "shareCode" | "teacherId" | "studentIds">>) => boolean;
  joinGroupWithCode: (shareCode: string, studentId: string) => boolean;
  joinGroup: (groupId: string, studentId: string) => void;
  leaveGroup: (groupId: string, studentId: string) => void;
  regenerateShareCode: (groupId: string, userId: string) => string | null;
  getGroupsByStudent: (studentId: string) => Group[];
  getGroupsByTeacher: (teacherId: string) => Group[];
  getGroupByShareCode: (shareCode: string) => Group | undefined;
}

// Generate a random 6-character share code
const generateShareCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      groups: [],
      addGroup: (groupData) => {
        const newGroup: Group = {
          ...groupData,
          id: Date.now().toString() + Math.random().toString(36),
          shareCode: generateShareCode(),
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
      joinGroupWithCode: (shareCode, studentId) => {
        const group = get().groups.find((g) => g.shareCode === shareCode);
        if (group && !group.studentIds.includes(studentId)) {
          set((state) => ({
            groups: state.groups.map((g) =>
              g.id === group.id
                ? { ...g, studentIds: [...g.studentIds, studentId] }
                : g
            ),
          }));
          return true;
        }
        return false;
      },
      joinGroup: (groupId, studentId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId && !group.studentIds.includes(studentId)
              ? { ...group, studentIds: [...group.studentIds, studentId] }
              : group,
          ),
        })),
      leaveGroup: (groupId, studentId) => {
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
      regenerateShareCode: (groupId: string, userId: string) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return null;

        // Permission check: Only the group creator (teacher) can regenerate share codes
        if (group.teacherId !== userId) {
          console.error("Permission denied: Only the group creator can regenerate share codes");
          return null;
        }

        const newCode = generateShareCode();
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, shareCode: newCode }
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
      getGroupByShareCode: (shareCode: string) => {
        return get().groups.find((group) => group.shareCode === shareCode);
      },
    }),
    {
      name: "group-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useGroupStore;
