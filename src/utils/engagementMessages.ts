import { format } from "date-fns";

/**
 * Get time-based greeting based on current hour
 */
export const getTimeBasedGreeting = (username: string, hour: number = new Date().getHours()): string => {
  if (hour >= 5 && hour < 12) {
    return `Good morning, ${username}!`;
  } else if (hour >= 12 && hour < 17) {
    return `Good afternoon, ${username}!`;
  } else if (hour >= 17 && hour < 21) {
    return `Good evening, ${username}!`;
  } else {
    return `Great work today, ${username}!`;
  }
};

/**
 * Get random motivational sub-message to accompany greeting
 */
export const getGreetingSubMessage = (): string => {
  const messages = [
    "Let's make today productive!",
    "Ready to tackle your goals?",
    "You've got this!",
    "Every small step counts.",
    "Let's create something amazing today.",
    "Time to shine!",
    "Your future self will thank you.",
    "Let's make progress together.",
    "Believe in yourself today.",
    "One task at a time, one day at a time.",
    "Stay focused and keep going!",
    "You're capable of great things.",
    "Let's turn plans into action!",
    "Progress over perfection.",
    "Today is full of possibilities!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get task reminder message based on task count and status
 */
export const getTaskReminderMessage = (
  todayTasksCount: number,
  completedCount: number,
  studyPalName: string
): string | null => {
  const pendingCount = todayTasksCount - completedCount;

  if (todayTasksCount === 0) {
    return `No tasks for today yet. Let's add your goals!`;
  }

  if (pendingCount === 0 && todayTasksCount > 0) {
    return `Amazing! You've completed all ${todayTasksCount} tasks today! 🎉`;
  }

  if (pendingCount === 1) {
    return `You have 1 task due today — ready to start?`;
  }

  if (pendingCount > 1) {
    return `You have ${pendingCount} tasks due today — let's do this!`;
  }

  return null;
};

/**
 * Get weekly task prompt when no tasks are scheduled
 */
export const getWeeklyTaskPrompt = (
  weekTasksCount: number,
  studyPalName: string
): string | null => {
  if (weekTasksCount === 0) {
    return `Let's plan your week! Add some goals to get started.`;
  }

  if (weekTasksCount < 3) {
    return `You have ${weekTasksCount} task${weekTasksCount === 1 ? "" : "s"} this week. Want to add more?`;
  }

  return null;
};

/**
 * Get encouragement message based on completion rate
 */
export const getEncouragementMessage = (
  completionRate: number,
  studyPalName: string
): string | null => {
  if (completionRate === 100) {
    return `Perfect! You're on fire today! 🔥`;
  }

  if (completionRate >= 75) {
    return `Great progress! Keep it up!`;
  }

  if (completionRate >= 50) {
    return `You're halfway there! Keep going!`;
  }

  if (completionRate >= 25) {
    return `Good start! You've got momentum!`;
  }

  if (completionRate > 0) {
    return `Every step forward counts!`;
  }

  return null;
};

/**
 * Get motivational message for empty task list
 */
export const getEmptyTaskMessage = (timeOfDay: "morning" | "afternoon" | "evening" | "night"): string => {
  const messages = {
    morning: "Start your day by adding your first task!",
    afternoon: "It's not too late to plan your day!",
    evening: "Plan tomorrow's tasks tonight for a great start!",
    night: "Set yourself up for success — add tomorrow's goals!",
  };
  return messages[timeOfDay];
};

/**
 * Get time of day category
 */
export const getTimeOfDay = (hour: number = new Date().getHours()): "morning" | "afternoon" | "evening" | "night" => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

/**
 * Get study time reminder message based on hour of day with growth mindset
 */
export const getStudyTimeMessage = (hour: number = new Date().getHours()): string => {
  const growthMindsetMessages = {
    morning: [
      "Good morning! Every study session grows your skills 🌱",
      "Good morning! Challenges today = Growth tomorrow 🚀",
      "Good morning! Your effort is building your success 💪",
      "Good morning! Ready to learn something new today? 🧠",
      "Good morning! Progress over perfection. Let's study! 📈",
    ],
    afternoon: [
      "Good afternoon! Keep pushing—you're building expertise 🎯",
      "Good afternoon! Embrace the challenge, grow your abilities 💡",
      "Good afternoon! Your brain thrives on focused effort 🧠",
      "Good afternoon! Every problem you solve makes you stronger 💪",
      "Good afternoon! Keep learning, keep growing! 🌱",
    ],
    evening: [
      "Good evening! End strong—your effort creates lasting growth 🌟",
      "Good evening! Study now, celebrate progress later! 🎉",
      "Good evening! Dedication today = Mastery tomorrow 📚",
      "Good evening! You're developing new abilities right now 🚀",
      "Good evening! Progress is progress, no matter the pace 📈",
    ],
    night: [
      "Good night! Rest well—your brain is consolidating today's learning 🧠✨",
      "Good night! You grew today. Sleep well, future expert! 🌙",
      "Good night! Recovery is part of growth—sweet dreams! 💤",
      "Good night! Proud of your effort today 🌙⭐",
      "Good night! Rest up for tomorrow's growth journey 🌱💤",
    ],
  };

  let timeOfDay = "night";
  if (hour >= 5 && hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = "afternoon";
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = "evening";
  }

  const messages = growthMindsetMessages[timeOfDay as keyof typeof growthMindsetMessages];
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get study time reminder message based on 12-hour format with AM/PM
 */
export const getStudyTimeMessage12Hour = (hour12: number, period: "AM" | "PM"): string => {
  // Convert to 24-hour format first
  let hour24 = hour12;
  if (period === "AM" && hour12 === 12) {
    hour24 = 0;
  } else if (period === "PM" && hour12 !== 12) {
    hour24 = hour12 + 12;
  }

  return getStudyTimeMessage(hour24);
};

/**
 * Get study session encouragement
 */
export const getStudySessionMessage = (minutesStudiedToday: number): string | null => {
  if (minutesStudiedToday === 0) {
    return "Ready to start your first study session?";
  }

  if (minutesStudiedToday < 25) {
    return `Great start! You've studied for ${minutesStudiedToday} minutes today.`;
  }

  if (minutesStudiedToday < 60) {
    return `Awesome! ${minutesStudiedToday} minutes of focused work!`;
  }

  if (minutesStudiedToday >= 60) {
    const hours = Math.floor(minutesStudiedToday / 60);
    const mins = minutesStudiedToday % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    return `Incredible! ${timeStr} of focused study today! 🌟`;
  }

  return null;
};
