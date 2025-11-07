import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TaskCategory, TaskStatus } from "../types";
import useActivityFeedStore from "./activityFeedStore";
import useUserStore from "./userStore";
import useCalendarStore from "./calendarStore";
import { syncTaskWithCalendar, deleteCalendarEvent } from "../services/calendarService";

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "status">) => void;
  updateTask: (id: string, userId: string, updates: Partial<Task>) => boolean;
  deleteTask: (id: string, userId: string) => boolean;
  toggleTaskStatus: (id: string) => void;
  getTasksByDate: (date: Date, userId: string) => Task[];
  getTasksByCategory: (category: TaskCategory, userId: string) => Task[];
  getTodayTasks: (userId: string) => Task[];
  getWeekTasks: (userId: string) => Task[];
  getCompletedTasksCount: (startDate: Date, endDate: Date, userId: string) => number;
}

const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString() + Math.random().toString(36),
          createdAt: new Date(),
          status: "pending",
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        // Automatically sync to calendar if enabled
        setTimeout(async () => {
          try {
            const user = useUserStore.getState().user;
            if (!user) return;

            const connections = useCalendarStore.getState().connections;
            const userConnections = connections.filter(
              (c) => c.userId === user.id && c.syncEnabled
            );

            if (userConnections.length > 0) {
              // Sync to the first enabled connection (primary calendar)
              const primaryConnection = userConnections[0];
              const eventId = await syncTaskWithCalendar(
                newTask.id,
                newTask.title,
                newTask.description,
                newTask.dueDate,
                primaryConnection.childName,
                newTask.calendarEventId
              );

              if (eventId) {
                // Update task with calendar event ID
                set((state) => ({
                  tasks: state.tasks.map((t) =>
                    t.id === newTask.id ? { ...t, calendarEventId: eventId } : t
                  ),
                }));

                // Update last synced timestamp
                useCalendarStore.getState().updateConnection(primaryConnection.id, {
                  lastSyncedAt: new Date(),
                });
              }
            }
          } catch (error) {
            console.error("Error syncing task to calendar:", error);
          }
        }, 0);
      },
      updateTask: (id, userId, updates) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return false;

        // SECURITY: Validate task ownership
        if (task.userId !== userId) {
          console.error("Permission denied: You can only update your own tasks");
          return false;
        }

        // SECURITY: Prevent changing userId or groupId through updates
        const { userId: _, groupId: __, ...safeUpdates } = updates;

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...safeUpdates } : task,
          ),
        }));

        // Automatically sync to calendar if enabled and task details changed
        if (safeUpdates.title || safeUpdates.description || safeUpdates.dueDate) {
          setTimeout(async () => {
            try {
              const user = useUserStore.getState().user;
              if (!user) return;

              const connections = useCalendarStore.getState().connections;
              const userConnections = connections.filter(
                (c) => c.userId === user.id && c.syncEnabled
              );

              if (userConnections.length > 0) {
                const primaryConnection = userConnections[0];
                const updatedTask = get().tasks.find((t) => t.id === id);
                if (!updatedTask) return;

                const eventId = await syncTaskWithCalendar(
                  updatedTask.id,
                  updatedTask.title,
                  updatedTask.description,
                  updatedTask.dueDate,
                  primaryConnection.childName,
                  updatedTask.calendarEventId
                );

                if (eventId && !updatedTask.calendarEventId) {
                  // Update task with new calendar event ID
                  set((state) => ({
                    tasks: state.tasks.map((t) =>
                      t.id === id ? { ...t, calendarEventId: eventId } : t
                    ),
                  }));
                }

                // Update last synced timestamp
                useCalendarStore.getState().updateConnection(primaryConnection.id, {
                  lastSyncedAt: new Date(),
                });
              }
            } catch (error) {
              console.error("Error syncing updated task to calendar:", error);
            }
          }, 0);
        }

        return true;
      },
      deleteTask: (id, userId) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return false;

        // SECURITY: Validate task ownership
        if (task.userId !== userId) {
          console.error("Permission denied: You can only delete your own tasks");
          return false;
        }

        // Delete calendar event if exists
        if (task.calendarEventId) {
          setTimeout(async () => {
            try {
              await deleteCalendarEvent(task.calendarEventId!);
            } catch (error) {
              console.error("Error deleting calendar event:", error);
            }
          }, 0);
        }

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        return true;
      },
      toggleTaskStatus: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const wasCompleted = task.status === "completed";
        const willBeCompleted = !wasCompleted;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === "pending" ? "completed" : "pending",
                  completedAt: t.status === "pending" ? new Date() : undefined,
                }
              : t,
          ),
        }));

        // Add to activity feed when task is completed
        if (willBeCompleted) {
          const user = useUserStore.getState().user;
          if (user) {
            useActivityFeedStore.getState().addActivity(
              user.id,
              user.username,
              user.studyPalConfig.animal,
              "task_completed",
              `Completed task: ${task.title}`,
              { taskTitle: task.title }
            );
          }
        }
      },
      getTasksByDate: (date: Date, userId: string) => {
        const tasks = get().tasks;
        return tasks.filter((task) => {
          // SECURITY: Filter by userId (required)
          if (task.userId !== userId) return false;

          const taskDate = new Date(task.dueDate);
          return (
            taskDate.getDate() === date.getDate() &&
            taskDate.getMonth() === date.getMonth() &&
            taskDate.getFullYear() === date.getFullYear()
          );
        });
      },
      getTasksByCategory: (category: TaskCategory, userId: string) => {
        return get().tasks.filter((task) => {
          // SECURITY: Filter by userId (required)
          if (task.userId !== userId) return false;
          return task.category === category;
        });
      },
      getTodayTasks: (userId: string) => {
        const today = new Date();
        return get().getTasksByDate(today, userId);
      },
      getWeekTasks: (userId: string) => {
        const tasks = get().tasks;
        const today = new Date();
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);

        return tasks.filter((task) => {
          // SECURITY: Filter by userId (required)
          if (task.userId !== userId) return false;

          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate <= weekFromNow;
        });
      },
      getCompletedTasksCount: (startDate: Date, endDate: Date, userId: string) => {
        const tasks = get().tasks;
        return tasks.filter((task) => {
          if (task.status !== "completed" || !task.completedAt) return false;

          // SECURITY: Filter by userId (required)
          if (task.userId !== userId) return false;

          const completedDate = new Date(task.completedAt);
          return completedDate >= startDate && completedDate <= endDate;
        }).length;
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useTaskStore;
