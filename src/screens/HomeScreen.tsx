import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { startOfWeek, addDays, format, isSameDay, isToday } from "date-fns";
import StudyPal from "../components/StudyPal";
import ClickableCompanion from "../components/ClickableCompanion";
import OfflineIndicator from "../components/OfflineIndicator";
import useUserStore from "../state/userStore";
import useTaskStore from "../state/taskStore";
import useStatsStore from "../state/statsStore";
import useTimerStore from "../state/timerStore";
import useConnectivityStore from "../state/connectivityStore";
import { useTranslation } from "../utils/translations";
import { getRandomQuote, getRandomTip } from "../utils/content";
import { getTheme } from "../utils/themes";
import { MotivationalQuote, StudyTip, Task } from "../types";
import { cn } from "../utils/cn";
import {
  getTimeBasedGreeting,
  getGreetingSubMessage,
  getTaskReminderMessage,
  getWeeklyTaskPrompt,
  getEncouragementMessage,
  getTimeOfDay,
  getTodaysDailyReminder,
  getNoTasksMessage,
} from "../utils/engagementMessages";

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  // OPTIMIZATION: Don't subscribe to entire tasks array - use selectors instead
  const getTodayTasks = useTaskStore((s) => s.getTodayTasks);
  const getWeekTasks = useTaskStore((s) => s.getWeekTasks);
  const toggleTaskStatus = useTaskStore((s) => s.toggleTaskStatus);
  const stats = useStatsStore((s) => s.stats);
  const addStudyMinutes = useStatsStore((s) => s.addStudyMinutes);
  
  // Memoize today's tasks to prevent unnecessary recalculations
  const todayTasks = useMemo(() => {
    if (!user?.id) return [];
    return getTodayTasks(user.id);
  }, [user?.id, getTodayTasks]);
  
  // Memoize week tasks
  const weekTasks = useMemo(() => {
    if (!user?.id) return [];
    return getWeekTasks(user.id);
  }, [user?.id, getWeekTasks]);

  // Timer store
  const timerMinutes = useTimerStore((s) => s.minutes);
  const timerSeconds = useTimerStore((s) => s.seconds);
  const isTimerRunning = useTimerStore((s) => s.isRunning);
  const timerMode = useTimerStore((s) => s.mode);
  const studyDuration = useTimerStore((s) => s.studyDuration);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const setMode = useTimerStore((s) => s.setMode);
  const setMinutes = useTimerStore((s) => s.setMinutes);
  const setSeconds = useTimerStore((s) => s.setSeconds);

  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [tip, setTip] = useState<StudyTip | null>(null);
  const [selectedWeekDate, setSelectedWeekDate] = useState(new Date());

  const { t } = useTranslation(user?.language || "en");
  const theme = getTheme(user?.themeColor);

  useEffect(() => {
    if (user) {
      setQuote(getRandomQuote(user.language));
      setTip(getRandomTip(user.language));
    }
  }, [user]);

  // Watch for timer completion
  useEffect(() => {
    if (timerMinutes === 0 && timerSeconds === 0 && !isTimerRunning && timerMode === "study") {
      // Timer just completed
      addStudyMinutes(studyDuration);
      // Reset for next session
      setMode("study");
      setMinutes(studyDuration);
      setSeconds(0);
    }
  }, [timerMinutes, timerSeconds, isTimerRunning, timerMode, studyDuration, addStudyMinutes, setMode, setMinutes, setSeconds]);

  // OPTIMIZATION: Memoize task filtering function
  const getTasksForDate = useCallback((date: Date) => {
    if (!user?.id) return [];
    const getTasksByDate = useTaskStore.getState().getTasksByDate;
    return getTasksByDate(date, user.id);
  }, [user?.id]);

  // OPTIMIZATION: Memoize week calendar data
  const { weekStart, weekDays } = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return { weekStart: start, weekDays: days };
  }, []); // Only recalculate once per day

  if (!user) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.backgroundGradient[0] }}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>
            Welcome to Studentopia
          </Text>
          <Text className="text-center" style={{ color: theme.textSecondary }}>
            Please set up your profile to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // OPTIMIZATION: Use memoized tasks instead of recalculating
  const todayCompleted = useMemo(() => 
    todayTasks.filter((t) => t.status === "completed").length,
    [todayTasks]
  );
  const weekCompleted = useMemo(() => 
    weekTasks.filter((t) => t.status === "completed").length,
    [weekTasks]
  );

  const todayProgress = useMemo(() => 
    todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0,
    [todayTasks.length, todayCompleted]
  );
  const weekProgress = useMemo(() => 
    weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0,
    [weekTasks.length, weekCompleted]
  );

  // OPTIMIZATION: Get upcoming tasks using store method instead of filtering entire array
  const upcomingTasks = useMemo(() => {
    if (!user?.id) return [];
    return weekTasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return taskDate >= today && task.status === "pending";
    }).slice(0, 5);
  }, [weekTasks, user?.id]);
    .filter((t) => t.status === "pending" && t.userId === user?.id)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Extract first name from username
  const firstName = user.username.split(" ")[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundGradient[0] }}>
      <OfflineIndicator position="top" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Time-Based Greeting */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 32,
              fontFamily: 'Poppins_700Bold',
              color: theme.textPrimary,
              marginBottom: 4
            }}>
              {getTimeBasedGreeting(firstName)}
            </Text>
            <Text style={{
              fontSize: 16,
              fontFamily: 'Poppins_400Regular',
              color: theme.textSecondary
            }}>
              {getGreetingSubMessage()}
            </Text>
          </View>
          <ClickableCompanion
            animal={user.studyPalConfig.animal}
            name={user.studyPalConfig.name}
            animationsEnabled={false}
            size={50}
            showName={false}
            showMessage={false}
            customAvatar={user.studyPalConfig.avatar}
          />
        </View>

        {/* Daily Study Reminder Card */}
        <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: theme.primary + "12",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.primary + "30",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="sparkles" size={18} color={theme.primary} style={{ marginRight: 8 }} />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_600SemiBold",
                  color: theme.primary,
                }}
              >
                Today&rsquo;s Motivation
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_500Medium",
                color: theme.textPrimary,
                lineHeight: 20,
              }}
            >
              {getTodaysDailyReminder(user.studyPalConfig.name)}
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          {/* Studentopia Companion Welcome Message Card */}
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ marginRight: 16, marginTop: 4 }}>
                <StudyPal
                  animal={user.studyPalConfig.animal}
                  name={user.studyPalConfig.name}
                  animationsEnabled={false}
                  size={55}
                  showName={false}
                  showMessage={false}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 15,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.primary,
                  marginBottom: 8
                }}>
                  {user.studyPalConfig.name} says:
                </Text>
                {(() => {
                  // OPTIMIZATION: Use memoized weekTasks instead of filtering entire array
                  const hasNoTasks = weekTasks.length === 0 && todayTasks.length === 0;

                  // If no tasks exist, show encouraging message to add first task
                  if (hasNoTasks) {
                    return (
                      <Text style={{
                        fontSize: 15,
                        fontFamily: 'Poppins_500Medium',
                        color: theme.textPrimary,
                        lineHeight: 22,
                        marginBottom: 8
                      }}>
                        {getNoTasksMessage(user.studyPalConfig.name)}
                      </Text>
                    );
                  }

                  // Otherwise, show normal messages
                  const taskReminder = getTaskReminderMessage(todayTasks.length, todayCompleted, user.studyPalConfig.name);
                  const weeklyPrompt = getWeeklyTaskPrompt(weekTasks.length, user.studyPalConfig.name);
                  const encouragement = getEncouragementMessage(todayProgress, user.studyPalConfig.name);

                  return (
                    <>
                      {taskReminder && (
                        <Text style={{
                          fontSize: 15,
                          fontFamily: 'Poppins_500Medium',
                          color: theme.textPrimary,
                          lineHeight: 22,
                          marginBottom: 8
                        }}>
                          {taskReminder}
                        </Text>
                      )}
                      {!taskReminder && weeklyPrompt && (
                        <Text style={{
                          fontSize: 15,
                          fontFamily: 'Poppins_500Medium',
                          color: theme.textPrimary,
                          lineHeight: 22,
                          marginBottom: 8
                        }}>
                          {weeklyPrompt}
                        </Text>
                      )}
                      {encouragement && todayTasks.length > 0 && (
                        <Text style={{
                          fontSize: 14,
                          fontFamily: 'Poppins_400Regular',
                          color: theme.textSecondary,
                          fontStyle: 'italic'
                        }}>
                          {encouragement}
                        </Text>
                      )}
                      {todayTasks.length === 0 && weekTasks.length === 0 && (
                        <Text style={{
                          fontSize: 15,
                          fontFamily: 'Poppins_500Medium',
                          color: theme.textPrimary,
                          lineHeight: 22,
                          marginBottom: 4
                        }}>
                          {"Ready to get started? Let's add some tasks and make today productive!"}
                        </Text>
                      )}
                    </>
                  );
                })()}
              </View>
            </View>
          </View>

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
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                <View style={{ marginRight: 16 }}>
                  <StudyPal
                    animal={user.studyPalConfig.animal}
                    name={user.studyPalConfig.name}
                    animationsEnabled={false}
                    size={40}
                    showName={false}
                    showMessage={false}
                  />
                </View>
                <View style={{ flex: 1 }}>
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
              </View>
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
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Text style={{
                      fontSize: 14,
                      fontFamily: 'Poppins_500Medium',
                      color: theme.textSecondary,
                      textAlign: 'center',
                      marginBottom: 12
                    }}>
                      No tasks due today
                    </Text>
                    <Pressable
                      onPress={() => navigation.navigate("Tasks" as never)}
                      style={{
                        backgroundColor: theme.primary,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 12
                      }}
                    >
                      <Text style={{
                        fontSize: 13,
                        fontFamily: 'Poppins_600SemiBold',
                        color: 'white'
                      }}>
                        + Add Task
                      </Text>
                    </Pressable>
                  </View>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <Text style={{
                            fontSize: 12,
                            fontFamily: 'Poppins_400Regular',
                            color: theme.textSecondary,
                            textTransform: 'capitalize'
                          }}>
                            {task.category}
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            fontFamily: 'Poppins_400Regular',
                            color: theme.textSecondary,
                            marginLeft: 8
                          }}>
                            • {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{
                          fontSize: 12,
                          fontFamily: 'Poppins_400Regular',
                          color: theme.textSecondary
                        }}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          fontFamily: 'Poppins_400Regular',
                          color: theme.textSecondary,
                          marginLeft: 8
                        }}>
                          • {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Week Calendar View */}
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
                    backgroundColor: theme.secondary + '15',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="calendar" size={18} style={{ color: theme.secondary }} />
                  </View>
                  <Text style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: 'Poppins_600SemiBold',
                    color: theme.textPrimary
                  }}>
                    This Week
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {weekDays.map((day, index) => {
                    const dayTasks = getTasksForDate(day);
                    const hasTasks = dayTasks.length > 0;
                    const isSelectedDay = isSameDay(day, selectedWeekDate);
                    const isTodayDate = isToday(day);

                    return (
                      <Pressable
                        key={index}
                        onPress={() => setSelectedWeekDate(day)}
                        style={{
                          alignItems: 'center',
                          padding: 8,
                          borderRadius: 12,
                          backgroundColor: isSelectedDay ? theme.secondary + '20' : 'transparent',
                          minWidth: 40
                        }}
                      >
                        <Text style={{
                          fontSize: 11,
                          fontFamily: 'Poppins_500Medium',
                          color: theme.textSecondary,
                          marginBottom: 4
                        }}>
                          {format(day, 'EEE')}
                        </Text>
                        <View style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: isTodayDate ? theme.secondary : (isSelectedDay ? theme.secondary + '40' : '#F3F4F6'),
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 4
                        }}>
                          <Text style={{
                            fontSize: 14,
                            fontFamily: 'Poppins_600SemiBold',
                            color: isTodayDate ? 'white' : theme.textPrimary
                          }}>
                            {format(day, 'd')}
                          </Text>
                        </View>
                        {hasTasks && (
                          <View style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: theme.accentColor
                          }} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Right Column - Studentopia Companion & Goals */}
            <View className="w-[35%]">
              {/* Studentopia Companion */}
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
                  marginBottom: 16
                }}>
                  <StudyPal
                    animal={user.studyPalConfig.animal}
                    name={user.studyPalConfig.name}
                    animationsEnabled={false}
                    size={50}
                    showName={false}
                    showMessage={false}
                  />
                </View>
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Poppins_600SemiBold',
                  color: theme.textPrimary,
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  {user.studyPalConfig.name}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Poppins_400Regular',
                  color: theme.textSecondary,
                  textAlign: 'center'
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

          {/* Quick Timer Section */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 24,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
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
                <Ionicons name="timer" size={20} color={theme.primary} />
              </View>
              <Text style={{
                marginLeft: 12,
                fontSize: 18,
                fontFamily: 'Poppins_600SemiBold',
                color: theme.textPrimary
              }}>
                Quick Timer
              </Text>
            </View>

            {/* Timer Display with Studentopia Companion */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ marginBottom: 12 }}>
                <StudyPal
                  animal={user.studyPalConfig.animal}
                  name={user.studyPalConfig.name}
                  animationsEnabled={false}
                  size={50}
                  showName={false}
                  showMessage={false}
                />
              </View>
              <View style={{
                backgroundColor: theme.primary + '10',
                borderRadius: 20,
                paddingVertical: 20,
                paddingHorizontal: 50,
                marginBottom: 16,
                minWidth: 200
              }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  style={{
                    fontSize: 48,
                    fontFamily: 'Poppins_700Bold',
                    color: theme.primary,
                    letterSpacing: 2,
                    textAlign: 'center'
                  }}>
                  {`${String(timerMinutes).padStart(2, "0")}:${String(timerSeconds).padStart(2, "0")}`}
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Poppins_400Regular',
                color: theme.textSecondary,
                textAlign: 'center'
              }}>
                {isTimerRunning ? "Focus time! 🎯" : "Ready to study?"}
              </Text>
            </View>

            {/* Timer Controls */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              {!isTimerRunning ? (
                <Pressable
                  onPress={startTimer}
                  style={{
                    width: 140,
                    height: 56,
                    borderRadius: 16,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 3
                  }}
                >
                  <LinearGradient
                    colors={[theme.primary, theme.primaryDark]}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <Ionicons name="play" size={24} color="white" />
                    <Text style={{
                      color: 'white',
                      fontSize: 16,
                      fontFamily: 'Poppins_600SemiBold'
                    }}>
                      {(timerMinutes !== studyDuration || timerSeconds !== 0) && timerMode === "study" ? "Resume" : "Start"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={pauseTimer}
                    style={{
                      width: 140,
                      height: 56,
                      borderRadius: 16,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 3
                    }}
                  >
                    <LinearGradient
                      colors={[theme.secondary, theme.secondaryDark]}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <Ionicons name="pause" size={24} color="white" />
                      <Text style={{
                        color: 'white',
                        fontSize: 16,
                        fontFamily: 'Poppins_600SemiBold'
                      }}>
                        Pause
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    onPress={stopTimer}
                    style={{
                      width: 140,
                      height: 56,
                      borderRadius: 16,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 3
                    }}
                  >
                    <LinearGradient
                      colors={[theme.accentColor, theme.accentColor]}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <Ionicons name="stop" size={24} color="white" />
                      <Text style={{
                        color: 'white',
                        fontSize: 16,
                        fontFamily: 'Poppins_600SemiBold'
                      }}>
                        Stop
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </>
              )}
            </View>

            {/* Quick Link to Full Timer */}
            <Pressable
              onPress={() => navigation.navigate("Timer" as never)}
              style={{
                marginTop: 16,
                paddingVertical: 10,
                alignItems: 'center'
              }}
            >
              <Text style={{
                fontSize: 13,
                fontFamily: 'Poppins_500Medium',
                color: theme.primary
              }}>
                Go to Full Timer →
              </Text>
            </Pressable>
          </View>

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
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ marginRight: 16 }}>
                  <StudyPal
                    animal={user.studyPalConfig.animal}
                    name={user.studyPalConfig.name}
                    animationsEnabled={false}
                    size={40}
                    showName={false}
                    showMessage={false}
                  />
                </View>
                <View style={{ flex: 1 }}>
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
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
