import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  mood: "calming" | "uplifting" | "peaceful";
  genre: "classical" | "piano" | "ambient";
  pixabayUrl: string; // URL to download from Pixabay
  localFile?: any; // Local asset reference after download
}

export interface AudioError {
  message: string;
  code?: string;
  retry?: boolean;
}

// Curated list of calming classical music
// Using local assets for music files
// Note: Some MP3 files may have encoding issues with iOS AVFoundation
// Using simpler audio files for better compatibility
export const musicLibrary: MusicTrack[] = [
  {
    id: "calm-soul-meditation",
    title: "Calm Soul Meditation",
    artist: "UniverseBella",
    duration: 240,
    mood: "peaceful",
    genre: "ambient",
    pixabayUrl: "",
    localFile: require("../../assets/Calm Soul Meditation - 247330  UniverseBella.-1762652286390.mpeg"),
  },
];

class MusicService {
  private sound: Sound | null = null;
  private currentTrack: MusicTrack | null = null;
  private isPlaying: boolean = false;
  private currentPosition: number = 0;
  private volume: number = 1.0;
  private isLooping: boolean = false;
  private lastError: AudioError | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private onTrackEndCallback: (() => void) | null = null;

  async initializeAudio(): Promise<boolean> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 1, // Mix with others
        interruptionModeAndroid: 1, // Do not mix
      });
      console.log("[MusicService] Audio initialized successfully");
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error initializing audio:", error);
      this.lastError = {
        message: "Failed to initialize audio system",
        code: error?.code,
        retry: true,
      };
      return false;
    }
  }

  async loadTrack(track: MusicTrack, uri?: string): Promise<boolean> {
    try {
      // Unload previous track
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Priority: provided URI > localFile > pixabayUrl
      let audioSource: any;
      let sourceType: string = "unknown";

      if (uri) {
        // Use provided URI string
        audioSource = { uri };
        sourceType = "URI";
      } else if (track.localFile) {
        // Use local asset file (require'd module)
        audioSource = track.localFile;
        sourceType = "local asset";
      } else if (track.pixabayUrl) {
        // Use remote URL
        audioSource = { uri: track.pixabayUrl };
        sourceType = "remote URL";
      } else {
        const errorMsg = `No audio source provided for track: ${track.title}`;
        console.error("[MusicService]", errorMsg);
        this.lastError = {
          message: errorMsg,
          retry: false,
        };
        return false;
      }

      console.log(`[MusicService] Loading track "${track.title}" from ${sourceType}`);

      // Load new track with error handling and better audio settings
      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        {
          shouldPlay: false,
          volume: this.volume,
          isLooping: this.isLooping,
          progressUpdateIntervalMillis: 500,
          // Add rate and pitch correction to help with compatibility
          rate: 1.0,
          shouldCorrectPitch: true,
        },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.currentTrack = track;
      this.isPlaying = false;
      this.currentPosition = 0;
      this.retryCount = 0;
      this.lastError = null;

      console.log(`[MusicService] Track "${track.title}" loaded successfully`);
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error loading track:", error);
      console.error("[MusicService] Error details:", {
        message: error?.message || "Unknown error",
        code: error?.code,
        trackTitle: track.title,
        hasLocalFile: !!track.localFile,
        uri: uri || "none",
      });

      // Provide more specific error messages
      let errorMessage = "Failed to load audio track";
      let canRetry = false; // Don't auto-retry format errors

      if (error.message) {
        if (error.message.includes("-11828") ||
            error.message.includes("-11850") ||
            error.message.includes("-1182") ||
            error.message.includes("AVFoundation") ||
            error.message.includes("format is not supported")) {
          errorMessage = `Unable to play "${track.title}". This audio file may have encoding issues. Please try another track.`;
          canRetry = false;
        } else if (error.message.includes("network") || error.message.includes("timeout")) {
          errorMessage = "Network error - please check your connection";
          canRetry = true;
        } else if (error.message.includes("permission")) {
          errorMessage = "Audio playback permission denied";
          canRetry = false;
        } else {
          errorMessage = `Audio error: ${error.message}`;
        }
      }

      this.lastError = {
        message: errorMessage,
        code: error?.code,
        retry: canRetry && this.retryCount < this.maxRetries,
      };

      return false;
    }
  }

  async retryLoad(track: MusicTrack, uri?: string): Promise<boolean> {
    if (!this.lastError?.retry || this.retryCount >= this.maxRetries) {
      return false;
    }

    this.retryCount++;
    console.log(`[MusicService] Retrying load (attempt ${this.retryCount}/${this.maxRetries})`);

    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));

    return this.loadTrack(track, uri);
  }

  async play(): Promise<boolean> {
    try {
      if (!this.sound) {
        this.lastError = {
          message: "No audio track loaded",
          retry: false,
        };
        return false;
      }

      await this.sound.playAsync();
      this.isPlaying = true;
      this.lastError = null;
      console.log("[MusicService] Playback started");
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error playing track:", error);
      this.lastError = {
        message: `Playback error: ${error?.message || "Unknown error"}`,
        code: error?.code,
        retry: true,
      };
      return false;
    }
  }

  async pause(): Promise<boolean> {
    try {
      if (!this.sound) return false;

      await this.sound.pauseAsync();
      this.isPlaying = false;
      console.log("[MusicService] Playback paused");
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error pausing track:", error);
      this.lastError = {
        message: `Pause error: ${error?.message || "Unknown error"}`,
        code: error?.code,
        retry: false,
      };
      return false;
    }
  }

  async stop(): Promise<boolean> {
    try {
      if (!this.sound) return false;

      await this.sound.stopAsync();
      this.isPlaying = false;
      this.currentPosition = 0;
      console.log("[MusicService] Playback stopped");
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error stopping track:", error);
      this.lastError = {
        message: `Stop error: ${error?.message || "Unknown error"}`,
        code: error?.code,
        retry: false,
      };
      return false;
    }
  }

  async seekTo(positionMillis: number): Promise<boolean> {
    try {
      if (!this.sound) return false;

      await this.sound.setPositionAsync(positionMillis);
      console.log(`[MusicService] Seeked to ${positionMillis}ms`);
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error seeking:", error);
      this.lastError = {
        message: `Seek error: ${error?.message || "Unknown error"}`,
        code: error?.code,
        retry: false,
      };
      return false;
    }
  }

  async setVolume(volume: number): Promise<boolean> {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));

      if (this.sound) {
        await this.sound.setVolumeAsync(clampedVolume);
      }

      this.volume = clampedVolume;
      console.log(`[MusicService] Volume set to ${clampedVolume}`);
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error setting volume:", error);
      this.lastError = {
        message: `Volume error: ${error?.message || "Unknown error"}`,
        code: error?.code,
        retry: false,
      };
      return false;
    }
  }

  async setLooping(isLooping: boolean): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.setIsLoopingAsync(isLooping);
      }

      this.isLooping = isLooping;
      console.log(`[MusicService] Looping set to ${isLooping}`);
      return true;
    } catch (error: any) {
      console.error("[MusicService] Error setting loop:", error);
      this.lastError = {
        message: `Loop error: ${error?.message || "Unknown error"}`,
        code: error?.code,
        retry: false,
      };
      return false;
    }
  }

  private onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      this.currentPosition = status.positionMillis;
      this.isPlaying = status.isPlaying;

      if (status.didJustFinish && !status.isLooping) {
        this.isPlaying = false;
        this.currentPosition = 0;
        console.log("[MusicService] Track finished");

        // Call the callback when track ends (for playlist auto-advance)
        if (this.onTrackEndCallback) {
          this.onTrackEndCallback();
        }
      }

      // Check for errors in playback
      if (status.error) {
        console.error("[MusicService] Playback error:", status.error);
        this.lastError = {
          message: `Playback error: ${status.error}`,
          retry: false,
        };
      }
    } else if (status.error) {
      console.error("[MusicService] Status error:", status.error);
      this.lastError = {
        message: `Status error: ${status.error}`,
        retry: false,
      };
    }
  };

  async unload(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        console.log("[MusicService] Track unloaded");
      }
      this.currentTrack = null;
      this.isPlaying = false;
      this.currentPosition = 0;
      this.retryCount = 0;
      this.lastError = null;
    } catch (error: any) {
      console.error("[MusicService] Error unloading track:", error);
      // Still clear state even if unload fails
      this.sound = null;
      this.currentTrack = null;
      this.isPlaying = false;
    }
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentPosition(): number {
    return this.currentPosition;
  }

  getVolume(): number {
    return this.volume;
  }

  getIsLooping(): boolean {
    return this.isLooping;
  }

  getLastError(): AudioError | null {
    return this.lastError;
  }

  clearError(): void {
    this.lastError = null;
  }

  async getStatus() {
    if (!this.sound) return null;
    try {
      return await this.sound.getStatusAsync();
    } catch (error) {
      console.error("[MusicService] Error getting status:", error);
      return null;
    }
  }

  // Check if audio system is properly initialized
  async checkAudioSystem(): Promise<boolean> {
    try {
      // Try to get audio mode to verify system is working
      const recording = await Audio.getPermissionsAsync();
      return true;
    } catch (error) {
      console.error("[MusicService] Audio system check failed:", error);
      return false;
    }
  }

  // Set callback for when track ends (used for playlist auto-advance)
  setOnTrackEndCallback(callback: (() => void) | null): void {
    this.onTrackEndCallback = callback;
  }

  // Skip to next track (used by playlist)
  async skipToNext(): Promise<boolean> {
    return await this.stop();
  }

  // Skip to previous track (used by playlist)
  async skipToPrevious(): Promise<boolean> {
    return await this.stop();
  }
}

export const musicService = new MusicService();
