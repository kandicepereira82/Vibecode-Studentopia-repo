import { create } from "zustand";
import { StudyRoom, StudyRoomParticipant, TimerMode, StudyPalAnimal } from "../types";
import { presenceService } from "../services/presenceService";

interface StudyRoomStore {
  rooms: StudyRoom[];
  roomsById: Map<string, StudyRoom>; // OPTIMIZATION: Map index for O(1) lookups
  currentRoomId: string | null;

  // Room Management
  createRoom: (
    hostUserId: string,
    hostUsername: string,
    roomName: string,
    isPrivate: boolean,
    invitedFriendIds?: string[]
  ) => string;
  joinRoom: (
    roomId: string,
    userId: string,
    username: string,
    animal: StudyPalAnimal
  ) => boolean;
  leaveRoom: (roomId: string, userId: string) => void;
  deleteRoom: (roomId: string, userId: string) => boolean;

  // Timer Control (Host only)
  startTimer: (roomId: string, userId: string) => boolean;
  pauseTimer: (roomId: string, userId: string) => boolean;
  stopTimer: (roomId: string, userId: string) => boolean;
  switchMode: (roomId: string, userId: string, mode: TimerMode) => boolean;
  setTimerDuration: (roomId: string, userId: string, minutes: number, seconds: number) => boolean;

  // Invitations
  inviteFriend: (roomId: string, userId: string, friendUserId: string) => boolean;
  removeInvite: (roomId: string, userId: string, friendUserId: string) => boolean;

  // Query Methods
  getRoom: (roomId: string) => StudyRoom | undefined;
  getUserRooms: (userId: string) => StudyRoom[];
  getPublicRooms: () => StudyRoom[];
  getInvitedRooms: (userId: string) => StudyRoom[];
  isUserInRoom: (roomId: string, userId: string) => boolean;
  isHost: (roomId: string, userId: string) => boolean;

  // Current Room
  setCurrentRoom: (roomId: string | null) => void;
  getCurrentRoom: () => StudyRoom | undefined;
}

// OPTIMIZATION: Map index for O(1) lookups (not persisted, rebuilt on init)
let roomsByIdIndex: Map<string, StudyRoom> = new Map();

