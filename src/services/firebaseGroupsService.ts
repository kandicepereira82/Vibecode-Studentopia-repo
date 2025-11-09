/**
 * FIREBASE GROUPS SERVICE
 *
 * Handles group management with Firestore
 * Enables real multi-user group collaboration
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { Group } from "../types";

const GROUPS_COLLECTION = "groups";

// Generate a random 6-character share code
const generateShareCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Create a new group
 */
export const createGroup = async (groupData: {
  name: string;
  description: string;
  teacherId: string;
  teacherEmail?: string;
  schoolName?: string;
  className?: string;
}): Promise<{ success: boolean; group?: Group; error?: string }> => {
  try {
    const groupId = doc(collection(firestore, GROUPS_COLLECTION)).id;
    const shareCode = generateShareCode();

    const group: Group = {
      id: groupId,
      name: groupData.name,
      description: groupData.description,
      teacherId: groupData.teacherId,
      studentIds: [],
      shareCode,
      school: groupData.schoolName,
      className: groupData.className,
      teacherEmail: groupData.teacherEmail,
      createdAt: new Date(),
    };

    await setDoc(doc(firestore, GROUPS_COLLECTION, groupId), {
      ...group,
      createdAt: serverTimestamp(),
    });

    return { success: true, group };
  } catch (error: any) {
    console.error("Create group error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Join a group with share code
 */
export const joinGroup = async (
  shareCode: string,
  studentId: string
): Promise<{ success: boolean; group?: Group; error?: string }> => {
  try {
    // Find group by share code
    const groupsRef = collection(firestore, GROUPS_COLLECTION);
    const q = query(groupsRef, where("shareCode", "==", shareCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: "Invalid share code" };
    }

    const groupDoc = snapshot.docs[0];
    const groupData = groupDoc.data();

    // Check if already a member
    if (groupData.studentIds?.includes(studentId)) {
      return { success: false, error: "Already a member of this group" };
    }

    // Add student to group
    await updateDoc(doc(firestore, GROUPS_COLLECTION, groupDoc.id), {
      studentIds: arrayUnion(studentId),
    });

    const group: Group = {
      id: groupDoc.id,
      name: groupData.name,
      description: groupData.description,
      teacherId: groupData.teacherId,
      studentIds: [...(groupData.studentIds || []), studentId],
      shareCode: groupData.shareCode,
      school: groupData.school,
      className: groupData.className,
      teacherEmail: groupData.teacherEmail,
      createdAt: (groupData.createdAt as Timestamp)?.toDate() || new Date(),
    };

    return { success: true, group };
  } catch (error: any) {
    console.error("Join group error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Leave a group
 */
export const leaveGroup = async (
  groupId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(firestore, GROUPS_COLLECTION, groupId), {
      studentIds: arrayRemove(studentId),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Leave group error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get groups where user is teacher
 */
export const getTeacherGroups = async (teacherId: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(firestore, GROUPS_COLLECTION);
    const q = query(groupsRef, where("teacherId", "==", teacherId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        teacherId: data.teacherId,
        studentIds: data.studentIds || [],
        shareCode: data.shareCode,
        school: data.school,
        className: data.className,
        teacherEmail: data.teacherEmail,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Get teacher groups error:", error);
    return [];
  }
};

/**
 * Get groups where user is student
 */
export const getStudentGroups = async (studentId: string): Promise<Group[]> => {
  try {
    const groupsRef = collection(firestore, GROUPS_COLLECTION);
    const q = query(groupsRef, where("studentIds", "array-contains", studentId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        teacherId: data.teacherId,
        studentIds: data.studentIds || [],
        shareCode: data.shareCode,
        school: data.school,
        className: data.className,
        teacherEmail: data.teacherEmail,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Get student groups error:", error);
    return [];
  }
};

/**
 * Get a specific group by ID
 */
export const getGroup = async (
  groupId: string
): Promise<{ success: boolean; group?: Group; error?: string }> => {
  try {
    const groupDoc = await getDoc(doc(firestore, GROUPS_COLLECTION, groupId));

    if (!groupDoc.exists()) {
      return { success: false, error: "Group not found" };
    }

    const data = groupDoc.data();
    const group: Group = {
      id: groupDoc.id,
      name: data.name,
      description: data.description,
      teacherId: data.teacherId,
      studentIds: data.studentIds || [],
      shareCode: data.shareCode,
      school: data.school,
      className: data.className,
      teacherEmail: data.teacherEmail,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };

    return { success: true, group };
  } catch (error: any) {
    console.error("Get group error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update group details (teacher only)
 */
export const updateGroup = async (
  groupId: string,
  teacherId: string,
  updates: Partial<Omit<Group, "id" | "createdAt" | "shareCode" | "teacherId" | "studentIds">>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify teacher owns the group
    const groupDoc = await getDoc(doc(firestore, GROUPS_COLLECTION, groupId));
    if (!groupDoc.exists()) {
      return { success: false, error: "Group not found" };
    }

    if (groupDoc.data().teacherId !== teacherId) {
      return { success: false, error: "Permission denied" };
    }

    await updateDoc(doc(firestore, GROUPS_COLLECTION, groupId), updates);
    return { success: true };
  } catch (error: any) {
    console.error("Update group error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Regenerate share code (teacher only)
 */
export const regenerateShareCode = async (
  groupId: string,
  teacherId: string
): Promise<{ success: boolean; shareCode?: string; error?: string }> => {
  try {
    // Verify teacher owns the group
    const groupDoc = await getDoc(doc(firestore, GROUPS_COLLECTION, groupId));
    if (!groupDoc.exists()) {
      return { success: false, error: "Group not found" };
    }

    if (groupDoc.data().teacherId !== teacherId) {
      return { success: false, error: "Permission denied" };
    }

    const newShareCode = generateShareCode();
    await updateDoc(doc(firestore, GROUPS_COLLECTION, groupId), {
      shareCode: newShareCode,
    });

    return { success: true, shareCode: newShareCode };
  } catch (error: any) {
    console.error("Regenerate share code error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete group (teacher only)
 */
export const deleteGroup = async (
  groupId: string,
  teacherId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify teacher owns the group
    const groupDoc = await getDoc(doc(firestore, GROUPS_COLLECTION, groupId));
    if (!groupDoc.exists()) {
      return { success: false, error: "Group not found" };
    }

    if (groupDoc.data().teacherId !== teacherId) {
      return { success: false, error: "Permission denied" };
    }

    await deleteDoc(doc(firestore, GROUPS_COLLECTION, groupId));
    return { success: true };
  } catch (error: any) {
    console.error("Delete group error:", error);
    return { success: false, error: error.message };
  }
};

export default {
  createGroup,
  joinGroup,
  leaveGroup,
  getTeacherGroups,
  getStudentGroups,
  getGroup,
  updateGroup,
  regenerateShareCode,
  deleteGroup,
};
