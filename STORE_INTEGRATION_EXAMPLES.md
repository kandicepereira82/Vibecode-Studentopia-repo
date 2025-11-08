# Store Integration Examples

This document shows how to integrate the backend API and real-time sync into existing Zustand stores.

## Friend Store Integration

### Updated `src/state/friendStore.ts`

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Friend } from "../types";
import { friendsApi } from "../api/backend";
import { realtimeService } from "../services/realtimeService";
import { pushNotificationService, notificationTemplates } from "../services/pushNotificationService";

interface FriendStore {
  friends: Friend[];
  isLoading: boolean;
  error: string | null;

  // API Actions
  fetchFriends: (userId: string) => Promise<void>;
  sendFriendRequest: (userId: string, friendUserId: string) => Promise<void>;
  acceptFriendRequest: (friendId: string, userId: string) => Promise<boolean>;
  rejectFriendRequest: (friendId: string, userId: string) => Promise<boolean>;
  removeFriend: (friendId: string, userId: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<any[]>;

  // Local state updates (called by real-time events)
  addFriend: (friend: Friend) => void;
  updateFriend: (friendId: string, updates: Partial<Friend>) => void;
  deleteFriend: (friendId: string) => void;

  // Query Methods (unchanged)
  getFriends: (userId: string) => Friend[];
  getPendingRequests: (userId: string) => Friend[];
  getSentRequests: (userId: string) => Friend[];
  searchFriends: (userId: string, query: string) => Friend[];
}

const useFriendStore = create<FriendStore>()(
  persist(
    (set, get) => ({
      friends: [],
      isLoading: false,
      error: null,

      // Fetch friends from API
      fetchFriends: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const friends = await friendsApi.getFriends(userId);
          set({ friends, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          console.error("Failed to fetch friends:", error);
        }
      },

      // Send friend request via API
      sendFriendRequest: async (userId: string, friendUserId: string) => {
        try {
          const friend = await friendsApi.sendFriendRequest(userId, friendUserId);

          // Add to local state
          set((state) => ({ friends: [...state.friends, friend] }));

          // Notify target user via real-time
          realtimeService.send("friend_request", { friend });
        } catch (error: any) {
          console.error("Failed to send friend request:", error);
          throw error;
        }
      },

      // Accept friend request via API
      acceptFriendRequest: async (friendId: string, userId: string) => {
        try {
          const friend = await friendsApi.acceptFriendRequest(friendId);

          // Update local state
          set((state) => ({
            friends: state.friends.map((f) =>
              f.id === friendId
                ? { ...f, status: "accepted" as const, acceptedAt: new Date() }
                : f
            ),
          }));

          // Notify requester via real-time
          realtimeService.send("friend_accepted", { friend });

          return true;
        } catch (error: any) {
          console.error("Failed to accept friend request:", error);
          return false;
        }
      },

      // Reject friend request via API
      rejectFriendRequest: async (friendId: string, userId: string) => {
        try {
          await friendsApi.rejectFriendRequest(friendId);

          // Update local state
          set((state) => ({
            friends: state.friends.map((f) =>
              f.id === friendId ? { ...f, status: "rejected" as const } : f
            ),
          }));

          return true;
        } catch (error: any) {
          console.error("Failed to reject friend request:", error);
          return false;
        }
      },

      // Remove friend via API
      removeFriend: async (friendId: string, userId: string) => {
        try {
          await friendsApi.removeFriend(friendId);

          // Remove from local state
          set((state) => ({
            friends: state.friends.filter((f) => f.id !== friendId),
          }));

          return true;
        } catch (error: any) {
          console.error("Failed to remove friend:", error);
          return false;
        }
      },

      // Search users via API
      searchUsers: async (query: string) => {
        try {
          return await friendsApi.searchUsers(query);
        } catch (error: any) {
          console.error("Failed to search users:", error);
          return [];
        }
      },

      // Local state management (for real-time updates)
      addFriend: (friend: Friend) => {
        set((state) => ({ friends: [...state.friends, friend] }));
      },

      updateFriend: (friendId: string, updates: Partial<Friend>) => {
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, ...updates } : f
          ),
        }));
      },

      deleteFriend: (friendId: string) => {
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        }));
      },

      // Query methods (unchanged)
      getFriends: (userId) => {
        return get().friends.filter(
          (f) =>
            f.status === "accepted" &&
            (f.userId === userId || f.friendUserId === userId)
        );
      },

      getPendingRequests: (userId) => {
        return get().friends.filter(
          (f) =>
            f.status === "pending" &&
            f.friendUserId === userId &&
            f.requestedBy !== userId
        );
      },

      getSentRequests: (userId) => {
        return get().friends.filter(
          (f) => f.status === "pending" && f.requestedBy === userId
        );
      },

      searchFriends: (userId, query) => {
        const lowerQuery = query.toLowerCase();
        return get()
          .getFriends(userId)
          .filter(
            (f) =>
              f.friendUsername.toLowerCase().includes(lowerQuery) ||
              f.friendEmail?.toLowerCase().includes(lowerQuery)
          );
      },
    }),
    {
      name: "friend-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Real-time event listeners
export const initializeFriendRealtimeListeners = (userId: string) => {
  // Friend request received
  realtimeService.on("friend_request", (data) => {
    const store = useFriendStore.getState();
    store.addFriend(data.friend);

    // Show notification
    pushNotificationService.sendLocalNotification(
      notificationTemplates.friendRequest(data.friend.friendUsername).title,
      notificationTemplates.friendRequest(data.friend.friendUsername).body,
      notificationTemplates.friendRequest(data.friend.friendUsername).data
    );
  });

  // Friend request accepted
  realtimeService.on("friend_accepted", (data) => {
    const store = useFriendStore.getState();
    store.updateFriend(data.friend.id, {
      status: "accepted",
      acceptedAt: new Date(),
    });

    // Show notification
    pushNotificationService.sendLocalNotification(
      notificationTemplates.friendAccepted(data.friend.friendUsername).title,
      notificationTemplates.friendAccepted(data.friend.friendUsername).body,
      notificationTemplates.friendAccepted(data.friend.friendUsername).data
    );
  });

  // Friend went online
  realtimeService.on("friend_online", (data) => {
    console.log("Friend came online:", data.userId);
    // Update presence in presence store
  });
};

export default useFriendStore;
```

## Study Room Store Integration

### Updated `src/state/studyRoomStore.ts`

```typescript
import { create } from "zustand";
import { StudyRoom, StudyPalAnimal } from "../types";
import { studyRoomsApi } from "../api/backend";
import { realtimeService } from "../services/realtimeService";
import { pushNotificationService, notificationTemplates } from "../services/pushNotificationService";

interface StudyRoomStore {
  rooms: StudyRoom[];
  currentRoomId: string | null;
  isLoading: boolean;
  error: string | null;

  // API Actions
  fetchPublicRooms: () => Promise<void>;
  createRoom: (roomData: {
    name: string;
    hostUserId: string;
    hostUsername: string;
    isPrivate: boolean;
  }) => Promise<string>;
  joinRoom: (roomId: string, userId: string, username: string) => Promise<boolean>;
  leaveRoom: (roomId: string, userId: string) => Promise<void>;
  inviteFriend: (roomId: string, userId: string, friendUserId: string) => Promise<boolean>;
  updateTimer: (roomId: string, timerState: any) => Promise<void>;
  sendMessage: (roomId: string, userId: string, username: string, content: string) => Promise<void>;

  // Local state updates
  addRoom: (room: StudyRoom) => void;
  updateRoom: (roomId: string, updates: Partial<StudyRoom>) => void;
  removeRoom: (roomId: string) => void;
  addParticipant: (roomId: string, participant: any) => void;
  removeParticipant: (roomId: string, userId: string) => void;

  // Current room
  setCurrentRoom: (roomId: string | null) => void;
  getCurrentRoom: () => StudyRoom | undefined;

  // Query methods
  getRoom: (roomId: string) => StudyRoom | undefined;
  getPublicRooms: () => StudyRoom[];
  isHost: (roomId: string, userId: string) => boolean;
}

const useStudyRoomStore = create<StudyRoomStore>((set, get) => ({
  rooms: [],
  currentRoomId: null,
  isLoading: false,
  error: null,

  // Fetch public rooms from API
  fetchPublicRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const rooms = await studyRoomsApi.getPublicRooms();
      set({ rooms, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error("Failed to fetch rooms:", error);
    }
  },

  // Create room via API
  createRoom: async (roomData) => {
    try {
      const room = await studyRoomsApi.createRoom(roomData);

      // Add to local state
      set((state) => ({ rooms: [...state.rooms, room] }));

      // Join room's real-time channel
      realtimeService.send("room:join", { roomId: room.id, userId: roomData.hostUserId });

      return room.id;
    } catch (error: any) {
      console.error("Failed to create room:", error);
      throw error;
    }
  },

  // Join room via API
  joinRoom: async (roomId, userId, username) => {
    try {
      const room = await studyRoomsApi.joinRoom(roomId, userId, username);

      // Update local state
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === roomId ? room : r)),
      }));

      // Join room's real-time channel
      realtimeService.send("room:join", { roomId, userId, username });

      return true;
    } catch (error: any) {
      console.error("Failed to join room:", error);
      return false;
    }
  },

  // Leave room via API
  leaveRoom: async (roomId, userId) => {
    try {
      await studyRoomsApi.leaveRoom(roomId, userId);

      // Remove from local state or update participants
      const room = get().rooms.find((r) => r.id === roomId);
      if (room?.hostUserId === userId) {
        // Host left, remove room
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== roomId),
        }));
      } else {
        // Participant left, update room
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  participants: r.participants.filter((p) => p.userId !== userId),
                  participantIds: r.participantIds.filter((id) => id !== userId),
                }
              : r
          ),
        }));
      }

      // Leave room's real-time channel
      realtimeService.send("room:leave", { roomId, userId });

      // Clear current room if leaving current room
      if (get().currentRoomId === roomId) {
        set({ currentRoomId: null });
      }
    } catch (error: any) {
      console.error("Failed to leave room:", error);
    }
  },

  // Invite friend via API
  inviteFriend: async (roomId, userId, friendUserId) => {
    try {
      await studyRoomsApi.inviteFriend(roomId, friendUserId);

      // Update local state
      set((state) => ({
        rooms: state.rooms.map((r) =>
          r.id === roomId
            ? { ...r, invitedFriendIds: [...r.invitedFriendIds, friendUserId] }
            : r
        ),
      }));

      // Notify friend via real-time
      realtimeService.send("room:invite", { roomId, friendUserId });

      return true;
    } catch (error: any) {
      console.error("Failed to invite friend:", error);
      return false;
    }
  },

  // Update timer via API
  updateTimer: async (roomId, timerState) => {
    try {
      await studyRoomsApi.updateTimer(roomId, timerState);

      // Update local state
      set((state) => ({
        rooms: state.rooms.map((r) =>
          r.id === roomId ? { ...r, ...timerState } : r
        ),
      }));

      // Broadcast to room via real-time
      realtimeService.send("room:timer", { roomId, timerState });
    } catch (error: any) {
      console.error("Failed to update timer:", error);
    }
  },

  // Send message via API
  sendMessage: async (roomId, userId, username, content) => {
    try {
      await studyRoomsApi.sendMessage(roomId, userId, username, content);

      // Broadcast via real-time (message will be saved in chat store)
      realtimeService.send("room:message", {
        roomId,
        userId,
        username,
        content,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Failed to send message:", error);
    }
  },

  // Local state updates (for real-time events)
  addRoom: (room) => {
    set((state) => ({ rooms: [...state.rooms, room] }));
  },

  updateRoom: (roomId, updates) => {
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r)),
    }));
  },

  removeRoom: (roomId) => {
    set((state) => ({ rooms: state.rooms.filter((r) => r.id !== roomId) }));
  },

  addParticipant: (roomId, participant) => {
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              participants: [...r.participants, participant],
              participantIds: [...r.participantIds, participant.userId],
            }
          : r
      ),
    }));
  },

  removeParticipant: (roomId, userId) => {
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              participants: r.participants.filter((p) => p.userId !== userId),
              participantIds: r.participantIds.filter((id) => id !== userId),
            }
          : r
      ),
    }));
  },

  // Current room
  setCurrentRoom: (roomId) => {
    set({ currentRoomId: roomId });
  },

  getCurrentRoom: () => {
    const { currentRoomId, rooms } = get();
    if (!currentRoomId) return undefined;
    return rooms.find((r) => r.id === currentRoomId);
  },

  // Query methods
  getRoom: (roomId) => {
    return get().rooms.find((r) => r.id === roomId);
  },

  getPublicRooms: () => {
    return get().rooms.filter((r) => !r.isPrivate);
  },

  isHost: (roomId, userId) => {
    const room = get().rooms.find((r) => r.id === roomId);
    return room ? room.hostUserId === userId : false;
  },
}));

