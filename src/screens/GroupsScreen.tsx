import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal } from "react-native";
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
import CustomAlert from "../components/CustomAlert";
import StudyPal from "../components/StudyPal";
import { useGlobalToast } from "../context/ToastContext";
import GroupAnalyticsScreen from "./GroupAnalyticsScreen";

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{ text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }>;
}

const GroupsScreen = () => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);
  const { t } = useTranslation(user?.language || "en");
  const toast = useGlobalToast();

  const groups = useGroupStore((s) => s.groups);
  const addGroup = useGroupStore((s) => s.addGroup);
  const updateGroup = useGroupStore((s) => s.updateGroup);
  const joinGroupWithCode = useGroupStore((s) => s.joinGroupWithCode);
  const leaveGroup = useGroupStore((s) => s.leaveGroup);
  const regenerateShareCode = useGroupStore((s) => s.regenerateShareCode);

  const tasks = useTaskStore((s) => s.tasks);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsGroupId, setAnalyticsGroupId] = useState<string | null>(null);
  const [qrGroupCode, setQRGroupCode] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const isTeacher = user?.role === "teacher";

  const showAlert = (title: string, message: string, buttons?: AlertState["buttons"]) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: "OK", style: "default" }],
    });
  };

  const hideAlert = () => {
    setAlertState({ visible: false, title: "", message: "", buttons: [] });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (!acceptedRules) {
      toast.error("Please accept the group rules to continue");
      return;
    }

    if (!user) return;

    addGroup({
      name: groupName,
      description: groupDescription,
      teacherId: user.id,
      studentIds: [],
      school: school.trim() || undefined,
      className: className.trim() || undefined,
      teacherEmail: teacherEmail.trim() || undefined,
    });

    setGroupName("");
    setGroupDescription("");
    setSchool("");
    setClassName("");
    setTeacherEmail("");
    setAcceptedRules(false);
    setShowCreateModal(false);
    toast.success("Group created successfully!");
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a group code");
      return;
    }

    if (!user) return;

    // Use the share code to join the group
    const success = joinGroupWithCode(joinCode.toUpperCase(), user.id);
    if (success) {
      const group = groups.find((g) => g.shareCode === joinCode.toUpperCase());
      setJoinCode("");
      setShowJoinModal(false);
      toast.success(`Joined "${group?.name}"!`);
    } else {
      toast.error("Invalid group code or you are already a member");
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!user) return;

    showAlert(
      "Leave Group",
      "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leaveGroup(groupId, user.id);
            showAlert("Success", "Left the group");
          },
        },
      ]
    );
  };

  const handleEditGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    // Check if user is the creator
    if (group.teacherId !== user?.id) {
      showAlert("Permission Denied", "Only the group creator can edit this group");
      return;
    }

    // Pre-fill the form with existing group data
    setEditingGroupId(groupId);
    setGroupName(group.name);
    setGroupDescription(group.description || "");
    setSchool(group.school || "");
    setClassName(group.className || "");
    setTeacherEmail(group.teacherEmail || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (!editingGroupId || !user) return;

    const success = updateGroup(editingGroupId, user.id, {
      name: groupName,
      description: groupDescription,
      school: school.trim() || undefined,
      className: className.trim() || undefined,
      teacherEmail: teacherEmail.trim() || undefined,
    });

    if (success) {
      setEditingGroupId(null);
      setGroupName("");
      setGroupDescription("");
      setSchool("");
      setClassName("");
      setTeacherEmail("");
      setShowEditModal(false);
      toast.success("Group updated successfully!");
    } else {
      toast.error("Failed to update group. You must be the group creator to edit.");
    }
  };

  const handleCopyCode = (shareCode: string) => {
    Clipboard.setString(shareCode);
    toast.success(`Code "${shareCode}" copied to clipboard`);
  };

  const handleRegenerateCode = (groupId: string, groupName: string) => {
    if (!user) return;

    const userId = user.id;

    showAlert(
      "Regenerate Code",
      `This will create a new share code for "${groupName}". The old code will no longer work. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "default",
          onPress: () => {
            const newCode = regenerateShareCode(groupId, userId);
            if (newCode) {
              toast.success(`New code: ${newCode}`);
            } else {
              toast.error("Failed to regenerate code. You must be the group creator.");
            }
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

  // Separate groups into created and joined
  const createdGroups = groups.filter((g) => g.teacherId === user?.id);
  const joinedGroups = groups.filter((g) =>
    g.teacherId !== user?.id && g.studentIds.includes(user?.id || "")
  );

  // Filter groups based on search query
  const filterGroupsBySearch = (groupList: typeof groups) => {
    if (!searchQuery.trim()) return groupList;

    const query = searchQuery.toLowerCase();
    return groupList.filter((g) =>
      g.name.toLowerCase().includes(query) ||
      g.description?.toLowerCase().includes(query) ||
      g.school?.toLowerCase().includes(query) ||
      g.className?.toLowerCase().includes(query) ||
      g.teacherEmail?.toLowerCase().includes(query)
    );
  };

  const filteredCreatedGroups = filterGroupsBySearch(createdGroups);
  const filteredJoinedGroups = filterGroupsBySearch(joinedGroups);

  const selectedGroup = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null;
  const groupTasks = selectedGroup ? getGroupTasks(selectedGroup.id) : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView className="flex-1">
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{
                  fontSize: 32,
                  fontFamily: 'Poppins_700Bold',
                  color: theme.textPrimary
                }}>
                  Groups
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
              <Text style={{
                fontSize: 14,
                fontFamily: 'Poppins_400Regular',
                color: theme.textSecondary,
                marginTop: 4
              }}>
                Create, join, and manage class groups
              </Text>
            </View>
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

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2
          }}>
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by school, class, email..."
              placeholderTextColor={theme.textSecondary}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 14,
                fontFamily: 'Poppins_400Regular',
                color: theme.textPrimary
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-2" showsVerticalScrollIndicator={false}>
          {filteredCreatedGroups.length === 0 && filteredJoinedGroups.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: theme.primary + "20" }}
              >
                <Ionicons name="people" size={40} color={theme.primary} />
              </View>
              <Text className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                No Groups Yet
              </Text>
              <Text className="text-sm text-center" style={{ color: theme.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                Create your own class group or join an existing one
              </Text>
            </View>
          ) : (
            <View className="pb-6">
              {/* Created Groups Section */}
              {filteredCreatedGroups.length > 0 && (
                <View className="mb-6">
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="create-outline" size={24} color={theme.primary} />
                    <Text style={{
                      fontSize: 18,
                      fontFamily: 'Poppins_600SemiBold',
                      color: theme.textPrimary,
                      marginLeft: 8
                    }}>
                      My Class Groups ({filteredCreatedGroups.length})
                    </Text>
                  </View>
                  {filteredCreatedGroups.map((group) => {
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
                              <Text style={{ fontSize: 18, fontFamily: 'Poppins_700Bold', color: theme.textPrimary }}>
                                {group.name}
                              </Text>
                              <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginTop: 2 }}>
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
                          <Text style={{ fontSize: 14, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginBottom: 12 }}>
                            {group.description}
                          </Text>
                        )}

                        {/* Group Metadata */}
                        {(group.school || group.className || group.teacherEmail) && (
                          <View style={{ marginBottom: 12 }}>
                            {group.school && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Ionicons name="school-outline" size={14} color={theme.textSecondary} />
                                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginLeft: 6 }}>
                                  {group.school}
                                </Text>
                              </View>
                            )}
                            {group.className && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Ionicons name="book-outline" size={14} color={theme.textSecondary} />
                                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginLeft: 6 }}>
                                  {group.className}
                                </Text>
                              </View>
                            )}
                            {group.teacherEmail && (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="mail-outline" size={14} color={theme.textSecondary} />
                                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginLeft: 6 }}>
                                  {group.teacherEmail}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Group Stats */}
                        <View className="flex-row gap-4 mb-3">
                          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: theme.primary + "15" }}>
                            <Text style={{ fontSize: 24, fontFamily: 'Poppins_700Bold', color: theme.primary }}>
                              {groupTaskCount}
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary }}>
                              Total Tasks
                            </Text>
                          </View>
                          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: theme.secondary + "15" }}>
                            <Text style={{ fontSize: 24, fontFamily: 'Poppins_700Bold', color: theme.secondary }}>
                              {completedTasks}
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary }}>
                              Completed
                            </Text>
                          </View>
                        </View>

                        {/* Group Code (for creators) */}
                        <View className="rounded-xl p-3 mb-3" style={{ backgroundColor: theme.accentColor + "15" }}>
                          <Text style={{ fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: theme.textSecondary, marginBottom: 8 }}>
                            Share Code (for students to join):
                          </Text>
                          <Text style={{ fontSize: 28, fontFamily: 'Poppins_700Bold', color: theme.primary, letterSpacing: 4, marginBottom: 12 }}>
                            {group.shareCode}
                          </Text>

                          {/* Code Action Buttons */}
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                handleCopyCode(group.shareCode);
                              }}
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
                              onPress={(e) => {
                                e.stopPropagation();
                                handleShowQR(group.shareCode);
                              }}
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
                              onPress={(e) => {
                                e.stopPropagation();
                                handleRegenerateCode(group.id, group.name);
                              }}
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

                        {/* Edit Group Button (for creators only) */}
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEditGroup(group.id);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: theme.primary,
                            marginBottom: 8
                          }}
                        >
                          <Ionicons name="create-outline" size={18} color="white" />
                          <Text style={{ color: 'white', marginLeft: 8, fontSize: 14, fontFamily: 'Poppins_600SemiBold' }}>
                            Edit Group Details
                          </Text>
                        </Pressable>

                        {/* View Analytics Button (for creators only) */}
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            setAnalyticsGroupId(group.id);
                            setShowAnalyticsModal(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: theme.secondary,
                            marginBottom: 12
                          }}
                        >
                          <Ionicons name="stats-chart-outline" size={18} color="white" />
                          <Text style={{ color: 'white', marginLeft: 8, fontSize: 14, fontFamily: 'Poppins_600SemiBold' }}>
                            View Analytics
                          </Text>
                        </Pressable>

                        {/* Expanded Content - Teacher Dashboard */}
                        {selectedGroupId === group.id && (
                          <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: theme.textSecondary + "20" }}>
                            {/* Student List */}
                            <View className="mb-6">
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <Text style={{ fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: theme.textPrimary }}>
                                  Students ({group.studentIds.length})
                                </Text>
                              </View>
                              {group.studentIds.length === 0 ? (
                                <View style={{ backgroundColor: theme.backgroundGradient[0], borderRadius: 12, padding: 16, alignItems: 'center' }}>
                                  <Ionicons name="people-outline" size={32} color={theme.textSecondary} style={{ marginBottom: 8 }} />
                                  <Text style={{ fontSize: 14, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, textAlign: 'center' }}>
                                    No students have joined yet
                                  </Text>
                                  <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, textAlign: 'center', marginTop: 4 }}>
                                    Share the group code for students to join
                                  </Text>
                                </View>
                              ) : (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                  {group.studentIds.map((studentId, index) => (
                                    <View
                                      key={studentId}
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: theme.primary + "15",
                                        borderRadius: 20,
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                      }}
                                    >
                                      <View
                                        style={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: 14,
                                          backgroundColor: theme.primary,
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          marginRight: 8,
                                        }}
                                      >
                                        <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Poppins_600SemiBold' }}>
                                          {`S${index + 1}`}
                                        </Text>
                                      </View>
                                      <Text style={{ fontSize: 12, fontFamily: 'Poppins_500Medium', color: theme.textPrimary }}>
                                        Student {index + 1}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>

                            {/* Assign Task Button */}
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                // Navigate to TasksScreen with group pre-selected
                                toast.info("Create a task and assign it to this group from the Tasks tab");
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 14,
                                borderRadius: 12,
                                backgroundColor: theme.secondary,
                                marginBottom: 16,
                              }}
                            >
                              <Ionicons name="add-circle-outline" size={20} color="white" />
                              <Text style={{ color: 'white', marginLeft: 8, fontSize: 14, fontFamily: 'Poppins_600SemiBold' }}>
                                Assign Task to Group
                              </Text>
                            </Pressable>

                            {/* Group Tasks with Progress Tracking */}
                            <Text style={{ fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: theme.textPrimary, marginBottom: 12 }}>
                              Group Tasks
                            </Text>
                            {groupTasks.length === 0 ? (
                              <Text style={{ fontSize: 14, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, textAlign: 'center', paddingVertical: 16 }}>
                                No tasks assigned yet
                              </Text>
                            ) : (
                              groupTasks.map((task) => {
                                // Calculate completion rate (mock data for now)
                                const totalStudents = group.studentIds.length;
                                const completedByCount = totalStudents > 0 ? Math.floor(Math.random() * (totalStudents + 1)) : 0;
                                const completionRate = totalStudents > 0 ? Math.round((completedByCount / totalStudents) * 100) : 0;

                                return (
                                  <View
                                    key={task.id}
                                    className="rounded-xl p-4 mb-3"
                                    style={{ backgroundColor: theme.backgroundGradient[0], borderWidth: 1, borderColor: theme.textSecondary + "20" }}
                                  >
                                    <View className="flex-row items-start justify-between mb-2">
                                      <View className="flex-1">
                                        <Text
                                          style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold', fontSize: 15 }}
                                        >
                                          {task.title}
                                        </Text>
                                        {task.description && (
                                          <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginTop: 4 }}>
                                            {task.description}
                                          </Text>
                                        )}
                                        <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginTop: 6 }}>
                                          Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          backgroundColor: completionRate === 100 ? theme.secondary + "20" : theme.primary + "20",
                                          borderRadius: 20,
                                          paddingHorizontal: 12,
                                          paddingVertical: 6,
                                        }}
                                      >
                                        <Text style={{ fontSize: 12, fontFamily: 'Poppins_700Bold', color: completionRate === 100 ? theme.secondary : theme.primary }}>
                                          {completionRate}%
                                        </Text>
                                      </View>
                                    </View>

                                    {/* Progress Bar */}
                                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <Text style={{ fontSize: 11, fontFamily: 'Poppins_500Medium', color: theme.textSecondary }}>
                                          Student Progress
                                        </Text>
                                        <Text style={{ fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: theme.textPrimary }}>
                                          {completedByCount}/{totalStudents} completed
                                        </Text>
                                      </View>
                                      <View style={{ height: 6, backgroundColor: theme.textSecondary + "20", borderRadius: 3, overflow: 'hidden' }}>
                                        <View
                                          style={{
                                            height: '100%',
                                            width: `${completionRate}%`,
                                            backgroundColor: completionRate === 100 ? theme.secondary : theme.primary,
                                            borderRadius: 3,
                                          }}
                                        />
                                      </View>
                                    </View>

                                    {/* Student completion indicators */}
                                    {totalStudents > 0 && (
                                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                        {group.studentIds.map((studentId, index) => {
                                          const hasCompleted = index < completedByCount;
                                          return (
                                            <View
                                              key={studentId}
                                              style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 16,
                                                backgroundColor: hasCompleted ? theme.secondary + "30" : theme.textSecondary + "15",
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderWidth: 1,
                                                borderColor: hasCompleted ? theme.secondary : theme.textSecondary + "30",
                                              }}
                                            >
                                              {hasCompleted ? (
                                                <Ionicons name="checkmark" size={16} color={theme.secondary} />
                                              ) : (
                                                <Text style={{ fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: theme.textSecondary }}>
                                                  {index + 1}
                                                </Text>
                                              )}
                                            </View>
                                          );
                                        })}
                                      </View>
                                    )}
                                  </View>
                                );
                              })
                            )}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* Joined Groups Section */}
              {filteredJoinedGroups.length > 0 && (
                <View className="mb-6">
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="enter-outline" size={24} color={theme.secondary} />
                    <Text style={{
                      fontSize: 18,
                      fontFamily: 'Poppins_600SemiBold',
                      color: theme.textPrimary,
                      marginLeft: 8
                    }}>
                      Joined Class Groups ({filteredJoinedGroups.length})
                    </Text>
                  </View>
                  {filteredJoinedGroups.map((group) => {
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
                              style={{ backgroundColor: theme.secondary + "20" }}
                            >
                              <Ionicons name="people" size={24} color={theme.secondary} />
                            </View>
                            <View className="flex-1">
                              <Text style={{ fontSize: 18, fontFamily: 'Poppins_700Bold', color: theme.textPrimary }}>
                                {group.name}
                              </Text>
                              <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginTop: 2 }}>
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
                          <Text style={{ fontSize: 14, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginBottom: 12 }}>
                            {group.description}
                          </Text>
                        )}

                        {/* Group Metadata */}
                        {(group.school || group.className || group.teacherEmail) && (
                          <View style={{ marginBottom: 12 }}>
                            {group.school && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Ionicons name="school-outline" size={14} color={theme.textSecondary} />
                                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginLeft: 6 }}>
                                  {group.school}
                                </Text>
                              </View>
                            )}
                            {group.className && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Ionicons name="book-outline" size={14} color={theme.textSecondary} />
                                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginLeft: 6 }}>
                                  {group.className}
                                </Text>
                              </View>
                            )}
                            {group.teacherEmail && (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="mail-outline" size={14} color={theme.textSecondary} />
                                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginLeft: 6 }}>
                                  {group.teacherEmail}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Group Stats */}
                        <View className="flex-row gap-4 mb-3">
                          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: theme.primary + "15" }}>
                            <Text style={{ fontSize: 24, fontFamily: 'Poppins_700Bold', color: theme.primary }}>
                              {groupTaskCount}
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary }}>
                              Total Tasks
                            </Text>
                          </View>
                          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: theme.secondary + "15" }}>
                            <Text style={{ fontSize: 24, fontFamily: 'Poppins_700Bold', color: theme.secondary }}>
                              {completedTasks}
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary }}>
                              Completed
                            </Text>
                          </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              handleLeaveGroup(group.id);
                            }}
                            className="flex-1 py-2 rounded-xl items-center"
                            style={{ backgroundColor: "#EF444420" }}
                          >
                            <Text style={{ fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: "#EF4444" }}>
                              Leave Group
                            </Text>
                          </Pressable>
                        </View>

                        {/* Expanded Content - Group Tasks */}
                        {selectedGroupId === group.id && (
                          <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: theme.textSecondary + "20" }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: theme.textPrimary, marginBottom: 12 }}>
                              Group Tasks
                            </Text>
                            {groupTasks.length === 0 ? (
                              <Text style={{ fontSize: 14, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, textAlign: 'center', paddingVertical: 16 }}>
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
                                        style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}
                                      >
                                        {task.title}
                                      </Text>
                                      {task.description && (
                                        <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginTop: 4 }}>
                                          {task.description}
                                        </Text>
                                      )}
                                      <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: theme.textSecondary, marginTop: 4 }}>
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
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  Group Name *
                </Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="e.g., Math Class 2025"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
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
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  School (Optional)
                </Text>
                <TextInput
                  value={school}
                  onChangeText={setSchool}
                  placeholder="e.g., Lincoln High School"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  Class Name (Optional)
                </Text>
                <TextInput
                  value={className}
                  onChangeText={setClassName}
                  placeholder="e.g., Grade 10 Math"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  Teacher Email (Optional)
                </Text>
                <TextInput
                  value={teacherEmail}
                  onChangeText={setTeacherEmail}
                  placeholder="e.g., teacher@school.edu"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              {/* Group Rules */}
              <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: theme.primary + "15" }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
                  <Text style={{ color: theme.primary, marginLeft: 8, fontSize: 14, fontFamily: 'Poppins_600SemiBold' }}>
                    Group Rules & Guidelines
                  </Text>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8, fontFamily: 'Poppins_400Regular' }}>
                  By creating this group, you agree to maintain:
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, fontFamily: 'Poppins_400Regular' }}>
                  • Respectful and appropriate behavior
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, fontFamily: 'Poppins_400Regular' }}>
                  • Age-appropriate and educational content only
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, fontFamily: 'Poppins_400Regular' }}>
                  • No bullying, harassment, or inappropriate language
                </Text>

                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowRulesModal(true);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ marginBottom: 12, paddingVertical: 4 }}
                >
                  <Text style={{ color: theme.primary, fontSize: 12, fontFamily: 'Poppins_600SemiBold', textDecorationLine: 'underline' }}>
                    Read Full Rules & Guidelines
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setAcceptedRules(!acceptedRules)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: theme.primary,
                    backgroundColor: acceptedRules ? theme.primary : 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    {acceptedRules && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text style={{ color: theme.textPrimary, fontSize: 13, fontFamily: 'Poppins_400Regular', flex: 1 }}>
                    I agree to follow the group rules and maintain appropriate content
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Edit Group Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowEditModal(false);
            setEditingGroupId(null);
          }}
        >
          <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
            <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.textSecondary + "20" }}>
              <Pressable onPress={() => {
                setShowEditModal(false);
                setEditingGroupId(null);
              }}>
                <Text style={{ color: theme.primary, fontFamily: 'Poppins_400Regular' }} className="text-lg">Cancel</Text>
              </Pressable>
              <Text className="text-xl" style={{ color: theme.textPrimary, fontFamily: 'Poppins_700Bold' }}>
                Edit Group
              </Text>
              <Pressable onPress={handleSaveEdit}>
                <Text style={{ color: theme.primary, fontFamily: 'Poppins_600SemiBold' }} className="text-lg">Save</Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  Group Name *
                </Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="e.g., Math Class 2025"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
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
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  School (Optional)
                </Text>
                <TextInput
                  value={school}
                  onChangeText={setSchool}
                  placeholder="e.g., Lincoln High School"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  Class Name (Optional)
                </Text>
                <TextInput
                  value={className}
                  onChangeText={setClassName}
                  placeholder="e.g., Grade 10 Math"
                  placeholderTextColor={theme.textSecondary}
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: theme.textSecondary, fontFamily: 'Poppins_500Medium' }}>
                  Teacher Email (Optional)
                </Text>
                <TextInput
                  value={teacherEmail}
                  onChangeText={setTeacherEmail}
                  placeholder="e.g., teacher@school.edu"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="rounded-xl px-4 py-3 text-base"
                  style={{ backgroundColor: 'white', color: theme.textPrimary, fontFamily: 'Poppins_400Regular' }}
                />
              </View>

              {/* Info Box */}
              <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: theme.primary + "15" }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="information-circle" size={20} color={theme.primary} />
                  <Text style={{ color: theme.primary, marginLeft: 8, fontSize: 14, fontFamily: 'Poppins_600SemiBold' }}>
                    Note
                  </Text>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily: 'Poppins_400Regular' }}>
                  You can edit the group name, description, and metadata. The share code and member list cannot be changed from this screen.
                </Text>
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

        {/* Group Rules Modal */}
        <Modal
          visible={showRulesModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowRulesModal(false)}
        >
          <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
            <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.textSecondary + "20" }}>
              <View style={{ width: 60 }} />
              <Text className="text-xl" style={{ color: theme.textPrimary, fontFamily: 'Poppins_700Bold' }}>
                Group Rules
              </Text>
              <Pressable onPress={() => setShowRulesModal(false)}>
                <Ionicons name="close" size={28} color={theme.textPrimary} />
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
              {/* Introduction */}
              <View className="mb-6">
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="shield-checkmark" size={22} color="white" />
                  </View>
                  <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    Our Commitment
                  </Text>
                </View>
                <View className="rounded-2xl p-4" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 22, fontFamily: 'Poppins_400Regular' }}>
                    We are committed to providing a safe, respectful, and productive learning environment for all students and educators. These rules help ensure everyone can learn and collaborate effectively.
                  </Text>
                </View>
              </View>

              {/* Respectful Behavior */}
              <View className="mb-6">
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="heart" size={22} color="white" />
                  </View>
                  <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    Respectful Behavior
                  </Text>
                </View>
                <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • Treat all members with kindness and respect
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, fontFamily: 'Poppins_400Regular' }}>
                    Every group member deserves to feel safe and valued. Be considerate in your words and actions.
                  </Text>

                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • Zero tolerance for bullying or harassment
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, fontFamily: 'Poppins_400Regular' }}>
                    Any form of bullying, harassment, intimidation, or discrimination is strictly prohibited and will result in immediate removal.
                  </Text>

                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • Use appropriate and professional language
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily: 'Poppins_400Regular' }}>
                    Avoid profanity, offensive language, or inappropriate jokes. Keep communication educational and constructive.
                  </Text>
                </View>
              </View>

              {/* Appropriate Content */}
              <View className="mb-6">
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.accentColor, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="book" size={22} color="white" />
                  </View>
                  <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    Appropriate Content
                  </Text>
                </View>
                <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • Educational and age-appropriate content only
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, fontFamily: 'Poppins_400Regular' }}>
                    All shared content must be relevant to learning and appropriate for all ages. No adult content, violence, or disturbing material.
                  </Text>

                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • No spam or irrelevant material
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, fontFamily: 'Poppins_400Regular' }}>
                    Keep group content focused on its educational purpose. Avoid off-topic discussions or spam.
                  </Text>

                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • Respect intellectual property
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily: 'Poppins_400Regular' }}>
                    Do not share copyrighted material without permission. Give credit when using others work.
                  </Text>
                </View>
              </View>

              {/* Privacy & Safety */}
              <View className="mb-6">
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E91E63', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="lock-closed" size={22} color="white" />
                  </View>
                  <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    Privacy & Safety
                  </Text>
                </View>
                <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • Protect personal information
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12, fontFamily: 'Poppins_400Regular' }}>
                    Do not share personal addresses, phone numbers, or other sensitive information. Keep share codes secure.
                  </Text>

                  <Text style={{ color: theme.textPrimary, fontSize: 13, marginBottom: 6, fontFamily: 'Poppins_600SemiBold' }}>
                    • Report concerns immediately
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily: 'Poppins_400Regular' }}>
                    If you see inappropriate behavior or content, report it to your teacher or group administrator immediately.
                  </Text>
                </View>
              </View>

              {/* Consequences */}
              <View className="mb-8">
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF5722', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="warning" size={22} color="white" />
                  </View>
                  <Text className="text-lg" style={{ color: theme.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                    Consequences
                  </Text>
                </View>
                <View className="rounded-2xl p-4" style={{ backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20, fontFamily: 'Poppins_400Regular' }}>
                    Violations of these rules may result in:
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8, marginBottom: 4, fontFamily: 'Poppins_400Regular' }}>
                    • Warning from group administrator
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4, fontFamily: 'Poppins_400Regular' }}>
                    • Temporary suspension from the group
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8, fontFamily: 'Poppins_400Regular' }}>
                    • Permanent removal from the group
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily: 'Poppins_400Regular' }}>
                    Severe violations may be reported to school authorities or parents.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setShowRulesModal(false)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 32,
                  borderRadius: 16,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  marginBottom: 20
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontFamily: 'Poppins_600SemiBold'
                }}>
                  I Understand
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>

      {/* Analytics Modal */}
      <Modal visible={showAnalyticsModal} animationType="slide" presentationStyle="fullScreen">
        {analyticsGroupId && (
          <GroupAnalyticsScreen
            groupId={analyticsGroupId}
            onClose={() => {
              setShowAnalyticsModal(false);
              setAnalyticsGroupId(null);
            }}
          />
        )}
      </Modal>

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
        theme={theme}
      />
    </View>
  );
};

export default GroupsScreen;