const useStudyRoomStore = create<StudyRoomStore>((set, get) => ({
  rooms: [],
  roomsById: roomsByIdIndex, // OPTIMIZATION: Map index for O(1) lookups
  currentRoomId: null,

  createRoom: (hostUserId, hostUsername, roomName, isPrivate, invitedFriendIds = []) => {
    const newRoom: StudyRoom = {
      id: Date.now().toString() + Math.random().toString(36),
      name: roomName,
      hostUserId,
      hostUsername,
      participantIds: [hostUserId],
      participants: [
        {
          userId: hostUserId,
          username: hostUsername,
          animal: "redpanda" as StudyPalAnimal,
          joinedAt: new Date(),
          isHost: true,
        },
      ],
      isPrivate,
      invitedFriendIds,
      timerRunning: false,
      timerMode: "study",
      timerMinutes: 25,
      timerSeconds: 0,
      createdAt: new Date(),
      maxParticipants: 10,
    };

    set((state) => {
      // OPTIMIZATION: Update Map index
      roomsByIdIndex.set(newRoom.id, newRoom);
      return {
        rooms: [...state.rooms, newRoom],
        roomsById: roomsByIdIndex,
      };
    });

    // Update presence
    presenceService.joinStudyRoom(hostUserId, newRoom.id);

    return newRoom.id;
  },

  joinRoom: (roomId, userId, username, animal) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room) return false;

    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      return false;
    }

    // Check if already in room
    if (room.participantIds.includes(userId)) {
      return true;
    }

    // Check if private room
    if (room.isPrivate && !room.invitedFriendIds.includes(userId)) {
      return false;
    }

    const newParticipant: StudyRoomParticipant = {
      userId,
      username,
      animal,
      joinedAt: new Date(),
      isHost: false,
    };

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              participantIds: [...r.participantIds, userId],
              participants: [...r.participants, newParticipant],
            }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    // Update presence
    presenceService.joinStudyRoom(userId, roomId);

    return true;
  },

  leaveRoom: (roomId, userId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room) return;

    // If host leaves, delete the room
    if (room.hostUserId === userId) {
      set((state) => {
        // OPTIMIZATION: Update Map index
        roomsByIdIndex.delete(roomId);
        return {
          rooms: state.rooms.filter((r) => r.id !== roomId),
          roomsById: roomsByIdIndex,
        };
      });

      // Update presence for all participants
      room.participantIds.forEach((pId) => {
        presenceService.leaveStudyRoom(pId);
      });

      return;
    }

    // Remove participant
    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              participantIds: r.participantIds.filter((id) => id !== userId),
              participants: r.participants.filter((p) => p.userId !== userId),
            }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    // Update presence
    presenceService.leaveStudyRoom(userId);

    // Clear current room if leaving current room
    if (get().currentRoomId === roomId) {
      set({ currentRoomId: null });
    }
  },

  deleteRoom: (roomId, userId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;

    set((state) => {
      // OPTIMIZATION: Update Map index
      const newRoomsById = new Map(state.roomsById);
      newRoomsById.delete(roomId);
      return {
        rooms: state.rooms.filter((r) => r.id !== roomId),
        roomsById: newRoomsById,
      };
    });

    // Update presence for all participants
    room.participantIds.forEach((pId) => {
      presenceService.leaveStudyRoom(pId);
    });

    return true;
  },

  startTimer: (roomId, userId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? { ...r, timerRunning: true, timerStartedAt: new Date() }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    return true;
  },

  pauseTimer: (roomId, userId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId ? { ...r, timerRunning: false } : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    return true;
  },

  stopTimer: (roomId, userId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;

    const duration = room.timerMode === "study" ? 25 : 5;

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              timerRunning: false,
              timerMinutes: duration,
              timerSeconds: 0,
              timerStartedAt: undefined,
            }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    return true;
  },

  switchMode: (roomId, userId, mode) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;

    const duration = mode === "study" ? 25 : 5;

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              timerMode: mode,
              timerMinutes: duration,
              timerSeconds: 0,
              timerRunning: false,
            }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    return true;
  },

  setTimerDuration: (roomId, userId, minutes, seconds) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? { ...r, timerMinutes: minutes, timerSeconds: seconds }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    return true;
  },

  inviteFriend: (roomId, userId, friendUserId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;
    if (room.invitedFriendIds.includes(friendUserId)) return false;

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              invitedFriendIds: [...r.invitedFriendIds, friendUserId],
            }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    return true;
  },

  removeInvite: (roomId, userId, friendUserId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    if (!room || room.hostUserId !== userId) return false;

    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              invitedFriendIds: r.invitedFriendIds.filter((id) => id !== friendUserId),
            }
          : r
      );
      // OPTIMIZATION: Update Map index
      const updatedRoom = updatedRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        roomsByIdIndex.set(roomId, updatedRoom);
      }
      return {
        rooms: updatedRooms,
        roomsById: roomsByIdIndex,
      };
    });

    return true;
  },

  getRoom: (roomId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    return roomsByIdIndex.get(roomId);
  },

  getUserRooms: (userId) => {
    return get().rooms.filter((r) => r.participantIds.includes(userId));
  },

  getPublicRooms: () => {
    return get().rooms.filter((r) => !r.isPrivate);
  },

  getInvitedRooms: (userId) => {
    return get().rooms.filter((r) => r.invitedFriendIds.includes(userId));
  },

  isUserInRoom: (roomId, userId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    return room ? room.participantIds.includes(userId) : false;
  },

  isHost: (roomId, userId) => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const room = roomsByIdIndex.get(roomId);
    return room ? room.hostUserId === userId : false;
  },

  setCurrentRoom: (roomId) => {
    set({ currentRoomId: roomId });
  },

  getCurrentRoom: () => {
    // OPTIMIZATION: O(1) lookup instead of O(n) find
    const { currentRoomId } = get();
    if (!currentRoomId) return undefined;
    return roomsByIdIndex.get(currentRoomId);
  },
}));

// OPTIMIZATION: Rebuild index when rooms array changes
useStudyRoomStore.subscribe(
  (state) => {
    const rooms = state.rooms;
    roomsByIdIndex.clear();
    rooms.forEach((room: any) => roomsByIdIndex.set(room.id, room));
  }
);

export default useStudyRoomStore;
