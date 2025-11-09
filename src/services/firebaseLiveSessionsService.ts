/**
 * FIREBASE LIVE SESSIONS SERVICE
 *
 * Handles live study sessions with Firebase Realtime Database
 * Provides real-time synchronization for:
 * - Timer states
 * - Participant lists
 * - Chat messages
 * - Room updates
 */

import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { realtimeDb } from "../../firebaseConfig";
import { StudyRoom, StudyRoomParticipant, TimerMode, StudyPalAnimal } from "../types";

const ROOMS_PATH = "study_rooms";
const MESSAGES_PATH = "room_messages";

/**
 * Create a new study room
 */
export const createStudyRoom = async (
  hostUserId: string,
  hostUsername: string,
  roomName: string,
  isPrivate: boolean,
  hostAnimal: StudyPalAnimal = "redpanda"
): Promise<{ success: boolean; roomId?: string; error?: string }> => {
  try {
    const roomsRef = ref(realtimeDb, ROOMS_PATH);
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key;

    if (!roomId) {
      return { success: false, error: "Failed to generate room ID" };
    }

    const participant: StudyRoomParticipant = {
      userId: hostUserId,
      username: hostUsername,
      animal: hostAnimal,
      joinedAt: new Date(),
      isHost: true,
    };

    const room: Omit<StudyRoom, "id"> = {
      name: roomName,
      hostUserId,
      hostUsername,
      participantIds: [hostUserId],
      participants: [participant],
      isPrivate,
      invitedFriendIds: [],
      timerRunning: false,
      timerMode: "study",
      timerMinutes: 25,
      timerSeconds: 0,
      createdAt: new Date(),
      maxParticipants: 10,
    };

    await set(newRoomRef, {
      ...room,
      createdAt: serverTimestamp(),
      participants: [{ ...participant, joinedAt: serverTimestamp() }],
    });

    return { success: true, roomId };
  } catch (error: any) {
    console.error("Create study room error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Join a study room
 */
export const joinStudyRoom = async (
  roomId: string,
  userId: string,
  username: string,
  animal: StudyPalAnimal
): Promise<{ success: boolean; error?: string }> => {
  try {
    const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      return { success: false, error: "Room not found" };
    }

    const room = snapshot.val();

    // Check if already in room
    if (room.participantIds?.includes(userId)) {
      return { success: true }; // Already in room
    }

    // Check if room is full
    if (room.participants?.length >= room.maxParticipants) {
      return { success: false, error: "Room is full" };
    }

    // Check if room is private and user is invited
    if (room.isPrivate && !room.invitedFriendIds?.includes(userId)) {
      return { success: false, error: "Room is private" };
    }

    const participant: StudyRoomParticipant = {
      userId,
      username,
      animal,
      joinedAt: new Date(),
      isHost: false,
    };

    await update(roomRef, {
      participantIds: [...(room.participantIds || []), userId],
      participants: [
        ...(room.participants || []),
        { ...participant, joinedAt: serverTimestamp() },
      ],
    });

    return { success: true };
  } catch (error: any) {
    console.error("Join study room error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Leave a study room
 */
export const leaveStudyRoom = async (
  roomId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      return { success: false, error: "Room not found" };
    }

    const room = snapshot.val();

    // If host is leaving, delete the entire room
    if (room.hostUserId === userId) {
      await remove(roomRef);
      return { success: true };
    }

    // Remove participant
    const updatedParticipantIds = (room.participantIds || []).filter(
      (id: string) => id !== userId
    );
    const updatedParticipants = (room.participants || []).filter(
      (p: StudyRoomParticipant) => p.userId !== userId
    );

    await update(roomRef, {
      participantIds: updatedParticipantIds,
      participants: updatedParticipants,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Leave study room error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update timer state (host only)
 */
export const updateTimer = async (
  roomId: string,
  userId: string,
  timerState: {
    running: boolean;
    mode: TimerMode;
    minutes: number;
    seconds: number;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      return { success: false, error: "Room not found" };
    }

    const room = snapshot.val();

    // Verify user is host
    if (room.hostUserId !== userId) {
      return { success: false, error: "Only host can control timer" };
    }

    await update(roomRef, {
      timerRunning: timerState.running,
      timerMode: timerState.mode,
      timerMinutes: timerState.minutes,
      timerSeconds: timerState.seconds,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update timer error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send chat message
 */
export const sendChatMessage = async (
  roomId: string,
  userId: string,
  username: string,
  content: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const messagesRef = ref(realtimeDb, `${MESSAGES_PATH}/${roomId}`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      userId,
      username,
      content: content.substring(0, 1000), // Limit message length
      timestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Send chat message error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to room updates
 */
export const listenToRoom = (
  roomId: string,
  callback: (room: StudyRoom | null) => void
): (() => void) => {
  const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`);

  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const room: StudyRoom = {
        id: roomId,
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        participants: (data.participants || []).map((p: any) => ({
          ...p,
          joinedAt: p.joinedAt ? new Date(p.joinedAt) : new Date(),
        })),
      };
      callback(room);
    } else {
      callback(null); // Room was deleted
    }
  });

  // Return unsubscribe function
  return () => off(roomRef, "value", unsubscribe);
};

/**
 * Listen to chat messages
 */
export const listenToChatMessages = (
  roomId: string,
  callback: (messages: any[]) => void
): (() => void) => {
  const messagesRef = ref(realtimeDb, `${MESSAGES_PATH}/${roomId}`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messagesObj = snapshot.val();
      const messages = Object.entries(messagesObj).map(([id, data]: [string, any]) => ({
        id,
        ...data,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      }));
      callback(messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
    } else {
      callback([]);
    }
  });

  return () => off(messagesRef, "value", unsubscribe);
};

/**
 * Get public rooms
 */
export const getPublicRooms = async (): Promise<StudyRoom[]> => {
  try {
    const roomsRef = ref(realtimeDb, ROOMS_PATH);
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const roomsObj = snapshot.val();
    const rooms: StudyRoom[] = Object.entries(roomsObj)
      .filter(([_, data]: [string, any]) => !data.isPrivate)
      .map(([id, data]: [string, any]) => ({
        id,
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        participants: (data.participants || []).map((p: any) => ({
          ...p,
          joinedAt: p.joinedAt ? new Date(p.joinedAt) : new Date(),
        })),
      }));

    return rooms;
  } catch (error) {
    console.error("Get public rooms error:", error);
    return [];
  }
};

/**
 * Invite friend to room
 */
export const inviteToRoom = async (
  roomId: string,
  hostUserId: string,
  friendUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      return { success: false, error: "Room not found" };
    }

    const room = snapshot.val();

    // Verify user is host
    if (room.hostUserId !== hostUserId) {
      return { success: false, error: "Only host can invite friends" };
    }

    const invitedIds = room.invitedFriendIds || [];
    if (!invitedIds.includes(friendUserId)) {
      await update(roomRef, {
        invitedFriendIds: [...invitedIds, friendUserId],
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Invite to room error:", error);
    return { success: false, error: error.message };
  }
};

export default {
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  updateTimer,
  sendChatMessage,
  listenToRoom,
  listenToChatMessages,
  getPublicRooms,
  inviteToRoom,
};
