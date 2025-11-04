import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Group } from "../types";

interface GroupStore {
  groups: Group[];
  addGroup: (group: Omit<Group, "id" | "createdAt" | "shareCode">) => void;
  joinGroupWithCode: (shareCode: string, studentId: string) => boolean;
  joinGroup: (groupId: string, studentId: string) => void;
  leaveGroup: (groupId: string, studentId: string) => void;
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
      leaveGroup: (groupId, studentId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  studentIds: group.studentIds.filter((id) => id !== studentId),
                }
              : group,
          ),
        })),
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
