import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useUserStore from "../state/userStore";
import useGroupStore from "../state/groupStore";
import useTaskStore from "../state/taskStore";
import { getTheme } from "../utils/themes";
import { calculateGroupAnalytics, getGroupEngagementSummary } from "../utils/groupAnalytics";
import StudyPal from "../components/StudyPal";

interface GroupAnalyticsScreenProps {
  groupId: string;
  onClose: () => void;
}

const GroupAnalyticsScreen: React.FC<GroupAnalyticsScreenProps> = ({ groupId, onClose }) => {
  const user = useUserStore((s) => s.user);
  const theme = getTheme(user?.themeColor);

  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const tasks = useTaskStore((s) => s.tasks);

  if (!group || !user) {
    return null;
  }

  const analytics = calculateGroupAnalytics(group, tasks);
  const engagementSummary = getGroupEngagementSummary(analytics);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.textSecondary + "20",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Poppins_700Bold",
              color: theme.textPrimary,
            }}
          >
            Group Analytics
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins_400Regular",
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            {group.name}
          </Text>
        </View>
        <Pressable onPress={onClose} style={{ padding: 8 }}>
          <Ionicons name="close" size={28} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Overall Stats */}
        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_600SemiBold",
              color: theme.textPrimary,
              marginBottom: 12,
            }}
          >
            {engagementSummary}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontFamily: "Poppins_700Bold",
                  color: theme.primary,
                }}
              >
                {analytics.totalMembers}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_400Regular",
                  color: theme.textSecondary,
                }}
              >
                Total Members
              </Text>
            </View>

            <View style={{ flex: 1, minWidth: 120 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontFamily: "Poppins_700Bold",
                  color: theme.secondary,
                }}
              >
                {analytics.activeMembers}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_400Regular",
                  color: theme.textSecondary,
                }}
              >
                Active (7 days)
              </Text>
            </View>

            <View style={{ flex: 1, minWidth: 120 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontFamily: "Poppins_700Bold",
                  color: theme.accentColor,
                }}
              >
                {Math.round(analytics.averageCompletionRate)}%
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_400Regular",
                  color: theme.textSecondary,
                }}
              >
                Avg Completion
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Poppins_600SemiBold",
                  color: theme.textPrimary,
                }}
              >
                {analytics.totalTasksCompleted}/{analytics.totalTasksAssigned}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_400Regular",
                  color: theme.textSecondary,
                }}
              >
                Tasks Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Top Performers */}
        {analytics.topPerformers.length > 0 && (
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Poppins_600SemiBold",
                  color: theme.textPrimary,
                  flex: 1,
                }}
              >
                🏆 Top Performers
              </Text>
            </View>

            {analytics.topPerformers.map((student, index) => (
              <View
                key={student.userId}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: index < analytics.topPerformers.length - 1 ? 1 : 0,
                  borderBottomColor: theme.textSecondary + "15",
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.primary + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Poppins_600SemiBold",
                      color: theme.primary,
                    }}
                  >
                    #{index + 1}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Poppins_600SemiBold",
                      color: theme.textPrimary,
                    }}
                  >
                    {student.username}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_400Regular",
                      color: theme.textSecondary,
                    }}
                  >
                    {student.tasksCompleted}/{student.totalTasks} tasks
                    {student.streak > 0 && ` • ${student.streak} day streak 🔥`}
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: theme.accentColor + "20",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Poppins_600SemiBold",
                      color: theme.accentColor,
                    }}
                  >
                    {Math.round(student.completionRate)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Students Who Need Help */}
        {analytics.needsHelp.length > 0 && (
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Poppins_600SemiBold",
                  color: theme.textPrimary,
                  flex: 1,
                }}
              >
                ⚠️ Needs Support
              </Text>
            </View>

            {analytics.needsHelp.map((student, index) => (
              <View
                key={student.userId}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: index < analytics.needsHelp.length - 1 ? 1 : 0,
                  borderBottomColor: theme.textSecondary + "15",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Poppins_600SemiBold",
                      color: theme.textPrimary,
                    }}
                  >
                    {student.username}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_400Regular",
                      color: theme.textSecondary,
                    }}
                  >
                    {student.tasksCompleted}/{student.totalTasks} tasks completed
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: "#FEE2E2",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Poppins_600SemiBold",
                      color: "#DC2626",
                    }}
                  >
                    {Math.round(student.completionRate)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* All Students Progress */}
        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_600SemiBold",
              color: theme.textPrimary,
              marginBottom: 16,
            }}
          >
            All Students
          </Text>

          {analytics.studentProgress.length === 0 ? (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_400Regular",
                color: theme.textSecondary,
                textAlign: "center",
                paddingVertical: 20,
              }}
            >
              No students in this group yet
            </Text>
          ) : (
            analytics.studentProgress.map((student, index) => (
              <View
                key={student.userId}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: index < analytics.studentProgress.length - 1 ? 1 : 0,
                  borderBottomColor: theme.textSecondary + "15",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontFamily: "Poppins_600SemiBold",
                      color: theme.textPrimary,
                    }}
                  >
                    {student.username}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Poppins_600SemiBold",
                      color: theme.primary,
                    }}
                  >
                    {student.tasksCompleted}/{student.totalTasks}
                  </Text>
                </View>

                <View
                  style={{
                    height: 8,
                    backgroundColor: theme.textSecondary + "20",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${student.completionRate}%`,
                      backgroundColor:
                        student.completionRate >= 80
                          ? "#10B981"
                          : student.completionRate >= 50
                          ? "#F59E0B"
                          : "#EF4444",
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_400Regular",
                      color: theme.textSecondary,
                    }}
                  >
                    {Math.round(student.completionRate)}% complete
                  </Text>
                  {student.streak > 0 && (
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins_500Medium",
                        color: theme.accentColor,
                        marginLeft: 8,
                      }}
                    >
                      🔥 {student.streak} day streak
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupAnalyticsScreen;
