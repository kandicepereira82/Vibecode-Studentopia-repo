import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import StudyPal from "../components/StudyPal";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import useStatsStore from "../state/statsStore";
import { useTranslation } from "../utils/translations";
import { getRandomQuote, getRandomTip } from "../utils/content";
import { getTheme } from "../utils/themes";
import { MotivationalQuote, StudyTip, Task } from "../types";
import { cn } from "../utils/cn";

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const getTodayTasks = useTaskStore((s) => s.getTodayTasks);
  const getWeekTasks = useTaskStore((s) => s.getWeekTasks);
  const toggleTaskStatus = useTaskStore((s) => s.toggleTaskStatus);
  const stats = useStatsStore((s) => s.stats);

  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [tip, setTip] = useState<StudyTip | null>(null);

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  useEffect(() => {
    if (user) {
      setQuote(getRandomQuote(user.language));
      setTip(getRandomTip(user.language));
    }
    console.log("[HomeScreen] Rendered. User:", user ? "exists" : "null");
  }, [user]);

  if (!user) {
    console.log("[HomeScreen] No user - showing fallback");
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>
            Welcome to StudyPal
          </Text>
          <Text className="text-center" style={{ color: theme.textSecondary }}>
            Please set up your profile to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("[HomeScreen] User valid - rendering main content");

  const todayTasks = getTodayTasks();
  const weekTasks = getWeekTasks();
  const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
  const weekCompleted = weekTasks.filter((t) => t.status === "completed").length;

  const todayProgress = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;
  const weekProgress = weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0;

  const upcomingTasks = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Poppins */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
          <Text style={{
            fontSize: 32,
            fontFamily: 'Poppins_700Bold',
            color: theme.textPrimary,
            marginBottom: 4
          }}>
            StudyPal
          </Text>
          <Text style={{
            fontSize: 16,
            fontFamily: 'Poppins_400Regular',
            color: theme.textSecondary
          }}>
            {t("welcomeBack")}, {user.username}! 👋
          </Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          {/* Today's Inspiration with soft shadow */}
          {quote && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons name="sparkles" size={20} color={theme.primary} />
                </View>
                <Text style={{
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.textPrimary
                }}>
                  {"Today's Inspiration"}
                </Text>
              </View>
              <Text style={{
                fontSize: 16,
                fontFamily: 'Poppins_400Regular',
                fontStyle: 'italic',
                color: theme.textPrimary,
                lineHeight: 24,
                marginBottom: 12
              }}>
                &ldquo;{quote.text}&rdquo;
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Poppins_500Medium',
                color: theme.textSecondary
              }}>
                — {quote.author}
              </Text>
            </View>
          )}

          {/* Main Content Row with softer cards */}
          <View className="flex-row gap-4 mb-4">
            {/* Left Column - Tasks */}
            <View className="flex-1">
              {/* Your Tasks */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2
              }}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.primary + '15',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ionicons name="checkbox-outline" size={18} style={{ color: theme.primary }} />
                    </View>
                    <Text style={{
                      marginLeft: 10,
                      fontSize: 16,
                      fontFamily: 'Poppins_600SemiBold',
                      color: theme.textPrimary
                    }}>
                      Your Tasks
                    </Text>
                  </View>
                  <Pressable onPress={() => navigation.navigate("Tasks" as never)}>
                    <Text style={{
                      fontSize: 13,
                      fontFamily: 'Poppins_500Medium',
                      color: theme.primary
                    }}>
                      All Tasks
                    </Text>
                  </Pressable>
                </View>

                {todayTasks.length === 0 ? (
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'Poppins_400Regular',
                    color: theme.textSecondary,
                    textAlign: 'center',
                    paddingVertical: 16
                  }}>
                    No tasks due today
                  </Text>
                ) : (
                  todayTasks.slice(0, 3).map((task) => (
                    <Pressable
                      key={task.id}
                      onPress={() => toggleTaskStatus(task.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F3F4F6'
                      }}
                    >
                      <Ionicons
                        name={task.status === "completed" ? "checkmark-circle" : "ellipse-outline"}
                        size={24}
                        style={{ color: task.status === "completed" ? theme.secondary : theme.textSecondary, marginRight: 12, marginTop: 2 }}
                      />
                      <View className="flex-1">
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: 'Poppins_500Medium',
                            color: theme.textPrimary,
                            textDecorationLine: task.status === "completed" ? 'line-through' : 'none'
                          }}
                        >
                          {task.title}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          fontFamily: 'Poppins_400Regular',
                          color: theme.textSecondary,
                          marginTop: 4,
                          textTransform: 'capitalize'
                        }}>
                          {task.category}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>

              {/* Upcoming Tasks */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.primary + '15',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="calendar-outline" size={18} style={{ color: theme.primary }} />
                  </View>
                  <Text style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: 'Poppins_600SemiBold',
                    color: theme.textPrimary
                  }}>
                    Upcoming Tasks
                  </Text>
                </View>

                {upcomingTasks.length === 0 ? (
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'Poppins_400Regular',
                    color: theme.textSecondary,
                    textAlign: 'center',
                    paddingVertical: 16
                  }}>
                    No upcoming tasks
                  </Text>
                ) : (
                  upcomingTasks.map((task) => (
                    <View key={task.id} style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F3F4F6'
                    }}>
                      <Text style={{
                        fontSize: 15,
                        fontFamily: 'Poppins_500Medium',
                        color: theme.textPrimary
                      }}>
                        {task.title}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        fontFamily: 'Poppins_400Regular',
                        color: theme.textSecondary,
                        marginTop: 4
                      }}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Right Column - Study Pal & Goals */}
            <View className="w-[35%]">
              {/* Study Pal */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.primary + '10',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12
                }}>
                  <StudyPal
                    animal={user.studyPalConfig.animal}
                    name={user.studyPalConfig.name}
                    animationsEnabled={user.studyPalConfig.animationsEnabled}
                    size={50}
                  />
                </View>
                <Text style={{
                  fontSize: 15,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.textPrimary,
                  textAlign: 'center'
                }}>
                  {user.studyPalConfig.name}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Poppins_400Regular',
                  color: theme.textSecondary,
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  Take a deep breath... 🌸
                </Text>
              </View>

              {/* Daily Goal */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: theme.primary + '15',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="flag" size={14} style={{ color: theme.primary }} />
                  </View>
                  <Text style={{
                    marginLeft: 10,
                    fontSize: 14,
                    fontFamily: 'Poppins_600SemiBold',
                    color: theme.textPrimary
                  }}>
                    Daily Goal
                  </Text>
                </View>
                <Text style={{
                  fontSize: 28,
                  fontFamily: 'Poppins_700Bold',
                  color: theme.primary,
                  textAlign: 'center'
                }}>
                  {todayCompleted}/{todayTasks.length}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Poppins_400Regular',
                  color: theme.textSecondary,
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  tasks completed
                </Text>
                <View style={{
                  marginTop: 12,
                  height: 8,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${todayProgress}%`,
                      backgroundColor: theme.primary,
                      borderRadius: 4
                    }}
                  />
                </View>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.primary,
                  textAlign: 'center',
                  marginTop: 8
                }}>
                  {Math.round(todayProgress)}%
                </Text>
              </View>

              {/* Weekly Goal */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: theme.secondary + '15',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="trophy" size={14} style={{ color: theme.secondary }} />
                  </View>
                  <Text style={{
                    marginLeft: 10,
                    fontSize: 14,
                    fontFamily: 'Poppins_600SemiBold',
                    color: theme.textPrimary
                  }}>
                    Weekly Goal
                  </Text>
                </View>
                <Text style={{
                  fontSize: 28,
                  fontFamily: 'Poppins_700Bold',
                  color: theme.secondary,
                  textAlign: 'center'
                }}>
                  {weekCompleted}/{weekTasks.length}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Poppins_400Regular',
                  color: theme.textSecondary,
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  tasks completed
                </Text>
                <View style={{
                  marginTop: 12,
                  height: 8,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${weekProgress}%`,
                      backgroundColor: theme.secondary,
                      borderRadius: 4
                    }}
                  />
                </View>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.secondary,
                  textAlign: 'center',
                  marginTop: 8
                }}>
                  {Math.round(weekProgress)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Today's Progress Card */}
          <LinearGradient
            colors={theme.progressGradient as [string, string]}
            style={{
              borderRadius: 24,
              padding: 24,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 4
            }}
          >
            <Text style={{
              fontSize: 20,
              fontFamily: 'Poppins_700Bold',
              color: 'white',
              marginBottom: 16
            }}>
              {"Today's Progress"}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{
                  fontSize: 14,
                  fontFamily: 'Poppins_400Regular',
                  color: 'white',
                  opacity: 0.9
                }}>
                  Completed Tasks
                </Text>
                <Text style={{
                  fontSize: 48,
                  fontFamily: 'Poppins_700Bold',
                  color: 'white',
                  marginTop: 8
                }}>
                  {todayCompleted}/{todayTasks.length > 0 ? todayTasks.length : "2"}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{
                  fontSize: 56,
                  fontFamily: 'Poppins_700Bold',
                  color: 'white',
                  opacity: 0.9
                }}>
                  {Math.round(todayProgress)}%
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Study Tip */}
          {tip && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.accentColor + '15',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons name="bulb" size={20} style={{ color: theme.accentColor }} />
                </View>
                <Text style={{
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.textPrimary
                }}>
                  Study Tip
                </Text>
              </View>
              <Text style={{
                fontSize: 17,
                fontFamily: 'Poppins_600SemiBold',
                color: theme.textPrimary,
                marginBottom: 8
              }}>
                {tip.title}
              </Text>
              <Text style={{
                fontSize: 15,
                fontFamily: 'Poppins_400Regular',
                color: theme.textSecondary,
                lineHeight: 22
              }}>
                {tip.description}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
