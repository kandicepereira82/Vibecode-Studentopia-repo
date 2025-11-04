import { create } from "zustand";

type TimerMode = "study" | "break";

interface TimerStore {
  mode: TimerMode;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  studyDuration: number;
  breakDuration: number;

  setMode: (mode: TimerMode) => void;
  setMinutes: (minutes: number) => void;
  setSeconds: (seconds: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setStudyDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  decrementTime: () => void;
}

const useTimerStore = create<TimerStore>((set, get) => ({
  mode: "study",
  minutes: 25,
  seconds: 0,
  isRunning: false,
  studyDuration: 25,
  breakDuration: 5,

  setMode: (mode) => set({ mode }),
  setMinutes: (minutes) => set({ minutes }),
  setSeconds: (seconds) => set({ seconds }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setStudyDuration: (duration) => set({ studyDuration: duration }),
  setBreakDuration: (duration) => set({ breakDuration: duration }),

  startTimer: () => set({ isRunning: true }),

  pauseTimer: () => set({ isRunning: false }),

  stopTimer: () => {
    const state = get();
    set({
      isRunning: false,
      minutes: state.mode === "study" ? state.studyDuration : state.breakDuration,
      seconds: 0,
    });
  },

  resetTimer: () => set({
    mode: "study",
    minutes: 25,
    seconds: 0,
    isRunning: false,
    studyDuration: 25,
    breakDuration: 5,
  }),

  decrementTime: () => {
    const state = get();

    if (state.seconds > 0) {
      // Just decrement seconds
      set({ seconds: state.seconds - 1 });
    } else if (state.minutes > 0) {
      // Seconds are 0, decrement minutes and set seconds to 59
      set({ minutes: state.minutes - 1, seconds: 59 });
    }
    // If both are 0, do nothing (timer complete - handled by screens)
  },
}));

export default useTimerStore;
