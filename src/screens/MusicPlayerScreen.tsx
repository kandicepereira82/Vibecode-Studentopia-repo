import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Linking,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import {
  musicService,
  musicLibrary,
  MusicTrack,
} from "../services/musicService";
import useUserStore from "../state/userStore";
import { getTheme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { Language } from "../types";

const MusicPlayerScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);
  const { t } = useTranslation(user?.language || "en");

  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [musicUri, setMusicUri] = useState("");

  useEffect(() => {
    musicService.initializeAudio();

    // Update playback status every 500ms
    const interval = setInterval(async () => {
      const status = await musicService.getStatus();
      if (status && status.isLoaded) {
        setCurrentPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);
        setIsPlaying(status.isPlaying);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      musicService.unload();
    };
  }, []);

  const handleTrackSelect = async (track: MusicTrack) => {
    // Show modal for URL entry since we don't have built-in audio files
    setSelectedTrack(track);
    setShowDownloadModal(true);
  };

  const handleLoadTrack = async () => {
    if (!selectedTrack || !musicUri.trim()) return;

    const success = await musicService.loadTrack(selectedTrack, musicUri);
    if (success) {
      setShowDownloadModal(false);
      setMusicUri("");
      // Auto-play after successful load
      await musicService.play();
    }
  };

  const handlePlayPause = async () => {
    if (!selectedTrack) return;

    if (isPlaying) {
      await musicService.pause();
    } else {
      await musicService.play();
    }
  };

  const handleStop = async () => {
    await musicService.stop();
    setCurrentPosition(0);
  };

  const handleSeek = async (value: number) => {
    await musicService.seekTo(value);
    setCurrentPosition(value);
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    await musicService.setVolume(value);
  };

  const handleToggleLoop = async () => {
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);
    await musicService.setLooping(newLoopState);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const filteredTracks = musicLibrary.filter(
    (track) => selectedMood === "all" || track.mood === selectedMood
  );

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "calming":
        return "water";
      case "uplifting":
        return "sunny";
      case "peaceful":
        return "leaf";
      default:
        return "musical-notes";
    }
  };

  const currentTrack = musicService.getCurrentTrack();

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Music Player Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <Text style={{
            fontSize: 32,
            fontFamily: 'Poppins_700Bold',
            color: theme.textPrimary
          }}>
            {t("musicPlayer")}
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: 'Poppins_400Regular',
            color: theme.textSecondary,
            marginTop: 4
          }}>
            {t("calmingClassicalMusic")}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Now Playing Card */}
          {currentTrack && (
            <View className="mx-6 mb-6 bg-white/90 rounded-3xl p-6 shadow-lg">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                {t("nowPlaying")}
              </Text>
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {currentTrack.title}
              </Text>
              <Text className="text-base text-gray-600 mb-4">
                {currentTrack.artist}
              </Text>

              {/* Progress Bar */}
              <View className="mb-4">
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={0}
                  maximumValue={duration}
                  value={currentPosition}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor={theme.primary}
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor={theme.primary}
                />
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">
                    {formatTime(currentPosition)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatTime(duration)}
                  </Text>
                </View>
              </View>

              {/* Playback Controls */}
              <View className="flex-row justify-center items-center space-x-6 mb-4">
                <Pressable
                  onPress={handleToggleLoop}
                  className="w-12 h-12 items-center justify-center"
                >
                  <Ionicons
                    name={isLooping ? "repeat" : "repeat-outline"}
                    size={24}
                    color={isLooping ? theme.primary : "#9CA3AF"}
                  />
                </Pressable>

                <Pressable
                  onPress={handleStop}
                  className="w-14 h-14 bg-gray-200 rounded-full items-center justify-center"
                >
                  <Ionicons name="stop" size={24} color="#374151" />
                </Pressable>

                <Pressable
                  onPress={handlePlayPause}
                  className="w-20 h-20 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={36}
                    color="white"
                  />
                </Pressable>

                <View className="w-14" />
                <View className="w-12" />
              </View>

              {/* Volume Control */}
              <View className="flex-row items-center space-x-3">
                <Ionicons name="volume-low" size={20} color="#6B7280" />
                <Slider
                  style={{ flex: 1, height: 40 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={volume}
                  onValueChange={handleVolumeChange}
                  minimumTrackTintColor={theme.primary}
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor={theme.primary}
                />
                <Ionicons name="volume-high" size={20} color="#6B7280" />
              </View>
            </View>
          )}

          {/* Mood Filter */}
          <View className="px-6 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {t("filterByMood")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {["all", "calming", "uplifting", "peaceful"].map((mood) => (
                  <Pressable
                    key={mood}
                    onPress={() => setSelectedMood(mood)}
                    className={`px-4 py-2 rounded-full flex-row items-center space-x-2 ${
                      selectedMood === mood
                        ? "bg-blue-500"
                        : "bg-white/80"
                    }`}
                  >
                    {mood !== "all" && (
                      <Ionicons
                        name={getMoodIcon(mood)}
                        size={16}
                        color={selectedMood === mood ? "white" : "#6B7280"}
                      />
                    )}
                    <Text
                      className={`font-semibold ${
                        selectedMood === mood
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {t(mood)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Music Library */}
          <View className="px-6 pb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {t("musicLibrary")}
            </Text>
            {filteredTracks.map((track) => (
              <Pressable
                key={track.id}
                onPress={() => handleTrackSelect(track)}
                className={`bg-white/90 rounded-2xl p-4 mb-3 flex-row items-center ${
                  currentTrack?.id === track.id ? "border-2" : ""
                }`}
                style={{
                  borderColor:
                    currentTrack?.id === track.id
                      ? theme.primary
                      : "transparent",
                }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <Ionicons
                    name="musical-note"
                    size={24}
                    color={theme.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {track.title}
                  </Text>
                  <Text className="text-sm text-gray-600">{track.artist}</Text>
                  <View className="flex-row items-center space-x-2 mt-1">
                    <Ionicons
                      name={getMoodIcon(track.mood)}
                      size={12}
                      color="#9CA3AF"
                    />
                    <Text className="text-xs text-gray-500 capitalize">
                      {track.mood} • {track.genre}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>

          {/* Instructions Card */}
          <View className="mx-6 mb-6 bg-blue-50 rounded-2xl p-4">
            <View className="flex-row items-start mb-2">
              <Ionicons
                name="information-circle"
                size={20}
                color="#3B82F6"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text className="flex-1 text-sm font-semibold text-blue-900" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                How to add music
              </Text>
            </View>
            <Text className="text-xs text-blue-800 leading-5" style={{ fontFamily: 'Poppins_400Regular' }}>
              1. Tap a song placeholder to open the setup dialog{"\n"}
              2. Find royalty-free music from Pixabay or similar sites{"\n"}
              3. Upload the MP3 to cloud storage (Dropbox, Google Drive){"\n"}
              4. Copy the direct audio file URL{"\n"}
              5. Paste the URL and tap Load to start playing
            </Text>
          </View>
        </ScrollView>

        {/* Audio Setup Modal */}
        <Modal
          visible={showDownloadModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowDownloadModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: "#E8F5E9" }}>
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
              <View className="px-6 py-4">
                <Text className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins_700Bold' }}>
                  {selectedTrack?.title}
                </Text>
                <Text className="text-base text-gray-600 mb-6" style={{ fontFamily: 'Poppins_400Regular' }}>
                  {selectedTrack?.artist}
                </Text>

                <View className="bg-blue-50 rounded-2xl p-4 mb-4">
                  <View className="flex-row items-start mb-2">
                    <Ionicons name="musical-notes" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                    <Text className="flex-1 text-sm font-semibold text-blue-900" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Audio file needed
                    </Text>
                  </View>
                  <Text className="text-xs text-blue-800" style={{ fontFamily: 'Poppins_400Regular' }}>
                    To use this music player, you need to provide a direct URL to an MP3 audio file. The URL must be publicly accessible and serve the correct audio MIME type.
                  </Text>
                </View>

                <View className="bg-white/90 rounded-2xl p-4 mb-4">
                  <Text className="text-sm font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    Step 1: Find Royalty-Free Music
                  </Text>
                  <Text className="text-xs text-gray-600 mb-3" style={{ fontFamily: 'Poppins_400Regular' }}>
                    Download calming music from free sources like Pixabay, YouTube Audio Library, or Free Music Archive.
                  </Text>
                  <Pressable
                    onPress={() => Linking.openURL("https://pixabay.com/music/search/classical/")}
                    className="bg-blue-500 rounded-xl py-3 items-center"
                  >
                    <Text className="text-white font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Browse Pixabay Music
                    </Text>
                  </Pressable>
                </View>

                <View className="bg-white/90 rounded-2xl p-4 mb-4">
                  <Text className="text-sm font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    Step 2: Upload to Cloud Storage
                  </Text>
                  <Text className="text-xs text-gray-600" style={{ fontFamily: 'Poppins_400Regular' }}>
                    Upload your downloaded MP3 to Dropbox, Google Drive, or any cloud storage that provides direct file access URLs (must end in .mp3).
                  </Text>
                </View>

                <View className="bg-white/90 rounded-2xl p-4 mb-6">
                  <Text className="text-sm font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    Step 3: Paste Direct Audio URL
                  </Text>
                  <TextInput
                    value={musicUri}
                    onChangeText={setMusicUri}
                    placeholder="https://example.com/music.mp3"
                    className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 mb-3"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={handleLoadTrack}
                    className="bg-green-500 rounded-xl py-3 items-center"
                    disabled={!musicUri.trim()}
                    style={{
                      opacity: musicUri.trim() ? 1 : 0.5,
                    }}
                  >
                    <Text className="text-white font-semibold">
                      Load & Play Music
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => {
                    setShowDownloadModal(false);
                    setMusicUri("");
                  }}
                  className="bg-gray-200 rounded-xl py-3 items-center"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default MusicPlayerScreen;