// Real-time event listeners
export const initializeRoomRealtimeListeners = (userId: string) => {
  // Room created
  realtimeService.on("room_created", (data) => {
    const store = useStudyRoomStore.getState();
    store.addRoom(data.room);
  });

  // Participant joined
  realtimeService.on("room_participant_joined", (data) => {
    const store = useStudyRoomStore.getState();
    store.addParticipant(data.roomId, data.participant);
  });

  // Participant left
  realtimeService.on("room_participant_left", (data) => {
    const store = useStudyRoomStore.getState();
    store.removeParticipant(data.roomId, data.userId);
  });

  // Timer updated
  realtimeService.on("room_timer_updated", (data) => {
    const store = useStudyRoomStore.getState();
    store.updateRoom(data.roomId, data.timerState);
  });

  // Room invitation
  realtimeService.on("room_invitation", (data) => {
    // Show notification
    pushNotificationService.sendLocalNotification(
      notificationTemplates.roomInvite(data.roomName, data.hostName).title,
      notificationTemplates.roomInvite(data.roomName, data.hostName).body,
      {
        ...notificationTemplates.roomInvite(data.roomName, data.hostName).data,
        targetId: data.roomId,
      }
    );
  });
};

export default useStudyRoomStore;
```

## Usage in App.tsx

```typescript
import { useEffect } from 'react';
import useUserStore from './src/state/userStore';
import useFriendStore, { initializeFriendRealtimeListeners } from './src/state/friendStore';
import useStudyRoomStore, { initializeRoomRealtimeListeners } from './src/state/studyRoomStore';
import { realtimeService } from './src/services/realtimeService';
import { pushNotificationService } from './src/services/pushNotificationService';
import { setAuthToken } from './src/api/backend';

