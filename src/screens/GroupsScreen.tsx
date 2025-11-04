import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  const joinGroup = useGroupStore((s) => s.joinGroup);
  const leaveGroup = useGroupStore((s) => s.leaveGroup);

  const tasks = useTaskStore((s) => s.tasks);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
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

    // In a real app, this would validate the code with a backend
    // For now, we'll just find a group by ID
    const group = groups.find((g) => g.id === joinCode);
    if (group) {
      joinGroup(joinCode, user.id);
      setJoinCode("");
      setShowJoinModal(false);
      Alert.alert("Success", `Joined "${group.name}"!`);
    } else {
      Alert.alert("Error", "Invalid group code");
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

  const getGroupTasks = (groupId: string) => {
    return tasks.filter((t) => t.groupId === groupId);
  };

  const myGroups = groups.filter((g) =>
    isTeacher ? g.teacherId === user?.id : g.studentIds.includes(user?.id || "")
  );

  const selectedGroup = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null;
  const groupTasks = selectedGroup ? getGroupTasks(selectedGroup.id) : [];

  return (
    <LinearGradient
      colors={theme.backgroundGradient as [string, string, ...string[]]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
              Groups
            </Text>
            <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {isTeacher ? "Manage your classes" : "Your study groups"}
            </Text>
          </View>
          {isTeacher ? (
            <Pressable
              onPress={() => setShowCreateModal(true)}
              className="rounded-full items-center justify-center w-12 h-12"
              style={{ backgroundColor: theme.primary }}
            >
              <Ionicons name="add" size={28} color="white" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setShowJoinModal(true)}
              className="rounded-full items-center justify-center w-12 h-12"
              style={{ backgroundColor: theme.primary }}
            >
              <Ionicons name="enter" size={24} color="white" />
            </Pressable>
          )}
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
                {isTeacher
                  ? "Create a group to get started"
                  : "Join a group to collaborate with others"}
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
                        <Text className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
                          Group Code (share with students):
                        </Text>
                        <Text className="text-base font-bold" style={{ color: theme.primary }}>
                          {group.id}
                        </Text>
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
                  onChangeText={setJoinCode}
                  placeholder="Enter code from your teacher"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: theme.cardBackground, color: theme.textPrimary }}
                  autoCapitalize="none"
                />
              </View>

              <View className="rounded-xl p-4" style={{ backgroundColor: theme.primary + "15" }}>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="information-circle" size={20} color={theme.primary} />
                  <Text className="ml-2 text-sm font-semibold" style={{ color: theme.primary }}>
                    How to Join
                  </Text>
                </View>
                <Text className="text-xs" style={{ color: theme.textSecondary }}>
                  Ask your teacher for the group code and enter it above. You will be able to see assigned tasks and collaborate with classmates.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default GroupsScreen;
