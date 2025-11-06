import { format } from "date-fns";

/**
 * Daily Study Reminder Messages (20 messages for daily rotation)
 */
const DAILY_STUDY_REMINDERS = [
  "Ready to focus and grow today?",
  "A few mindful minutes can lead to amazing progress.",
  "Your Studentopia Companion believes in you — let's begin!",
  "Small steps, steady focus, big results.",
  "Take a deep breath — it's time to learn with calm and clarity.",
  "Every bit of effort today moves you closer to your goals.",
  "Your study journey starts now — one task at a time.",
  "{companionName}'s cheering you on — let's make today count!",
  "Breathe in focus, breathe out distraction.",
  "You've got this — your future self will thank you.",
  "Focus is your superpower today.",
  "Stay curious — learning something new starts with one page.",
  "Your Studentopia friend is proud of your effort.",
  "Let's make today's study time count!",
  "It's a great day to learn something inspiring.",
  "Consistency creates confidence — one session at a time.",
  "Take a deep breath, find your rhythm, and begin.",
  "You're doing better than you think — keep going!",
  "Your mind is ready. Let's study with calm focus.",
  "Learning today builds the tomorrow you imagine.",
];

/**
 * Get today's daily study reminder message
 * Rotates through 20 messages, one per day (sequentially)
 * Inserts companion name dynamically
 */
export const getDailyStudyReminder = (companionName: string = "Your Companion"): string => {
  // Get today's date to determine which message to show
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

  // Use day of year to select message (rotates through 20 messages)
  const messageIndex = dayOfYear % DAILY_STUDY_REMINDERS.length;
  let message = DAILY_STUDY_REMINDERS[messageIndex];

  // Replace {companionName} placeholder with actual companion name
  message = message.replace("{companionName}", companionName);

  return message;
};

/**
 * Get a random daily study reminder message
 * Useful for variety, but respects that only one shows per day
 */
export const getRandomDailyStudyReminder = (companionName: string = "Your Companion"): string => {
  const randomIndex = Math.floor(Math.random() * DAILY_STUDY_REMINDERS.length);
  let message = DAILY_STUDY_REMINDERS[randomIndex];

  // Replace {companionName} placeholder with actual companion name
  message = message.replace("{companionName}", companionName);

  return message;
};

/**
 * Get daily study reminder with companion name
 * This is the main function to use for displaying daily reminders
 */
export const getTodaysDailyReminder = (companionName?: string): string => {
  const name = companionName || "Your Companion";
  return getDailyStudyReminder(name);
};

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

/**
 * Get encouraging message when user has no tasks
 * Rotates through inspirational messages to encourage adding tasks
 */
export const getNoTasksMessage = (companionName: string = "Your Companion"): string => {
  const messages = [
    "Let's start your day with purpose! Add your first task to get organized.",
    "Every journey begins with a single step. What will you accomplish today?",
    "Ready to make progress? Add a task and let's get started!",
    "Great things start with small actions. Add your first goal!",
    "Your future self will thank you! Start by adding a task.",
    "Let's turn your dreams into a plan. Add what you want to achieve!",
    "The best time to start is now. What's your first task?",
    "I'm here to help you succeed! Add a task to begin your journey.",
  ];

  // Rotate messages based on day of month
  const today = new Date();
  const dayOfMonth = today.getDate();
  const messageIndex = dayOfMonth % messages.length;

  return messages[messageIndex];
};