function App() {
  const user = useUserStore((s) => s.user);
  const fetchFriends = useFriendStore((s) => s.fetchFriends);
  const fetchPublicRooms = useStudyRoomStore((s) => s.fetchPublicRooms);

  useEffect(() => {
    if (user) {
      // Set auth token
      setAuthToken(user.authToken || '');

      // Initialize real-time sync
      realtimeService.connect(user.id);

      // Initialize push notifications
      pushNotificationService.initialize(user.id);

      // Set up real-time listeners
      initializeFriendRealtimeListeners(user.id);
      initializeRoomRealtimeListeners(user.id);

      // Fetch initial data
      fetchFriends(user.id);
      fetchPublicRooms();

      return () => {
        realtimeService.disconnect();
        pushNotificationService.cleanup();
      };
    }
  }, [user?.id]);

  return <NavigationContainer>{/* Your app */}</NavigationContainer>;
}
```

## Updated FriendsScreen Usage

```typescript
import useFriendStore from "../state/friendStore";

const FriendsScreen = () => {
  const user = useUserStore((s) => s.user);
  const isLoading = useFriendStore((s) => s.isLoading);
  const sendFriendRequest = useFriendStore((s) => s.sendFriendRequest);
  const searchUsers = useFriendStore((s) => s.searchUsers);

  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (query: string) => {
    const results = await searchUsers(query);
    setSearchResults(results);
  };

  const handleSendRequest = async (friendUserId: string) => {
    if (!user) return;
    try {
      await sendFriendRequest(user.id, friendUserId);
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  // Rest of component...
};
```

---

**Key Changes:**

1. ✅ All CRUD operations use backend API
2. ✅ Real-time updates sync across devices
3. ✅ Push notifications for invites
4. ✅ Offline caching with persistence
5. ✅ Loading and error states
6. ✅ Type-safe TypeScript
7. ✅ Clean separation of concerns
