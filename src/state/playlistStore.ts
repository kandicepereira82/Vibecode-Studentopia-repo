import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MusicTrack } from "../services/musicService";

export interface PlaylistState {
  // Playlist tracks
  playlist: MusicTrack[];
  currentTrackIndex: number;

  // Playback settings
  isShuffleEnabled: boolean;
  repeatMode: "off" | "one" | "all"; // off = no repeat, one = repeat current, all = repeat playlist

  // Shuffle history
  shuffleOrder: number[]; // Track indices in shuffle order
  originalIndex: number; // Original index before shuffle

  // Actions
  addTrack: (track: MusicTrack) => void;
  removeTrack: (trackId: string) => void;
  clearPlaylist: () => void;
  setCurrentTrackIndex: (index: number) => void;
  nextTrack: () => number | null; // Returns next track index or null if no more tracks
  previousTrack: () => number | null; // Returns previous track index or null
  toggleShuffle: () => void;
  setRepeatMode: (mode: "off" | "one" | "all") => void;
  reorderTrack: (fromIndex: number, toIndex: number) => void;

  // Helper functions
  getCurrentTrack: () => MusicTrack | null;
  hasNextTrack: () => boolean;
  hasPreviousTrack: () => boolean;
}

const generateShuffleOrder = (length: number, currentIndex: number): number[] => {
  // Generate shuffle order, keeping current track at position 0
  const indices = Array.from({ length }, (_, i) => i);
  const shuffled = [currentIndex];

  // Remove current index from available indices
  const remaining = indices.filter(i => i !== currentIndex);

  // Fisher-Yates shuffle for remaining indices
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  return [...shuffled, ...remaining];
};

