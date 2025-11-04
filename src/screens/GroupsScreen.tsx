import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Clipboard from "@react-native-clipboard/clipboard";
import QRCode from "react-native-qrcode-svg";
import useUserStore from "../state/userStore";
import useGroupStore from "../state/groupStore";
import useTaskStore from "../state/taskStore";
import { getTheme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { cn } from "../utils/cn";

const GroupsScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);
  const { t } = useTranslation(user?.language || "en");

  const groups = useGroupStore((s) => s.groups);
  const addGroup = useGroupStore((s) => s.addGroup);
  const joinGroupWithCode = useGroupStore((s) => s.joinGroupWithCode);
  const leaveGroup = useGroupStore((s) => s.leaveGroup);
  const regenerateShareCode = useGroupStore((s) => s.regenerateShareCode);

  const tasks = useTaskStore((s) => s.tasks);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);
  const [qrGroupCode, setQRGroupCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const isTeacher = user?.role === "teacher";

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (!user) return;

    addGroup({
      name: groupName,
      description: groupDescription,
      teacherId: user.id,
      studentIds: [],
    });

    setGroupName("");
    setGroupDescription("");
    setShowCreateModal(false);
    Alert.alert("Success", "Group created successfully!");
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      Alert.alert("Error", "Please enter a group code");
      return;
    }

    if (!user) return;

    // Use the share code to join the group
    const success = joinGroupWithCode(joinCode.toUpperCase(), user.id);
    if (success) {
      const group = groups.find((g) => g.shareCode === joinCode.toUpperCase());
      setJoinCode("");
      setShowJoinModal(false);
      Alert.alert("Success", `Joined "${group?.name}"!`);
    } else {
      Alert.alert("Error", "Invalid group code or you are already a member");
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!user) return;

    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leaveGroup(groupId, user.id);
            Alert.alert("Success", "Left the group");
          },
        },
      ]
    );
  };

  const handleCopyCode = (shareCode: string) => {
    Clipboard.setString(shareCode);
    Alert.alert("Copied!", `Code "${shareCode}" copied to clipboard`);
  };

  const handleRegenerateCode = (groupId: string, groupName: string) => {
    Alert.alert(
      "Regenerate Code",
      `This will create a new share code for "${groupName}". The old code will no longer work. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "default",
          onPress: () => {
            const newCode = regenerateShareCode(groupId);
            Alert.alert("Success", `New code: ${newCode}`);
          },
        },
      ]
    );
  };

  const handleShowQR = (shareCode: string) => {
    setQRGroupCode(shareCode);
    setShowQRModal(true);
  };

  const getGroupTasks = (groupId: string) => {
    return tasks.filter((t) => t.groupId === groupId);
  };

  const myGroups = groups.filter((g) =>
    isTeacher ? g.teacherId === user?.id : g.studentIds.includes(user?.id || "")
  );

  const selectedGroup = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null;
  const groupTasks = selectedGroup ? getGroupTasks(selectedGroup.id) : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView className="flex-1">
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 32,
              fontFamily: 'Poppins_700Bold',
              color: theme.textPrimary
            }}>
              Groups
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: 'Poppins_400Regular',
              color: theme.textSecondary,
              marginTop: 4
            }}>
              Create, join, and manage study groups
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Help Button */}
            <Pressable
              onPress={() => setShowHowToModal(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2
              }}
            >
              <Ionicons name="help-circle-outline" size={24} color={theme.primary} />
            </Pressable>

            {/* Join Group Button */}
            <Pressable
              onPress={() => setShowJoinModal(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3
              }}
            >
              <Ionicons name="enter" size={24} color="white" />
            </Pressable>

            {/* Create Group Button (for everyone) */}
            <Pressable
              onPress={() => setShowCreateModal(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3
              }}
            >
              <Ionicons name="add" size={28} color="white" />
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-2" showsVerticalScrollIndicator={false}>
          {myGroups.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: theme.primary + "20" }}
              >
                <Ionicons name="people" size={40} color={theme.primary} />
              </View>
              <Text className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
                No Groups Yet
              </Text>
              <Text className="text-sm text-center" style={{ color: theme.textSecondary }}>
                Create your own group or join an existing one
              </Text>
            </View>
          ) : (
            <View className="pb-6">
              {myGroups.map((group) => {
                const groupTaskCount = getGroupTasks(group.id).length;
                const completedTasks = getGroupTasks(group.id).filter(
                  (t) => t.status === "completed"
                ).length;

                return (
                  <Pressable
                    key={group.id}
                    onPress={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                    className="rounded-2xl p-4 mb-3"
                    style={{ backgroundColor: theme.cardBackground }}
                  >
                    {/* Group Header */}
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: theme.primary + "20" }}
                        >
                          <Ionicons name="people" size={24} color={theme.primary} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                            {group.name}
                          </Text>
                          <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                            {group.studentIds.length} {group.studentIds.length === 1 ? "member" : "members"}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name={selectedGroupId === group.id ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={theme.textSecondary}
                      />
                    </View>

                    {/* Group Description */}
                    {group.description && (
                      <Text className="text-sm mb-3" style={{ color: theme.textSecondary }}>
                        {group.description}
                      </Text>
                    )}

                    {/* Group Stats */}
                    <View className="flex-row gap-4 mb-3">
                      <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: theme.primary + "15" }}>
                        <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                          {groupTaskCount}
                        </Text>
                        <Text className="text-xs" style={{ color: theme.textSecondary }}>
                          Total Tasks
                        </Text>
                      </View>
                      <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: theme.secondary + "15" }}>
                        <Text className="text-2xl font-bold" style={{ color: theme.secondary }}>
                          {completedTasks}
                        </Text>
                        <Text className="text-xs" style={{ color: theme.textSecondary }}>
                          Completed
                        </Text>
                      </View>
                    </View>

                    {/* Group Code (for teachers) */}
                    {isTeacher && (
                      <View className="rounded-xl p-3 mb-3" style={{ backgroundColor: theme.accentColor + "15" }}>
                        <Text className="text-xs font-semibold mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_600SemiBold' }}>
                          Share Code (for students to join):
                        </Text>
                        <Text className="text-2xl font-bold tracking-wider mb-3" style={{ color: theme.primary, fontFamily: 'Poppins_700Bold' }}>
                          {group.shareCode}
                        </Text>

                        {/* Code Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => handleCopyCode(group.shareCode)}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingVertical: 10,
                              borderRadius: 12,
                              backgroundColor: theme.primary
                            }}
                          >
                            <Ionicons name="copy-outline" size={16} color="white" />
                            <Text style={{ color: 'white', marginLeft: 6, fontSize: 12, fontFamily: 'Poppins_600SemiBold' }}>
                              Copy
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => handleShowQR(group.shareCode)}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingVertical: 10,
                              borderRadius: 12,
                              backgroundColor: theme.secondary
                            }}
                          >
                            <Ionicons name="qr-code-outline" size={16} color="white" />
                            <Text style={{ color: 'white', marginLeft: 6, fontSize: 12, fontFamily: 'Poppins_600SemiBold' }}>
                              QR Code
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => handleRegenerateCode(group.id, group.name)}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingVertical: 10,
                              borderRadius: 12,
                              backgroundColor: theme.accentColor
                            }}
                          >
                            <Ionicons name="refresh-outline" size={16} color="white" />
                            <Text style={{ color: 'white', marginLeft: 6, fontSize: 12, fontFamily: 'Poppins_600SemiBold' }}>
                              New
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                      {!isTeacher && (
                        <Pressable
                          onPress={() => handleLeaveGroup(group.id)}
                          className="flex-1 py-2 rounded-xl items-center"
                          style={{ backgroundColor: "#EF444420" }}
                        >
                          <Text className="text-sm font-semibold" style={{ color: "#EF4444" }}>
                            Leave Group
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {/* Expanded Content - Group Tasks */}
                    {selectedGroupId === group.id && (
                      <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: theme.textSecondary + "20" }}>
                        <Text className="text-sm font-bold mb-3" style={{ color: theme.textPrimary }}>
                          Group Tasks
                        </Text>
                        {groupTasks.length === 0 ? (
                          <Text className="text-sm text-center py-4" style={{ color: theme.textSecondary }}>
                            No tasks assigned yet
                          </Text>
                        ) : (
                          groupTasks.map((task) => (
                            <View
                              key={task.id}
                              className="rounded-xl p-3 mb-2"
                              style={{ backgroundColor: theme.backgroundGradient[0] }}
                            >
                              <View className="flex-row items-start">
                                <Ionicons
                                  name={task.status === "completed" ? "checkmark-circle" : "ellipse-outline"}
                                  size={20}
                                  color={task.status === "completed" ? theme.secondary : theme.textSecondary}
                                  style={{ marginRight: 8, marginTop: 2 }}
                                />
                                <View className="flex-1">
                                  <Text
                                    className={cn("text-sm font-semibold", task.status === "completed" && "line-through")}
                                    style={{ color: theme.textPrimary }}
                                  >
                                    {task.title}
                                  </Text>
                                  {task.description && (
                                    <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                                      {task.description}
                                    </Text>
                                  )}
                                  <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Create Group Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
            <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.textSecondary + "20" }}>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Text style={{ color: theme.primary }} className="text-lg">Cancel</Text>
              </Pressable>
              <Text className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                Create Group
              </Text>
              <Pressable onPress={handleCreateGroup}>
                <Text style={{ color: theme.primary }} className="text-lg font-semibold">Create</Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Group Name
                </Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="e.g., Math Class 2025"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: theme.cardBackground, color: theme.textPrimary }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Description (Optional)
                </Text>
                <TextInput
                  value={groupDescription}
                  onChangeText={setGroupDescription}
                  placeholder="What is this group about?"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="rounded-xl px-4 py-3 text-base min-h-[100px]"
                  style={{ backgroundColor: theme.cardBackground, color: theme.textPrimary }}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Join Group Modal */}
        <Modal
          visible={showJoinModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowJoinModal(false)}
        >
          <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
            <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.textSecondary + "20" }}>
              <Pressable onPress={() => setShowJoinModal(false)}>
                <Text style={{ color: theme.primary }} className="text-lg">Cancel</Text>
              </Pressable>
              <Text className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                Join Group
              </Text>
              <Pressable onPress={handleJoinGroup}>
                <Text style={{ color: theme.primary }} className="text-lg font-semibold">Join</Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                  Group Code
                </Text>
                <TextInput
                  value={joinCode}
                  onChangeText={(text) => setJoinCode(text.toUpperCase())}
                  placeholder="e.g., ABC123"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    fontSize: 20,
                    fontFamily: 'Poppins_600SemiBold',
                    letterSpacing: 2,
                    textAlign: 'center'
                  }}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <View className="rounded-xl p-4" style={{ backgroundColor: theme.primary + "15" }}>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="information-circle" size={20} color={theme.primary} />
                  <Text className="ml-2 text-sm font-semibold" style={{ color: theme.primary, fontFamily: 'Poppins_600SemiBold' }}>
                    How to Join
                  </Text>
                </View>
                <Text className="text-xs" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  Ask your teacher for the 6-character group code and enter it above. You will be able to see assigned tasks and collaborate with classmates.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* QR Code Modal */}
        <Modal
          visible={showQRModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowQRModal(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.7)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => setShowQRModal(false)}
          >
            <Pressable
              style={{
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 24,
                alignItems: 'center',
                maxWidth: '90%'
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={{
                fontSize: 20,
                fontFamily: 'Poppins_700Bold',
                color: theme.textPrimary,
                marginBottom: 8
              }}>
                Scan to Join Group
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Poppins_400Regular',
                color: theme.textSecondary,
                marginBottom: 20,
                textAlign: 'center'
              }}>
                Students can scan this QR code to join
              </Text>

              <View style={{
                padding: 16,
                backgroundColor: 'white',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4
              }}>
                <QRCode
                  value={qrGroupCode}
                  size={200}
                  backgroundColor="white"
                  color={theme.primary}
                />
              </View>

              <Text style={{
                fontSize: 24,
                fontFamily: 'Poppins_700Bold',
                color: theme.primary,
                marginTop: 16,
                letterSpacing: 4
              }}>
                {qrGroupCode}
              </Text>

              <Pressable
                onPress={() => setShowQRModal(false)}
                style={{
                  marginTop: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 16,
                  backgroundColor: theme.primary
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontFamily: 'Poppins_600SemiBold'
                }}>
                  Close
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* How To Modal */}
        <Modal
          visible={showHowToModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowHowToModal(false)}
        >
          <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
            {/* Modal Header */}
            <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.textSecondary + "20" }}>
              <View style={{ width: 60 }} />
              <Text className="text-xl" style={{ color: theme.textPrimary, fontFamily: 'Poppins_700Bold' }}>
                How To Use Groups
              </Text>
              <Pressable onPress={() => setShowHowToModal(false)}>
                <Ionicons name="close" size={28} color={theme.textPrimary} />
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
              {/* For Teachers */}
              {isTeacher && (
                <>
                  <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Ionicons name="add-circle" size={22} color="white" />
                      </View>
                      <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        Creating a Group
                      </Text>
                    </View>
                    <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                      <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        Step 1: Tap the + Button
                      </Text>
                      <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                        In the top-right corner, tap the blue + button to open the create group form.
                      </Text>

                      <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        Step 2: Fill in Details
                      </Text>
                      <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                        Enter a group name (required) and description (optional). Then tap &quot;Create&quot;.
                      </Text>

                      <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        Step 3: Share Your Code
                      </Text>
                      <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                        {"A unique 6-character code is automatically generated. You'll see it displayed in your group card."}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Ionicons name="share-social" size={22} color="white" />
                      </View>
                      <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        Sharing Your Group Code
                      </Text>
                    </View>
                    <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                      <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        • Copy Button
                      </Text>
                      <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                        Tap &quot;Copy&quot; to copy the code to your clipboard. Then paste it in messages, emails, or announcements.
                      </Text>

                      <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        • QR Code Button
                      </Text>
                      <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                        Tap &quot;QR Code&quot; to show a scannable QR code. Students can scan it with their phone camera to get the code instantly.
                      </Text>

                      <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                        • New Button
                      </Text>
                      <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                        {"Tap \"New\" to regenerate a fresh code. Useful if you need to reset access. The old code will stop working."}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* For Students */}
              {!isTeacher && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Ionicons name="enter" size={22} color="white" />
                    </View>
                    <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                      Joining a Group
                    </Text>
                  </View>
                  <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                    <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                      Step 1: Get the Code
                    </Text>
                    <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                      Ask your teacher for the 6-character group code. They can send it via message, email, or show a QR code.
                    </Text>

                    <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                      Step 2: Tap Join Button
                    </Text>
                    <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                      In the top-right corner, tap the enter/join button to open the join form.
                    </Text>

                    <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                      Step 3: Enter Code
                    </Text>
                    <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                      Type in the 6-character code and tap &quot;Join&quot;. You will immediately see the group and any assigned tasks.
                    </Text>
                  </View>
                </View>
              )}

              {/* Managing Groups (Common) */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.accentColor, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="settings" size={22} color="white" />
                  </View>
                  <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    Managing Groups
                  </Text>
                </View>
                <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    • View Group Details
                  </Text>
                  <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    Tap on any group card to expand and see tasks, member count, and other details.
                  </Text>

                  <Text className="text-sm mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    • Leave a Group
                  </Text>
                  <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    {isTeacher ? "As a teacher, you cannot leave groups you created. You can regenerate the code to reset access." : "Students can leave a group anytime by tapping the \"Leave Group\" button in the expanded view."}
                  </Text>
                </View>
              </View>

              {/* Pro Tips */}
              <View className="mb-8">
                <View className="flex-row items-center mb-3">
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFB800', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="bulb" size={22} color="white" />
                  </View>
                  <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    Pro Tips
                  </Text>
                </View>
                <View className="rounded-2xl p-4" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    • Codes are case-insensitive and automatically capitalize as you type
                  </Text>
                  <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    • Each group gets a unique code that never expires (unless regenerated)
                  </Text>
                  <Text className="text-sm mb-3" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    • You can be a member of multiple groups at the same time
                  </Text>
                  <Text className="text-sm" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                    • Group tasks and progress are shared with all members
                  </Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default GroupsScreen;
