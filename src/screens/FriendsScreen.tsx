import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useUserStore from "../state/userStore";
import useFriendStore from "../state/friendStore";
import useActivityFeedStore from "../state/activityFeedStore";
import { getTheme } from "../utils/themes";
import { useGlobalToast } from "../context/ToastContext";
import ClickableCompanion from "../components/ClickableCompanion";
import { presenceService } from "../services/presenceService";
import { UserPresence } from "../types";

const FriendsScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);
  const toast = useGlobalToast();

  const getFriends = useFriendStore((s) => s.getFriends);
  const getPendingRequests = useFriendStore((s) => s.getPendingRequests);
  const getSentRequests = useFriendStore((s) => s.getSentRequests);
  const sendFriendRequest = useFriendStore((s) => s.sendFriendRequest);
  const acceptFriendRequest = useFriendStore((s) => s.acceptFriendRequest);
  const rejectFriendRequest = useFriendStore((s) => s.rejectFriendRequest);
  const removeFriend = useFriendStore((s) => s.removeFriend);
  const searchFriends = useFriendStore((s) => s.searchFriends);

  const getFriendActivities = useActivityFeedStore((s) => s.getFriendActivities);

  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "activity">("friends");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [presences, setPresences] = useState<Map<string, UserPresence>>(new Map());
  const [refreshing, setRefreshing] = useState(false);

  const myFriends = user ? getFriends(user.id) : [];
  const pendingRequests = user ? getPendingRequests(user.id) : [];
  const sentRequests = user ? getSentRequests(user.id) : [];
  const friendUserIds = myFriends.map((f) => f.friendUserId === user?.id ? f.userId : f.friendUserId);
  const friendActivities = getFriendActivities(friendUserIds, 20);

  // Initialize presence service
  useEffect(() => {
    if (user) {
      presenceService.initialize(user.id, user.username);

      // Subscribe to presence updates
      const unsubscribe = presenceService.subscribe((presenceMap) => {
        setPresences(presenceMap);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const handleSendRequest = () => {
    if (!user || !friendEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }

    // In a real app, you'd look up the user by email via API
    // For now, simulate finding a user
    const mockFriendUser = {
      id: "friend_" + Date.now(),
      username: friendEmail.split("@")[0],
      email: friendEmail,
      animal: "cat",
      theme: "nature",
    };

    sendFriendRequest(
      user.id,
      mockFriendUser.id,
      mockFriendUser.username,
      mockFriendUser.email,
      mockFriendUser.animal,
      mockFriendUser.theme
    );

    setFriendEmail("");
    setShowAddFriendModal(false);
    toast.success(`Friend request sent to ${mockFriendUser.username}!`);
  };

  const handleAcceptRequest = (friendId: string, friendUsername: string) => {
    if (!user) return;
    const success = acceptFriendRequest(friendId, user.id);
    if (success) {
      toast.success(`You and ${friendUsername} are now friends!`);
    } else {
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = (friendId: string) => {
    if (!user) return;
    const success = rejectFriendRequest(friendId, user.id);
    if (success) {
      toast.success("Request rejected");
    }
  };

  const handleRemoveFriend = (friendId: string, friendUsername: string) => {
    if (!user) return;
    const success = removeFriend(friendId, user.id);
    if (success) {
      toast.success(`Removed ${friendUsername} from friends`);
    }
  };

  const getPresenceStatus = (userId: string) => {
    return presences.get(userId);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online": return "#10B981";
      case "studying": return theme.primary;
      case "break": return theme.secondary;
      case "offline": return "#9CA3AF";
      default: return "#9CA3AF";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "online": return "Online";
      case "studying": return "Studying";
      case "break": return "On Break";
      case "offline": return "Offline";
      default: return "Offline";
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      toast.info("Refreshed");
    }, 1000);
  };

  const filteredFriends = searchQuery.trim()
    ? user ? searchFriends(user.id, searchQuery) : []
    : myFriends;

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 32, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
              {user?.role === "teacher" ? "Students" : "Friends"}
            </Text>
            {user && (
              <View style={{ marginLeft: 16 }}>
                <ClickableCompanion
                  animal={user.studyPalConfig.animal}
                  name={user.studyPalConfig.name}
                  animationsEnabled={false}
                  size={35}
                  showName={false}
                  showMessage={false}
                  customAvatar={user.studyPalConfig.avatar}
                />
              </View>
            )}
          </View>
          <Pressable
            onPress={() => setShowAddFriendModal(true)}
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
            <Ionicons name="person-add" size={22} color="white" />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 12, flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => setActiveTab("friends")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: "center",
              backgroundColor: activeTab === "friends" ? theme.primary : "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: activeTab === "friends" ? "white" : theme.textSecondary }}>
              {user?.role === "teacher" ? "Students" : "Friends"} {myFriends.length > 0 && `(${myFriends.length})`}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("requests")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: "center",
              backgroundColor: activeTab === "requests" ? theme.secondary : "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: activeTab === "requests" ? "white" : theme.textSecondary }}>
              Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("activity")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: "center",
              backgroundColor: activeTab === "activity" ? theme.accentColor : "white",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: activeTab === "activity" ? "white" : theme.textSecondary }}>
              Activity
            </Text>
          </Pressable>
        </View>

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <>
            {/* Search Bar */}
            {myFriends.length > 0 && (
              <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
                  <Ionicons name="search" size={20} color={theme.textSecondary} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={user?.role === "teacher" ? "Search students..." : "Search friends..."}
                    placeholderTextColor={theme.textSecondary}
                    style={{ flex: 1, marginLeft: 8, fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textPrimary }}
                  />
                </View>
              </View>
            )}

            <ScrollView
              style={{ flex: 1, paddingHorizontal: 24 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {filteredFriends.length === 0 ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
                  <Ionicons name="people-outline" size={80} color={theme.textSecondary} />
                  <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", marginTop: 16, color: theme.textPrimary }}>
                    {searchQuery ? (user?.role === "teacher" ? "No students found" : "No friends found") : (user?.role === "teacher" ? "No students yet" : "No friends yet")}
                  </Text>
                  <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", marginTop: 8, color: theme.textSecondary, textAlign: "center", paddingHorizontal: 40 }}>
                    {searchQuery ? "Try a different search term" : (user?.role === "teacher" ? "Add students to track their progress and help them succeed!" : "Add friends to study together and track your progress!")}
                  </Text>
                  {!searchQuery && (
                    <Pressable
                      onPress={() => setShowAddFriendModal(true)}
                      style={{
                        marginTop: 20,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 16,
                        backgroundColor: theme.primary,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                        {user?.role === "teacher" ? "Add Students" : "Add Friends"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ) : (
                filteredFriends.map((friend) => {
                  const friendUserId = friend.friendUserId === user?.id ? friend.userId : friend.friendUserId;
                  const presence = getPresenceStatus(friendUserId);
                  const statusColor = getStatusColor(presence?.status);
                  const statusText = getStatusText(presence?.status);

                  return (
                    <View
                      key={friend.id}
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
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {/* Avatar */}
                        <View style={{ position: "relative" }}>
                          <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: theme.primary + "20",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <Text style={{ fontSize: 32 }}>
                              {friend.friendAnimal === "cat" ? "🐱" : friend.friendAnimal === "dog" ? "🐶" : "🐼"}
                            </Text>
                          </View>
                          {/* Online Status Indicator */}
                          <View
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 16,
                              height: 16,
                              borderRadius: 8,
                              backgroundColor: statusColor,
                              borderWidth: 2,
                              borderColor: "white",
                            }}
                          />
                        </View>

                        {/* Friend Info */}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                            {friend.friendUsername}
                          </Text>
                          <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: statusColor, marginTop: 2 }}>
                            {statusText}
                          </Text>
                          {presence?.currentActivity && (
                            <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 2 }}>
                              {presence.currentActivity}
                            </Text>
                          )}
                        </View>

                        {/* Actions */}
                        <Pressable
                          onPress={() => handleRemoveFriend(friend.id, friend.friendUsername)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: "#FEE2E2",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="person-remove" size={18} color="#EF4444" />
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <>
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginBottom: 12 }}>
                  Pending Requests ({pendingRequests.length})
                </Text>
                {pendingRequests.map((request) => (
                  <View
                    key={request.id}
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
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: theme.primary + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Text style={{ fontSize: 28 }}>
                          {request.friendAnimal === "cat" ? "🐱" : request.friendAnimal === "dog" ? "🐶" : "🐼"}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                          {request.friendUsername}
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary }}>
                          Wants to be friends
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable
                        onPress={() => handleAcceptRequest(request.id, request.friendUsername)}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: theme.primary,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                          Accept
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleRejectRequest(request.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: "#F3F4F6",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textSecondary }}>
                          Decline
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <>
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary, marginTop: 16, marginBottom: 12 }}>
                  Sent Requests ({sentRequests.length})
                </Text>
                {sentRequests.map((request) => (
                  <View
                    key={request.id}
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
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: theme.primary + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Text style={{ fontSize: 28 }}>
                          {request.friendAnimal === "cat" ? "🐱" : request.friendAnimal === "dog" ? "🐶" : "🐼"}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                          {request.friendUsername}
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: theme.textSecondary }}>
                          Request pending...
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {pendingRequests.length === 0 && sentRequests.length === 0 && (
              <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
                <Ionicons name="mail-outline" size={80} color={theme.textSecondary} />
                <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", marginTop: 16, color: theme.textPrimary }}>
                  No friend requests
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", marginTop: 8, color: theme.textSecondary }}>
                  You have no pending requests
                </Text>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
            {friendActivities.length === 0 ? (
              <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
                <Ionicons name="newspaper-outline" size={80} color={theme.textSecondary} />
                <Text style={{ fontSize: 18, fontFamily: "Poppins_600SemiBold", marginTop: 16, color: theme.textPrimary }}>
                  No activity yet
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", marginTop: 8, color: theme.textSecondary, textAlign: "center", paddingHorizontal: 40 }}>
                  {user?.role === "teacher" ? "When your students complete tasks or earn achievements, they will appear here" : "When your friends complete tasks or earn achievements, they will appear here"}
                </Text>
              </View>
            ) : (
              friendActivities.map((activity) => {
                const icon = activity.type === "task_completed" ? "checkmark-circle" :
                           activity.type === "achievement_unlocked" ? "trophy" :
                           activity.type === "streak_milestone" ? "flame" : "person-add";

                const iconColor = activity.type === "task_completed" ? theme.secondary :
                                activity.type === "achievement_unlocked" ? theme.accentColor :
                                activity.type === "streak_milestone" ? "#F59E0B" : theme.primary;

                return (
                  <View
                    key={activity.id}
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
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <View style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: iconColor + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Ionicons name={icon as any} size={22} color={iconColor} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: theme.textPrimary }}>
                          {activity.username}
                        </Text>
                        <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 2 }}>
                          {activity.description}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginTop: 4 }}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Add Student Modal */}
        <Modal visible={showAddFriendModal} transparent animationType="fade" onRequestClose={() => setShowAddFriendModal(false)}>
          <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }} onPress={() => setShowAddFriendModal(false)}>
            <Pressable style={{ backgroundColor: "white", borderRadius: 24, padding: 24, width: "100%", maxWidth: 400 }} onPress={(e) => e.stopPropagation()}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontFamily: "Poppins_700Bold", color: theme.textPrimary }}>
                  {user?.role === "teacher" ? "Add Student" : "Add Friend"}
                </Text>
                <Pressable onPress={() => setShowAddFriendModal(false)}>
                  <Ionicons name="close" size={28} color={theme.textSecondary} />
                </Pressable>
              </View>

              <Text style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: theme.textSecondary, marginBottom: 16 }}>
                {user?.role === "teacher" ? "Enter your student's email address to send them a connection request" : "Enter your friend's email address to send them a connection request"}
              </Text>

              <TextInput
                value={friendEmail}
                onChangeText={setFriendEmail}
                placeholder={user?.role === "teacher" ? "student@example.com" : "friend@example.com"}
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: theme.textSecondary + "10",
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 14,
                  fontFamily: "Poppins_400Regular",
                  color: theme.textPrimary,
                  marginBottom: 20,
                }}
              />

              <Pressable
                onPress={handleSendRequest}
                style={{
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: theme.primary,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "white" }}>
                  Send Request
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default FriendsScreen;
