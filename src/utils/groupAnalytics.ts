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
 * OPTIMIZATION: Single-pass algorithm (O(n) instead of O(n²))
 */
export function calculateGroupAnalytics(
  group: Group,
  tasks: Task[],
  allUsers?: User[]
): GroupAnalytics {
  // OPTIMIZATION: Use Map for O(1) user lookups
  const userMap = new Map<string, User>();
  if (allUsers) {
    allUsers.forEach(user => userMap.set(user.id, user));
  }

  // OPTIMIZATION: Single pass through tasks - group by userId
  const taskMap = new Map<string, Task[]>();
  const completedTaskMap = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    if (task.groupId === group.id) {
      // Group all tasks by userId
      if (!taskMap.has(task.userId)) {
        taskMap.set(task.userId, []);
      }
      taskMap.get(task.userId)!.push(task);
      
      // Group completed tasks separately
      if (task.status === "completed" && task.completedAt) {
        if (!completedTaskMap.has(task.userId)) {
          completedTaskMap.set(task.userId, []);
        }
        completedTaskMap.get(task.userId)!.push(task);
      }
    }
  });

  const totalTasksAssigned = Array.from(taskMap.values()).reduce((sum, tasks) => sum + tasks.length, 0);

  // OPTIMIZATION: Calculate per-student progress in single pass
  const studentProgress: StudentProgress[] = group.studentIds.map((studentId) => {
    const studentTasks = taskMap.get(studentId) || [];
    const completedTasks = completedTaskMap.get(studentId) || [];

    const tasksCompleted = completedTasks.length;
    const totalTasks = studentTasks.length;
    const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

    // Calculate streak (consecutive days with completed tasks)
    const streak = calculateStreak(completedTasks);

    // OPTIMIZATION: Find last active date without sorting (single pass)
    let lastActive: Date | undefined;
    let lastActiveTime = 0;
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const time = new Date(task.completedAt).getTime();
        if (time > lastActiveTime) {
          lastActiveTime = time;
          lastActive = task.completedAt;
        }
      }
    });

    // OPTIMIZATION: O(1) user lookup instead of O(n) find
    const user = userMap.get(studentId);
    const username = user?.username || `Student ${studentId.slice(0, 6)}`;

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
 * OPTIMIZATION: Use Set for unique dates, then sort only unique dates (not all tasks)
 */
function calculateStreak(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;

  // OPTIMIZATION: Collect unique dates in single pass, then sort only dates
  const dateSet = new Set<string>();
  let mostRecentTime = 0;
  
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const date = new Date(task.completedAt);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString();
      dateSet.add(dateStr);
      
      const time = date.getTime();
      if (time > mostRecentTime) {
        mostRecentTime = time;
      }
    }
  });

  // Sort unique dates (much smaller array than tasks)
  const sortedDates = Array.from(dateSet)
    .map(d => new Date(d).getTime())
    .sort((a, b) => b - a); // Most recent first

  if (sortedDates.length === 0) return 0;

  let streak = 1;
  let currentDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = Math.floor(
      (currentDate - sortedDates[i]) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      streak++;
      currentDate = sortedDates[i];
    } else if (daysDiff > 1) {
      break; // Streak broken
    }
    // If daysDiff === 0, same day (shouldn't happen with Set, but safe)
  }

  // Check if streak is current (today or yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceLastTask = Math.floor(
    (today.getTime() - sortedDates[0]) / (1000 * 60 * 60 * 24)
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
