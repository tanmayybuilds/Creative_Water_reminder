import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { BreakReminderState, TimerStatus } from "./types";
import { dispatchBreakEvent } from "./reminderEvents";
import { triggerBreakNotification } from "./notificationService";

interface BreakReminderActions {
  startTimer: (minutes?: number) => void;
  tick: () => void;
  triggerBreak: () => void;
  acceptBreak: () => void;
  dismissBreak: () => void;
  resetTimer: () => void;
  stopTimer: () => void;
  setIntervalMinutes: (minutes: number) => void;
  testBreakNow: () => void;
  resyncFromSleep: () => void;
}

export type BreakReminderStore = BreakReminderState & BreakReminderActions;

const DEFAULT_INTERVAL_MINUTES = 30;

// Safe storage fallback for environments without window.localStorage (Node/tests)
const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const getSafeStorage = (): StateStorage => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return memoryStorage;
};

export const useBreakReminderStore = create<BreakReminderStore>()(
  persist(
    (set, get) => ({
      // State
      status: "IDLE" as TimerStatus,
      intervalMinutes: DEFAULT_INTERVAL_MINUTES,
      startedAt: null,
      targetEndTime: null,
      remainingSeconds: DEFAULT_INTERVAL_MINUTES * 60,
      consecutiveDismissals: 0,
      totalDismissals: 0,
      breaksAccepted: 0,

      // Actions
      startTimer: (minutes?: number) => {
        const interval = minutes || get().intervalMinutes;
        const now = Date.now();
        const targetEndTime = now + interval * 60 * 1000;
        const remainingSeconds = interval * 60;

        set({
          status: "RUNNING",
          intervalMinutes: interval,
          startedAt: now,
          targetEndTime,
          remainingSeconds,
        });

        dispatchBreakEvent("BREAK_STARTED", {
          intervalMinutes: interval,
          consecutiveDismissals: get().consecutiveDismissals,
          totalDismissals: get().totalDismissals,
          breaksAccepted: get().breaksAccepted,
        });
      },

      tick: () => {
        const { status, targetEndTime } = get();
        if (status !== "RUNNING" || !targetEndTime) return;

        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

        if (remainingSeconds <= 0) {
          get().triggerBreak();
        } else {
          set({ remainingSeconds });
        }
      },

      triggerBreak: () => {
        const { status, intervalMinutes, consecutiveDismissals, totalDismissals, breaksAccepted } =
          get();

        // Single-fire guard
        if (status === "BREAK_TRIGGERED") return;

        set({
          status: "BREAK_TRIGGERED",
          remainingSeconds: 0,
        });

        // Trigger native notification
        triggerBreakNotification({
          title: "LOCKIN — Time for a break",
          body: "Step away from the screen and take a short break.",
        });

        // Emit typed break event
        dispatchBreakEvent("BREAK_TRIGGERED", {
          intervalMinutes,
          consecutiveDismissals,
          totalDismissals,
          breaksAccepted,
        });
      },

      acceptBreak: () => {
        const { intervalMinutes, consecutiveDismissals, totalDismissals, breaksAccepted } = get();

        const updatedBreaksAccepted = breaksAccepted + 1;
        const updatedConsecutiveDismissals = 0;

        dispatchBreakEvent("BREAK_ACCEPTED", {
          intervalMinutes,
          consecutiveDismissals: updatedConsecutiveDismissals,
          totalDismissals,
          breaksAccepted: updatedBreaksAccepted,
        });

        // Reset and start next recurring interval immediately
        const now = Date.now();
        const targetEndTime = now + intervalMinutes * 60 * 1000;

        set({
          status: "RUNNING",
          startedAt: now,
          targetEndTime,
          remainingSeconds: intervalMinutes * 60,
          consecutiveDismissals: updatedConsecutiveDismissals,
          breaksAccepted: updatedBreaksAccepted,
        });
      },

      dismissBreak: () => {
        const { intervalMinutes, consecutiveDismissals, totalDismissals, breaksAccepted } = get();

        const updatedConsecutiveDismissals = consecutiveDismissals + 1;
        const updatedTotalDismissals = totalDismissals + 1;

        dispatchBreakEvent("BREAK_DISMISSED", {
          intervalMinutes,
          consecutiveDismissals: updatedConsecutiveDismissals,
          totalDismissals: updatedTotalDismissals,
          breaksAccepted,
        });

        // Reset and start next recurring interval immediately
        const now = Date.now();
        const targetEndTime = now + intervalMinutes * 60 * 1000;

        set({
          status: "RUNNING",
          startedAt: now,
          targetEndTime,
          remainingSeconds: intervalMinutes * 60,
          consecutiveDismissals: updatedConsecutiveDismissals,
          totalDismissals: updatedTotalDismissals,
        });
      },

      resetTimer: () => {
        const { intervalMinutes, consecutiveDismissals, totalDismissals, breaksAccepted } = get();
        const now = Date.now();
        const targetEndTime = now + intervalMinutes * 60 * 1000;

        set({
          status: "RUNNING",
          startedAt: now,
          targetEndTime,
          remainingSeconds: intervalMinutes * 60,
        });

        dispatchBreakEvent("BREAK_TIMER_RESET", {
          intervalMinutes,
          consecutiveDismissals,
          totalDismissals,
          breaksAccepted,
        });
      },

      stopTimer: () => {
        const { intervalMinutes, consecutiveDismissals, totalDismissals, breaksAccepted } = get();

        set({
          status: "STOPPED",
          startedAt: null,
          targetEndTime: null,
          remainingSeconds: intervalMinutes * 60,
        });

        dispatchBreakEvent("BREAK_TIMER_STOPPED", {
          intervalMinutes,
          consecutiveDismissals,
          totalDismissals,
          breaksAccepted,
        });
      },

      setIntervalMinutes: (minutes: number) => {
        const { status, startedAt } = get();
        const validMinutes = Math.max(1, minutes);

        if (status === "RUNNING" && startedAt) {
          const targetEndTime = startedAt + validMinutes * 60 * 1000;
          const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
          set({
            intervalMinutes: validMinutes,
            targetEndTime,
            remainingSeconds,
          });
        } else {
          set({
            intervalMinutes: validMinutes,
            remainingSeconds: validMinutes * 60,
          });
        }
      },

      testBreakNow: () => {
        get().triggerBreak();
      },

      resyncFromSleep: () => {
        const { status, targetEndTime } = get();
        if (status !== "RUNNING" || !targetEndTime) return;

        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

        if (remainingSeconds <= 0) {
          get().triggerBreak();
        } else {
          set({ remainingSeconds });
        }
      },
    }),
    {
      name: "lockin_break_state",
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        intervalMinutes: state.intervalMinutes,
        consecutiveDismissals: state.consecutiveDismissals,
        totalDismissals: state.totalDismissals,
        breaksAccepted: state.breaksAccepted,
      }),
    }
  )
);
