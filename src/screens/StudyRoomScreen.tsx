import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useUserStore from "../state/userStore";
import useStudyRoomStore from "../state/studyRoomStore";
import useChatStore from "../state/chatStore";
import useFriendStore from "../state/friendStore";
import { getTheme } from "../utils/themes";
import { useGlobalToast } from "../context/ToastContext";
import StudyPal from "../components/StudyPal";

const StudyRoomScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);
  const toast = useGlobalToast();

  const rooms = useStudyRoomStore((s) => s.rooms);
  const currentRoomId = useStudyRoomStore((s) => s.currentRoomId);
  const createRoom = useStudyRoomStore((s) => s.createRoom);
  const joinRoom = useStudyRoomStore((s) => s.joinRoom);
  const leaveRoom = useStudyRoomStore((s) => s.leaveRoom);
  const startTimer = useStudyRoomStore((s) => s.startTimer);
  const pauseTimer = useStudyRoomStore((s) => s.pauseTimer);
  const stopTimer = useStudyRoomStore((s) => s.stopTimer);
  const switchMode = useStudyRoomStore((s) => s.switchMode);
  const setCurrentRoom = useStudyRoomStore((s) => s.setCurrentRoom);
  const getCurrentRoom = useStudyRoomStore((s) => s.getCurrentRoom);
  const getPublicRooms = useStudyRoomStore((s) => s.getPublicRooms);
  const isHost = useStudyRoomStore((s) => s.isHost);
  const inviteFriend = useStudyRoomStore((s) => s.inviteFriend);

  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendSystemMessage = useChatStore((s) => s.sendSystemMessage);
  const getRoomMessages = useChatStore((s) => s.getRoomMessages);

  const getFriends = useFriendStore((s) => s.getFriends);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTimeInputModal, setShowTimeInputModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [customMinutes, setCustomMinutes] = useState("25");
  const [customSeconds, setCustomSeconds] = useState("0");
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const scrollViewRef = useRef<ScrollView>(null);
  const currentRoom = getCurrentRoom();
  const publicRooms = getPublicRooms();
  const myFriends = user ? getFriends(user.id) : [];
  const roomMessages = currentRoom ? getRoomMessages(currentRoom.id) : [];
  const userIsHost = currentRoom && user ? isHost(currentRoom.id, user.id) : false;
  const setTimerDuration = useStudyRoomStore((s) => s.setTimerDuration);

  // Timer countdown logic
  useEffect(() => {
    if (!currentRoom || !currentRoom.timerRunning) return;

    const interval = setInterval(() => {
      const room = getCurrentRoom();
      if (!room || !room.timerRunning) return;

      let minutes = room.timerMinutes;
      let seconds = room.timerSeconds;

      // Countdown logic
      if (seconds === 0) {
        if (minutes === 0) {
          // Timer finished
          if (user && userIsHost) {
            pauseTimer(currentRoom.id, user.id);
            sendSystemMessage(currentRoom.id, "Timer completed!");
            toast.success("Timer finished!");
          }
          clearInterval(interval);
          return;
        }
        minutes -= 1;
        seconds = 59;
      } else {
        seconds -= 1;
      }

      // Update timer in store
      if (user && userIsHost) {
        setTimerDuration(room.id, user.id, minutes, seconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom?.timerRunning, currentRoom?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChat && roomMessages.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [roomMessages.length, showChat]);

  const handleCreateRoom = () => {
    if (!user || !roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    const roomId = createRoom(user.id, user.username, roomName, isPrivate);
    setCurrentRoom(roomId);
    sendSystemMessage(roomId, `${user.username} created the session`);

    setRoomName("");
    setIsPrivate(false);
    setShowCreateModal(false);
    toast.success("Live session created!");
  };

  const handleJoinRoom = (roomId: string) => {
    if (!user) return;

    const success = joinRoom(roomId, user.id, user.username, user.studyPalConfig.animal);
    if (success) {
      setCurrentRoom(roomId);
      sendSystemMessage(roomId, `${user.username} joined the session`);
      toast.success("Joined session!");
    } else {
      toast.error("Cannot join session");
    }
  };

  const handleLeaveRoom = () => {
    if (!user || !currentRoom) return;

    sendSystemMessage(currentRoom.id, `${user.username} left the session`);
    leaveRoom(currentRoom.id, user.id);
    setCurrentRoom(null);
    toast.info("Left the session");
  };

  const handleStartTimer = () => {
    if (!user || !currentRoom) return;
    const success = startTimer(currentRoom.id, user.id);
    if (success) {
      sendSystemMessage(currentRoom.id, "Timer started!");
    }
  };

  const handlePauseTimer = () => {
    if (!user || !currentRoom) return;
    const success = pauseTimer(currentRoom.id, user.id);
    if (success) {
      sendSystemMessage(currentRoom.id, "Timer paused");
    }
  };

  const handleStopTimer = () => {
    if (!user || !currentRoom) return;
    const success = stopTimer(currentRoom.id, user.id);
    if (success) {
      sendSystemMessage(currentRoom.id, "Timer stopped");
    }
  };

  const handleSwitchMode = () => {
    if (!user || !currentRoom) return;
    const newMode = currentRoom.timerMode === "study" ? "break" : "study";
    const success = switchMode(currentRoom.id, user.id, newMode);
    if (success) {
      sendSystemMessage(currentRoom.id, `Switched to ${newMode} mode`);
    }
  };

  const handleSendMessage = () => {
    if (!user || !currentRoom || !messageText.trim()) return;

    sendMessage(currentRoom.id, user.id, user.username, messageText);
    setMessageText("");
  };

  const handleInviteFriend = (friendUserId: string, friendUsername: string) => {
    if (!user || !currentRoom) return;
    const success = inviteFriend(currentRoom.id, user.id, friendUserId);
    if (success) {
      toast.success(`Invited ${friendUsername}!`);
      setShowInviteModal(false);
    }
  };

  const handleInviteByEmail = () => {
    if (!user || !currentRoom || !inviteEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }

    // Create a mock user from email (in production, this would search a user database)
    const mockUser = {
      id: "invited_" + Date.now(),
      username: inviteEmail.split("@")[0],
      email: inviteEmail,
    };

    const success = inviteFriend(currentRoom.id, user.id, mockUser.id);
    if (success) {
      toast.success(`Invitation sent to ${mockUser.username}!`);
      setInviteEmail("");
      setShowInviteModal(false);
    }
  };

  const filteredFriends = inviteSearchQuery
    ? myFriends.filter((f) =>
        f.friendUsername.toLowerCase().includes(inviteSearchQuery.toLowerCase()) ||
        f.friendEmail?.toLowerCase().includes(inviteSearchQuery.toLowerCase())
      )
    : myFriends;

  const handleSetCustomTime = () => {
    if (!user || !currentRoom || !userIsHost) return;

    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;

    if (minutes < 0 || minutes > 120) {
      toast.error("Minutes must be between 0-120");
      return;
    }

    if (seconds < 0 || seconds > 59) {
      toast.error("Seconds must be between 0-59");
      return;
    }

    if (minutes === 0 && seconds === 0) {
      toast.error("Time must be greater than 0");
      return;
    }

    const success = setTimerDuration(currentRoom.id, user.id, minutes, seconds);
    if (success) {
      setShowTimeInputModal(false);
      toast.success("Timer duration updated!");
    }
  };

  // If in a room, show room view
  if (currentRoom) {
    const backgroundColor = currentRoom.timerMode === "study" ? "#E8F5E9" : "#E3F2FD";

    return (
      <View style={{ flex: 1, backgroundColor }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Room Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, backgroundColor: "white" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 24, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                  {currentRoom.name}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 2 }}>
                  {currentRoom.participants.length} {currentRoom.participants.length === 1 ? "participant" : "participants"} in session
                </Text>
              </View>
              <Pressable
                onPress={handleLeaveRoom}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "#FEE2E2",
                }}
              >
                <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#EF4444" }}>
                  Leave
                </Text>
              </Pressable>
            </View>

            {/* Participants */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {currentRoom.participants.map((participant) => (
                  <View key={participant.userId} style={{ alignItems: "center" }}>
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: theme.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: participant.isHost ? 2 : 0,
                      borderColor: theme.primary,
                    }}>
                      <StudyPal
                        animal={participant.animal}
                        name=""
                        animationsEnabled={false}
                        size={32}
                        showName={false}
                        showMessage={false}
                      />
                    </View>
                    <Text style={{ fontSize: 10, fontFamily: "Poppins_500Medium", color: theme.textPrimary, marginTop: 4, maxWidth: 60 }} numberOfLines={1}>
                      {participant.username}
                    </Text>
                    {participant.isHost && (
                      <Text style={{ fontSize: 9, fontFamily: "Poppins_600SemiBold", color: theme.primary }}>
                        Host
                      </Text>
                    )}
                  </View>
                ))}
                {userIsHost && (
                  <Pressable
                    onPress={() => setShowInviteModal(true)}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: theme.primary + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: theme.primary,
                      borderStyle: "dashed",
                    }}
                  >
                    <Ionicons name="person-add" size={24} color={theme.primary} />
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Timer Display */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 32, alignItems: "center" }}>
            <View style={{
              backgroundColor: "white",
              borderRadius: 32,
              paddingHorizontal: 40,
              paddingVertical: 36,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              minWidth: 300,
              maxWidth: 360,
              width: "100%",
            }}>
              <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textSecondary, marginBottom: 12, letterSpacing: 0.5 }}>
                {currentRoom.timerMode === "study" ? "Focus Time" : "Break Time"}
              </Text>

              {/* Time Display - clickable for host */}
              <Pressable
                onPress={() => {
                  if (userIsHost && !currentRoom.timerRunning) {
                    setCustomMinutes(String(currentRoom.timerMinutes));
                    setCustomSeconds(String(currentRoom.timerSeconds));
                    setShowTimeInputModal(true);
                  }
                }}
                disabled={!userIsHost || currentRoom.timerRunning}
                style={{ opacity: userIsHost && !currentRoom.timerRunning ? 1 : 1 }}
              >
                <Text style={{ fontSize: 72, fontFamily: "Poppins_700Bold", color: theme.primary, letterSpacing: -2, marginBottom: 4 }}>
                  {String(currentRoom.timerMinutes).padStart(2, "0")}:{String(currentRoom.timerSeconds).padStart(2, "0")}
                </Text>
                {userIsHost && !currentRoom.timerRunning && (
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary, textAlign: "center", marginTop: 4 }}>
                    Tap to set custom time
                  </Text>
                )}
              </Pressable>

              {/* Host Controls */}
              {userIsHost && (
                <View style={{ marginTop: 28, gap: 14, width: "100%" }}>
                  <View style={{ flexDirection: "row", gap: 14 }}>
                    <Pressable
                      onPress={currentRoom.timerRunning ? handlePauseTimer : handleStartTimer}
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        borderRadius: 16,
                        backgroundColor: theme.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "white", letterSpacing: 0.3 }}>
                        {currentRoom.timerRunning ? "Pause" : "Start"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleStopTimer}
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        borderRadius: 16,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textSecondary, letterSpacing: 0.3 }}>
                        Stop
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={handleSwitchMode}
                    disabled={currentRoom.timerRunning}
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      borderRadius: 16,
                      backgroundColor: currentRoom.timerRunning ? "#E5E7EB" : theme.secondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: currentRoom.timerRunning ? "#9CA3AF" : "white", letterSpacing: 0.3 }}>
                      Switch to {currentRoom.timerMode === "study" ? "Break" : "Focus"}
                    </Text>
                  </Pressable>
                </View>
              )}

              {!userIsHost && (
                <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 20, textAlign: "center", paddingHorizontal: 8, lineHeight: 20 }}>
                  {currentRoom.timerRunning ? "Session in progress..." : "Waiting for host to start"}
                </Text>
              )}
            </View>
          </View>

          {/* Chat Section */}
          <View style={{ flex: 1, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}>
            <View style={{ paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
              <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                Chat
              </Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
              <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1, paddingHorizontal: 24 }}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {roomMessages.map((message) => (
                  <View
                    key={message.id}
                    style={{
                      marginBottom: 12,
                      alignSelf: message.type === "system" ? "center" : message.userId === user?.id ? "flex-end" : "flex-start",
                      maxWidth: message.type === "system" ? "90%" : "75%",
                    }}
                  >
                    {message.type === "system" ? (
                      <View style={{ backgroundColor: theme.textSecondary + "20", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
                        <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary, textAlign: "center" }}>
                          {message.content}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        {message.userId !== user?.id && (
                          <Text style={{ fontSize: 11, fontFamily: "Poppins_500Medium", color: theme.textSecondary, marginBottom: 4, marginLeft: 4 }}>
                            {message.username}
                          </Text>
                        )}
                        <View style={{
                          backgroundColor: message.userId === user?.id ? theme.primary : "#F3F4F6",
                          borderRadius: 16,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                        }}>
                          <Text style={{
                            fontSize: 14,
                            fontFamily: "Poppins_400Regular",
                            color: message.userId === user?.id ? "white" : theme.textPrimary,
                          }}>
                            {message.content}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Message Input */}
              <View style={{ paddingHorizontal: 24, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6", backgroundColor: "white" }}>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <TextInput
                    value={messageText}
                    onChangeText={setMessageText}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.textSecondary}
                    style={{
                      flex: 1,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      fontSize: 14,
                      fontFamily: "Poppins_400Regular",
                      color: theme.textPrimary,
                    }}
                    onSubmitEditing={handleSendMessage}
                  />
                  <Pressable
                    onPress={handleSendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: messageText.trim() ? theme.primary : "#E5E7EB",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="send" size={20} color={messageText.trim() ? "white" : "#9CA3AF"} />
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>

          {/* Invite Students Modal */}
          <Modal visible={showInviteModal} transparent animationType="slide" onRequestClose={() => setShowInviteModal(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
              <View style={{ backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "80%" }}>
                {/* Header */}
                <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 20, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                      Invite to Session
                    </Text>
                    <Pressable onPress={() => {
                      setShowInviteModal(false);
                      setInviteSearchQuery("");
                      setInviteEmail("");
                    }}>
                      <Ionicons name="close" size={28} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  {/* Search Bar */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F3F4F6",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}>
                      <Ionicons name="search" size={20} color={theme.textSecondary} />
                      <TextInput
                        value={inviteSearchQuery}
                        onChangeText={setInviteSearchQuery}
                        placeholder="Search friends..."
                        placeholderTextColor={theme.textSecondary}
                        style={{
                          flex: 1,
                          marginLeft: 8,
                          fontSize: 14,
                          fontFamily: "Poppins_400Regular",
                          color: theme.textPrimary,
                        }}
                      />
                      {inviteSearchQuery.length > 0 && (
                        <Pressable onPress={() => setInviteSearchQuery("")}>
                          <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>

                <ScrollView style={{ paddingHorizontal: 24, paddingVertical: 16 }} contentContainerStyle={{ flexGrow: 1 }}>
                  {/* Invite by Email Section */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 10 }}>
                      Invite by Email
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TextInput
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        placeholder="student@example.com"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={{
                          flex: 1,
                          backgroundColor: "#F3F4F6",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          fontSize: 14,
                          fontFamily: "Poppins_400Regular",
                          color: theme.textPrimary,
                        }}
                      />
                      <Pressable
                        onPress={handleInviteByEmail}
                        disabled={!inviteEmail.trim()}
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: inviteEmail.trim() ? theme.primary : "#E5E7EB",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: inviteEmail.trim() ? "white" : "#9CA3AF" }}>
                          Send
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Friends List */}
                  {filteredFriends.length > 0 && (
                    <View>
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 12 }}>
                        Your Friends ({filteredFriends.length})
                      </Text>
                      {filteredFriends.map((friend) => {
                        const friendUserId = friend.friendUserId === user?.id ? friend.userId : friend.friendUserId;
                        const alreadyInvited = currentRoom.invitedFriendIds.includes(friendUserId);
                        const alreadyInRoom = currentRoom.participantIds.includes(friendUserId);

                        return (
                          <View
                            key={friend.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: "#F3F4F6",
                            }}
                          >
                            <View style={{
                              width: 44,
                              height: 44,
                              borderRadius: 22,
                              backgroundColor: theme.primary + "20",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <StudyPal
                                animal={friend.friendAnimal}
                                name=""
                                animationsEnabled={false}
                                size={28}
                                showName={false}
                                showMessage={false}
                              />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={{ fontSize: 15, fontFamily: "Poppins_500Medium", color: theme.textPrimary }}>
                                {friend.friendUsername}
                              </Text>
                              {friend.friendEmail && (
                                <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 2 }}>
                                  {friend.friendEmail}
                                </Text>
                              )}
                            </View>
                            {alreadyInRoom ? (
                              <View style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: theme.secondary + "20",
                              }}>
                                <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.secondary }}>
                                  In Session
                                </Text>
                              </View>
                            ) : alreadyInvited ? (
                              <View style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: "#F3F4F6",
                              }}>
                                <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.textSecondary }}>
                                  Invited
                                </Text>
                              </View>
                            ) : (
                              <Pressable
                                onPress={() => handleInviteFriend(friendUserId, friend.friendUsername)}
                                style={{
                                  paddingHorizontal: 16,
                                  paddingVertical: 8,
                                  borderRadius: 12,
                                  backgroundColor: theme.primary,
                                }}
                              >
                                <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                                  Invite
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Empty State */}
                  {filteredFriends.length === 0 && !inviteSearchQuery && (
                    <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 32 }}>
                      <Ionicons name="people-outline" size={60} color={theme.textSecondary} />
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginTop: 12, textAlign: "center" }}>
                        No Friends Yet
                      </Text>
                      <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 6, textAlign: "center", lineHeight: 20 }}>
                        Add friends in the Friends tab to invite them to study sessions, or invite someone by email above
                      </Text>
                    </View>
                  )}

                  {/* No Search Results */}
                  {filteredFriends.length === 0 && inviteSearchQuery && myFriends.length > 0 && (
                    <View style={{ alignItems: "center", paddingVertical: 40 }}>
                      <Ionicons name="search-outline" size={60} color={theme.textSecondary} />
                      <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginTop: 12 }}>
                        No Results Found
                      </Text>
                      <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 6 }}>
                        Try a different search term
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Time Input Modal */}
          <Modal visible={showTimeInputModal} transparent animationType="fade" onRequestClose={() => setShowTimeInputModal(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
              <View style={{ backgroundColor: "white", borderRadius: 24, width: "100%", maxWidth: 400, padding: 24 }}>
                <Text style={{ fontSize: 22, fontFamily: "Poppins_700Bold", color: theme.textPrimary, marginBottom: 8 }}>
                  Set Timer Duration
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginBottom: 24 }}>
                  Set custom time for your {currentRoom.timerMode} session
                </Text>

                <View style={{ flexDirection: "row", gap: 16, marginBottom: 24 }}>
                  {/* Minutes Input */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 8 }}>
                      Minutes
                    </Text>
                    <TextInput
                      value={customMinutes}
                      onChangeText={setCustomMinutes}
                      keyboardType="number-pad"
                      maxLength={3}
                      style={{
                        backgroundColor: "#F3F4F6",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        fontFamily: "Poppins_500Medium",
                        color: theme.textPrimary,
                        textAlign: "center",
                      }}
                      placeholder="25"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>

                  {/* Seconds Input */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 8 }}>
                      Seconds
                    </Text>
                    <TextInput
                      value={customSeconds}
                      onChangeText={setCustomSeconds}
                      keyboardType="number-pad"
                      maxLength={2}
                      style={{
                        backgroundColor: "#F3F4F6",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        fontFamily: "Poppins_500Medium",
                        color: theme.textPrimary,
                        textAlign: "center",
                      }}
                      placeholder="00"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>

                {/* Buttons */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setShowTimeInputModal(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: "#F3F4F6",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: theme.textSecondary }}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSetCustomTime}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: theme.primary,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                      Set Time
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    );
  }

  // Room List View
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 32, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
              Live Sessions
            </Text>
            {user && (
              <View style={{ marginLeft: 16 }}>
                <StudyPal
                  animal={user.studyPalConfig.animal}
                  name={user.studyPalConfig.name}
                  animationsEnabled={false}
                  size={35}
                  showName={false}
                  showMessage={false}
                />
              </View>
            )}
          </View>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="add" size={28} color="white" />
          </Pressable>
        </View>

        <Text style={{ paddingHorizontal: 24, fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginBottom: 16 }}>
          Study together with students in real-time
        </Text>

        {/* Room List */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          {publicRooms.length === 0 ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
              <Ionicons name="people-outline" size={80} color={theme.textSecondary} />
              <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", marginTop: 16, color: theme.textPrimary }}>
                No active sessions
              </Text>
              <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", marginTop: 8, color: theme.textSecondary, textAlign: "center", paddingHorizontal: 40 }}>
                Create a live session to start studying with students!
              </Text>
              <Pressable
                onPress={() => setShowCreateModal(true)}
                style={{
                  marginTop: 20,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: theme.primary,
                }}
              >
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                  Create Session
                </Text>
              </Pressable>
            </View>
          ) : (
            publicRooms.map((room) => (
              <Pressable
                key={room.id}
                onPress={() => handleJoinRoom(room.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: theme.primary + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Ionicons name="people" size={24} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                      {room.name}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 2 }}>
                      Host: {room.hostUsername}
                    </Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: room.timerRunning ? theme.secondary + "20" : theme.textSecondary + "20",
                  }}>
                    <Text style={{ fontSize: 11, fontFamily: "Poppins_600SemiBold", color: room.timerRunning ? theme.secondary : theme.textSecondary }}>
                      {room.timerRunning ? "Active" : "Waiting"}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="person" size={14} color={theme.textSecondary} />
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.textSecondary, marginLeft: 4 }}>
                      {room.participants.length}/{room.maxParticipants}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="time" size={14} color={theme.textSecondary} />
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: theme.textSecondary, marginLeft: 4 }}>
                      {room.timerMode === "study" ? "Study" : "Break"}: {String(room.timerMinutes).padStart(2, "0")}:{String(room.timerSeconds).padStart(2, "0")}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Create Session Modal */}
        <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
          <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }} onPress={() => setShowCreateModal(false)}>
            <Pressable style={{ backgroundColor: "white", borderRadius: 24, padding: 24, width: "100%", maxWidth: 400 }} onPress={(e) => e.stopPropagation()}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                  Create Live Session
                </Text>
                <Pressable onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={28} color={theme.textSecondary} />
                </Pressable>
              </View>

              <TextInput
                value={roomName}
                onChangeText={setRoomName}
                placeholder="Session name"
                placeholderTextColor={theme.textSecondary}
                style={{
                  backgroundColor: theme.textSecondary + "10",
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 14,
                  fontFamily: "Poppins_400Regular",
                  color: theme.textPrimary,
                  marginBottom: 16,
                }}
              />

              <Pressable
                onPress={() => setIsPrivate(!isPrivate)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  marginBottom: 20,
                }}
              >
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isPrivate ? theme.primary : "#D1D5DB",
                  backgroundColor: isPrivate ? theme.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}>
                  {isPrivate && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_500Medium", color: theme.textPrimary }}>
                  Private session (invite only)
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCreateRoom}
                style={{
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: theme.primary,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                  Create Session
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default StudyRoomScreen;
