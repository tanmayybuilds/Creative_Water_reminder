/**
 * LOCKIN — Water Reminder State Machine & Store
 * ===============================================
 * Clean, lightweight state machine for the recurring desktop water reminder experience.
 *
 * Concepts:
 * - Recurring 30-minute continuous timer.
 * - When fired: Ravi Kishan appears from right, moves to center, presents "💧 DRINK WATER"
 *   notification for ~5 seconds, then exits left and restarts the 30-minute timer.
 * - Only 2 meme escalations exist:
 *     1st interaction -> "You Have To Do It" (you_have_to_do_it.webm)
 *     2nd interaction -> "What's Wrong With You" (whats_wrong_with_you.webm)
 * - Zero meme auto-chaining. Zero infinite loops. 100% local.
 */

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { WaterReminderState, WaterReminderStatus } from "./waterTypes";

// Safe memory storage fallback for Node / testing environments
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

export interface WaterReminderActions {
  // Timer Actions
  startTimer: (minutes?: number) => void;
  tick: () => void;
  triggerReminder: () => void;
  resyncFromSleep: () => void;
  resetWaterTimer: () => void;
  setIntervalMinutes: (minutes: number) => void;

  // Reminder Flow Actions
  showNotification: () => void;
  hideNotification: () => void;
  handleRaviSequenceCompleted: () => void;
  handleUserInteraction: () => void;
  handleMemeFinished: () => void;
  recordWaterDrunk: (amountMl?: number) => void;

  // Developer Testing Controls
  testReminderNow: () => void;
  playMeme1: () => void;
  playMeme2: () => void;
  resetAll: () => void;
}

export type WaterReminderStore = WaterReminderState & WaterReminderActions;

const DEFAULT_WATER_INTERVAL_MINUTES = 30;