const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlist: [],
      currentTrackIndex: 0,
      isShuffleEnabled: false,
      repeatMode: "off",
      shuffleOrder: [],
      originalIndex: 0,

      addTrack: (track) => {
        const { playlist } = get();
        // Check if track already exists
        const exists = playlist.some(t => t.id === track.id);
        if (exists) return;

        set((state) => ({
          playlist: [...state.playlist, track],
        }));
      },

      removeTrack: (trackId) => {
        set((state) => {
          const newPlaylist = state.playlist.filter(t => t.id !== trackId);
          let newIndex = state.currentTrackIndex;

          // Adjust current index if needed
          if (newIndex >= newPlaylist.length) {
            newIndex = Math.max(0, newPlaylist.length - 1);
          }

          return {
            playlist: newPlaylist,
            currentTrackIndex: newIndex,
            shuffleOrder: state.isShuffleEnabled
              ? generateShuffleOrder(newPlaylist.length, newIndex)
              : [],
          };
        });
      },

      clearPlaylist: () => {
        set({
          playlist: [],
          currentTrackIndex: 0,
          shuffleOrder: [],
          originalIndex: 0,
        });
      },

      setCurrentTrackIndex: (index) => {
        const { playlist, isShuffleEnabled } = get();
        if (index < 0 || index >= playlist.length) return;

        set({
          currentTrackIndex: index,
          originalIndex: index,
          shuffleOrder: isShuffleEnabled
            ? generateShuffleOrder(playlist.length, index)
            : [],
        });
      },

      nextTrack: () => {
        const {
          playlist,
          currentTrackIndex,
          isShuffleEnabled,
          shuffleOrder,
          repeatMode
        } = get();

        if (playlist.length === 0) return null;

        // Repeat one - stay on same track
        if (repeatMode === "one") {
          return currentTrackIndex;
        }

        let nextIndex: number;

        if (isShuffleEnabled && shuffleOrder.length > 0) {
          // Find current position in shuffle order
          const currentPos = shuffleOrder.indexOf(currentTrackIndex);

          if (currentPos === shuffleOrder.length - 1) {
            // At end of shuffle order
            if (repeatMode === "all") {
              nextIndex = shuffleOrder[0]; // Loop back to start
            } else {
              return null; // No more tracks
            }
          } else {
            nextIndex = shuffleOrder[currentPos + 1];
          }
        } else {
          // Normal sequential play
          if (currentTrackIndex === playlist.length - 1) {
            // At end of playlist
            if (repeatMode === "all") {
              nextIndex = 0; // Loop back to start
            } else {
              return null; // No more tracks
            }
          } else {
            nextIndex = currentTrackIndex + 1;
          }
        }

        set({ currentTrackIndex: nextIndex });
        return nextIndex;
      },

      previousTrack: () => {
        const {
          playlist,
          currentTrackIndex,
          isShuffleEnabled,
          shuffleOrder
        } = get();

        if (playlist.length === 0) return null;

        let prevIndex: number;

        if (isShuffleEnabled && shuffleOrder.length > 0) {
          // Find current position in shuffle order
          const currentPos = shuffleOrder.indexOf(currentTrackIndex);

          if (currentPos === 0) {
            // At start of shuffle order, wrap to end
            prevIndex = shuffleOrder[shuffleOrder.length - 1];
          } else {
            prevIndex = shuffleOrder[currentPos - 1];
          }
        } else {
          // Normal sequential play
          if (currentTrackIndex === 0) {
            // At start of playlist, wrap to end
            prevIndex = playlist.length - 1;
          } else {
            prevIndex = currentTrackIndex - 1;
          }
        }

        set({ currentTrackIndex: prevIndex });
        return prevIndex;
      },

      toggleShuffle: () => {
        set((state) => {
          const newShuffleEnabled = !state.isShuffleEnabled;

          return {
            isShuffleEnabled: newShuffleEnabled,
            shuffleOrder: newShuffleEnabled
              ? generateShuffleOrder(state.playlist.length, state.currentTrackIndex)
              : [],
          };
        });
      },

      setRepeatMode: (mode) => {
        set({ repeatMode: mode });
      },

      reorderTrack: (fromIndex, toIndex) => {
        set((state) => {
          const newPlaylist = [...state.playlist];
          const [movedTrack] = newPlaylist.splice(fromIndex, 1);
          newPlaylist.splice(toIndex, 0, movedTrack);

          // Update current index if needed
          let newCurrentIndex = state.currentTrackIndex;
          if (fromIndex === state.currentTrackIndex) {
            newCurrentIndex = toIndex;
          } else if (fromIndex < state.currentTrackIndex && toIndex >= state.currentTrackIndex) {
            newCurrentIndex--;
          } else if (fromIndex > state.currentTrackIndex && toIndex <= state.currentTrackIndex) {
            newCurrentIndex++;
          }

          return {
            playlist: newPlaylist,
            currentTrackIndex: newCurrentIndex,
            shuffleOrder: state.isShuffleEnabled
              ? generateShuffleOrder(newPlaylist.length, newCurrentIndex)
              : [],
          };
        });
      },

      getCurrentTrack: () => {
        const { playlist, currentTrackIndex } = get();
        if (playlist.length === 0 || currentTrackIndex >= playlist.length) {
          return null;
        }
        return playlist[currentTrackIndex];
      },

      hasNextTrack: () => {
        const { playlist, currentTrackIndex, repeatMode } = get();
        if (playlist.length === 0) return false;
        if (repeatMode !== "off") return true; // Can always go next with repeat
        return currentTrackIndex < playlist.length - 1;
      },

      hasPreviousTrack: () => {
        const { playlist, currentTrackIndex } = get();
        if (playlist.length === 0) return false;
        return currentTrackIndex > 0 || playlist.length > 1; // Can wrap around
      },
    }),
    {
      name: "playlist-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist playlist data, not playback state
      partialize: (state) => ({
        playlist: state.playlist,
        repeatMode: state.repeatMode,
        isShuffleEnabled: state.isShuffleEnabled,
      }),
    }
  )
);

export default usePlaylistStore;
