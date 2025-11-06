/**
 * Group analytics and progress tracking utilities
 */

import { Group, Task, User } from "../types";

export interface StudentProgress {
  userId: string;
  username: string;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  streak: number;
  lastActive?: Date;
}

export interface GroupAnalytics {
  groupId: string;
  totalMembers: number;
  averageCompletionRate: number;
  totalTasksAssigned: number;
  totalTasksCompleted: number;
  activeMembers: number; // Members active in last 7 days
  studentProgress: StudentProgress[];
  topPerformers: StudentProgress[]; // Top 3 students
  needsHelp: StudentProgress[]; // Students with completion rate < 50%
}

/**
 * Calculate comprehensive analytics for a group
 */
export function calculateGroupAnalytics(
  group: Group,
  tasks: Task[],
  allUsers?: User[]
): GroupAnalytics {
  // Get all tasks assigned to this group
  const groupTasks = tasks.filter((task) => task.groupId === group.id);
  const totalTasksAssigned = groupTasks.length;

  // Calculate per-student progress
  const studentProgress: StudentProgress[] = group.studentIds.map((studentId) => {
    const studentTasks = groupTasks.filter((task) => task.userId === studentId);
    const completedTasks = studentTasks.filter((task) => task.status === "completed");

    const tasksCompleted = completedTasks.length;
    const totalTasks = studentTasks.length;
    const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

    // Calculate streak (consecutive days with completed tasks)
    const streak = calculateStreak(completedTasks);

    // Find last active date
    const lastActive = completedTasks.length > 0
      ? completedTasks.sort((a, b) =>
          new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
        )[0].completedAt
      : undefined;

    // Try to find username from allUsers
    const username = allUsers?.find((u) => u.id === studentId)?.username || `Student ${studentId.slice(0, 6)}`;

    return {
      userId: studentId,
      username,
      tasksCompleted,
      totalTasks,
      completionRate,
      streak,
      lastActive,
    };
  });

  // Calculate average completion rate
  const averageCompletionRate =
    studentProgress.length > 0
      ? studentProgress.reduce((sum, sp) => sum + sp.completionRate, 0) / studentProgress.length
      : 0;

  // Count total completed tasks across all students
  const totalTasksCompleted = studentProgress.reduce((sum, sp) => sum + sp.tasksCompleted, 0);

  // Count active members (active in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeMembers = studentProgress.filter(
    (sp) => sp.lastActive && new Date(sp.lastActive) > sevenDaysAgo
  ).length;

  // Get top performers (sorted by completion rate, then by total tasks completed)
  const topPerformers = [...studentProgress]
    .sort((a, b) => {
      if (b.completionRate !== a.completionRate) {
        return b.completionRate - a.completionRate;
      }
      return b.tasksCompleted - a.tasksCompleted;
    })
    .slice(0, 3);

  // Get students who need help (completion rate < 50%)
  const needsHelp = studentProgress.filter((sp) => sp.completionRate < 50 && sp.totalTasks > 0);

  return {
    groupId: group.id,
    totalMembers: group.studentIds.length,
    averageCompletionRate,
    totalTasksAssigned,
    totalTasksCompleted,
    activeMembers,
    studentProgress,
    topPerformers,
    needsHelp,
  };
}

/**
 * Calculate streak of consecutive days with completed tasks
 */
function calculateStreak(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;

  // Sort tasks by completion date (most recent first)
  const sorted = [...completedTasks].sort(
    (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );

  let streak = 1;
  let currentDate = new Date(sorted[0].completedAt!);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sorted.length; i++) {
    const taskDate = new Date(sorted[i].completedAt!);
    taskDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      streak++;
      currentDate = taskDate;
    } else if (daysDiff > 1) {
      break; // Streak broken
    }
    // If daysDiff === 0, same day, continue checking
  }

  // Check if streak is current (today or yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecentDate = new Date(sorted[0].completedAt!);
  mostRecentDate.setHours(0, 0, 0, 0);
  const daysSinceLastTask = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If last task was more than 1 day ago, streak is broken
  if (daysSinceLastTask > 1) {
    return 0;
  }

  return streak;
}

/**
 * Get engagement summary for a group
 */
export function getGroupEngagementSummary(analytics: GroupAnalytics): string {
  if (analytics.totalMembers === 0) {
    return "No members yet";
  }

  if (analytics.totalTasksAssigned === 0) {
    return "No tasks assigned yet";
  }

  const rate = Math.round(analytics.averageCompletionRate);
  const active = Math.round((analytics.activeMembers / analytics.totalMembers) * 100);

  if (rate >= 80 && active >= 70) {
    return "🔥 Excellent engagement!";
  } else if (rate >= 60 && active >= 50) {
    return "👍 Good progress";
  } else if (rate >= 40) {
    return "📚 Keep working";
  } else {
    return "⚠️ Needs attention";
  }
}