export const useWaterStore = create<WaterReminderStore>()(
  persist(
    (set, get) => ({
      // Initial State
      status: "WAITING" as WaterReminderStatus,
      intervalMinutes: DEFAULT_WATER_INTERVAL_MINUTES,
      startedAt: Date.now(),
      targetEndTime: Date.now() + DEFAULT_WATER_INTERVAL_MINUTES * 60 * 1000,
      remainingSeconds: DEFAULT_WATER_INTERVAL_MINUTES * 60,

      interactionCount: 0,
      activeMemeId: null,
      isNotificationVisible: false,
      notificationMessage: "💧 DRINK WATER",

      totalRemindersTriggered: 0,
      totalRemindersCompleted: 0,
      totalWaterDrunk: 0,
      totalInteractions: 0,

      /**
       * Starts or restarts the recurring countdown timer.
       */
      startTimer: (minutes?: number) => {
        const interval = minutes || get().intervalMinutes;
        const now = Date.now();
        const targetEndTime = now + interval * 60 * 1000;
        const remainingSeconds = interval * 60;

        set({
          status: "WAITING",
          intervalMinutes: interval,
          startedAt: now,
          targetEndTime,
          remainingSeconds,
          interactionCount: 0,
          activeMemeId: null,
          isNotificationVisible: false,
        });
      },

      /**
       * Calculates remaining time from targetEndTime on every clock tick.
       */
      tick: () => {
        const { status, targetEndTime } = get();
        if (status !== "WAITING" || !targetEndTime) return;

        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

        if (remainingSeconds <= 0) {
          get().triggerReminder();
        } else {
          set({ remainingSeconds });
        }
      },

      /**
       * Fires when the 30-minute timer expires or test trigger is invoked.
       */
      triggerReminder: () => {
        const { status, totalRemindersTriggered } = get();

        // Single-fire guard: do not trigger multiple concurrent reminders
        if (status === "REMINDER_ACTIVE" || status === "RAVI_PLAYING" || status === "MEME_PLAYING") {
          return;
        }

        set({
          status: "REMINDER_ACTIVE",
          activeMemeId: "ravi_dance",
          interactionCount: 0,
          isNotificationVisible: false,
          remainingSeconds: 0,
          totalRemindersTriggered: totalRemindersTriggered + 1,
        });
      },

      /**
       * Shows the "💧 DRINK WATER" notification attached to Ravi at screen center.
       */
      showNotification: () => {
        set({
          isNotificationVisible: true,
          notificationMessage: "💧 DRINK WATER",
        });
      },

      /**
       * Hides the notification smoothly.
       */
      hideNotification: () => {
        set({
          isNotificationVisible: false,
        });
      },

      /**
       * Handles user interaction / click during active reminder.
       * 1st interaction -> "You Have To Do It" (you_have_to_do_it.webm)
       * 2nd interaction -> "What's Wrong With You" (whats_wrong_with_you.webm)
       * 3rd+ interaction -> absorbed safely
       */
      handleUserInteraction: () => {
        const { status, interactionCount, totalInteractions } = get();

        // Only accept interactions while a reminder sequence is active
        if (status !== "REMINDER_ACTIVE" && status !== "RAVI_PLAYING") {
          return;
        }

        if (interactionCount === 0) {
          // ===== 1ST INTERACTION: YOU HAVE TO DO IT =====
          set({
            status: "MEME_PLAYING",
            interactionCount: 1,
            activeMemeId: "you_have_to_do_it",
            isNotificationVisible: false,
            totalInteractions: totalInteractions + 1,
          });
        } else if (interactionCount === 1) {
          // ===== 2ND INTERACTION: WHAT'S WRONG WITH YOU =====
          set({
            status: "MEME_PLAYING",
            interactionCount: 2,
            activeMemeId: "whats_wrong_with_you",
            isNotificationVisible: false,
            totalInteractions: totalInteractions + 1,
          });
        }
      },

      /**
       * Called when an interaction meme finishes playback.
       * Strictly resumes or completes WITHOUT automatically chaining another meme.
       */
      handleMemeFinished: () => {
        const { interactionCount } = get();

        if (interactionCount === 1) {
          // After 1st meme: return to REMINDER_ACTIVE, wait for user's next action or completion
          set({
            status: "REMINDER_ACTIVE",
            activeMemeId: "ravi_dance",
          });
        } else if (interactionCount >= 2) {
          // After 2nd meme: complete reminder sequence cleanly
          get().handleRaviSequenceCompleted();
        }
      },

      /**
       * Completes the entire reminder sequence and restarts the recurring 30-minute timer.
       */
      handleRaviSequenceCompleted: () => {
        const { totalRemindersCompleted } = get();

        set({
          status: "REMINDER_COMPLETE",
          activeMemeId: null,
          isNotificationVisible: false,
          totalRemindersCompleted: totalRemindersCompleted + 1,
        });

        // Restart next 30-minute interval automatically
        get().startTimer();
      },

      /**
       * Records water consumed by user (+250 ml / +1 glass).
       */
      recordWaterDrunk: (amountMl = 250) => {
        set((s) => ({
          totalWaterDrunk: s.totalWaterDrunk + amountMl,
        }));
      },

      /**
       * Dev test trigger: triggers reminder sequence immediately.
       */
      testReminderNow: () => {
        get().triggerReminder();
      },

      /**
       * Directly test-plays Meme 1 ("You Have To Do It").
       */
      playMeme1: () => {
        set({
          status: "MEME_PLAYING",
          activeMemeId: "you_have_to_do_it",
          interactionCount: 1,
          isNotificationVisible: false,
        });
      },

      /**
       * Directly test-plays Meme 2 ("What's Wrong With You").
       */
      playMeme2: () => {
        set({
          status: "MEME_PLAYING",
          activeMemeId: "whats_wrong_with_you",
          interactionCount: 2,
          isNotificationVisible: false,
        });
      },

      /**
       * Resets current countdown timer to a fresh interval.
       */
      resetWaterTimer: () => {
        get().startTimer();
      },

      /**
       * Changes timer interval (e.g. 15, 20, 30, 45, 60 minutes).
       */
      setIntervalMinutes: (minutes: number) => {
        const validMinutes = Math.max(1, minutes);
        get().startTimer(validMinutes);
      },

      /**
       * Sleep / Wake timestamp resynchronization.
       */
      resyncFromSleep: () => {
        const { status, targetEndTime } = get();
        if (status !== "WAITING" || !targetEndTime) return;

        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

        if (remainingSeconds <= 0) {
          get().triggerReminder();
        } else {
          set({ remainingSeconds });
        }
      },

      /**
       * Resets state back to initial WAITING state.
       */
      resetAll: () => {
        get().startTimer(DEFAULT_WATER_INTERVAL_MINUTES);
      },
    }),
    {
      name: "lockin_water_reminder_stats",
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        intervalMinutes: state.intervalMinutes,
        totalRemindersTriggered: state.totalRemindersTriggered,
        totalRemindersCompleted: state.totalRemindersCompleted,
        totalWaterDrunk: state.totalWaterDrunk,
        totalInteractions: state.totalInteractions,
      }),
    }
  )
);
