import { create } from "zustand";
import { WaterReminderState, WaterReminderPhase, WATER_REMINDER_TIMING } from "./waterReminderTypes";

let reminderChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    reminderChannel = new BroadcastChannel("lockin_water_channel");
  } catch (e) {}
}

export const useWaterReminderStore = create<WaterReminderState>((set, get) => {
  const defaultInterval = 30;
  const now = Date.now();
  const targetEndTime = now + defaultInterval * 60 * 1000;

  // Listen to cross-window broadcast events (Dashboard <-> Transparent Overlay)
  if (reminderChannel) {
    reminderChannel.onmessage = (event) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === "TRIGGER_REMINDER" || data.type === "TRIGGER_TEST") {
        const { totalRemindersTriggered } = get();
        set({
          phase: "ENTERING",
          timelineMs: 0,
          activeMemeId: null,
          interruptionCount: 0,
          isNotificationVisible: false,
          remainingSeconds: 0,
          totalRemindersTriggered: totalRemindersTriggered + 1,
        });
      } else if (data.type === "INTERRUPT") {
        get().handleUserInterruption(true);
      } else if (data.type === "MEME_FINISHED") {
        get().handleMemeFinished(true);
      } else if (data.type === "SEQUENCE_COMPLETED") {
        get().handleSequenceCompleted(true);
      }
    };
  }

  return {
    intervalMinutes: defaultInterval,
    isTimerRunning: true,
    startedAt: now,
    targetEndTime,
    remainingSeconds: defaultInterval * 60,

    phase: "IDLE",
    timelineMs: 0,
    activeMemeId: null,
    interruptionCount: 0,
    isNotificationVisible: false,
    notificationMessage: "💧 DRINK WATER",

    showDebugHUD: false,
    showCenterCrosshair: false,
    totalRemindersTriggered: 0,
    totalRemindersCompleted: 0,
    totalWaterDrunkMl: 0,

    startTimer: () => {
      const { intervalMinutes } = get();
      const startTime = Date.now();
      set({
        isTimerRunning: true,
        startedAt: startTime,
        targetEndTime: startTime + intervalMinutes * 60 * 1000,
        remainingSeconds: intervalMinutes * 60,
      });
    },

    stopTimer: () => {
      set({
        isTimerRunning: false,
        startedAt: null,
        targetEndTime: null,
      });
    },

    resetTimer: () => {
      const { intervalMinutes, isTimerRunning } = get();
      const startTime = Date.now();
      set({
        startedAt: isTimerRunning ? startTime : null,
        targetEndTime: isTimerRunning ? startTime + intervalMinutes * 60 * 1000 : null,
        remainingSeconds: intervalMinutes * 60,
        phase: "IDLE",
        timelineMs: 0,
        activeMemeId: null,
        interruptionCount: 0,
        isNotificationVisible: false,
      });
    },

    setIntervalMinutes: (minutes: number) => {
      const cleanMinutes = Math.max(1, Math.min(180, minutes));
      const startTime = Date.now();
      const targetEndTime = startTime + cleanMinutes * 60 * 1000;
      set({
        intervalMinutes: cleanMinutes,
        startedAt: startTime,
        targetEndTime,
        remainingSeconds: cleanMinutes * 60,
      });
    },

    tick: () => {
      const { isTimerRunning, targetEndTime, phase } = get();
      if (!isTimerRunning || !targetEndTime) return;

      // Do not countdown during active reminder playback
      if (phase !== "IDLE" && phase !== "COMPLETED") return;

      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

      if (remainingSeconds <= 0) {
        get().triggerReminder();
      } else {
        set({ remainingSeconds });
      }
    },

    triggerReminder: () => {
      const { phase, totalRemindersTriggered } = get();
      // Single-fire guard: prevent duplicate concurrent overlays
      if (phase !== "IDLE" && phase !== "COMPLETED") return;

      try {
        reminderChannel?.postMessage({ type: "TRIGGER_REMINDER" });
      } catch (e) {}

      set({
        phase: "ENTERING",
        timelineMs: 0,
        activeMemeId: null,
        interruptionCount: 0,
        isNotificationVisible: false,
        remainingSeconds: 0,
        totalRemindersTriggered: totalRemindersTriggered + 1,
      });
    },

    triggerTestReminder: () => {
      const { totalRemindersTriggered } = get();

      try {
        reminderChannel?.postMessage({ type: "TRIGGER_TEST" });
      } catch (e) {}

      set({
        phase: "ENTERING",
        timelineMs: 0,
        activeMemeId: null,
        interruptionCount: 0,
        isNotificationVisible: false,
        remainingSeconds: 0,
        totalRemindersTriggered: totalRemindersTriggered + 1,
      });
    },

    testCenterPosition: () => {
      set({
        phase: "CENTER_HOLD",
        timelineMs: WATER_REMINDER_TIMING.ENTRY_DURATION,
        isNotificationVisible: true,
        activeMemeId: null,
      });
    },

    handleUserInterruption: (fromBroadcast = false) => {
      const { phase, interruptionCount } = get();

      // Only accept interactions while a reminder sequence is active
      if (phase === "IDLE" || phase === "COMPLETED") return;

      if (!fromBroadcast) {
        try {
          reminderChannel?.postMessage({ type: "INTERRUPT" });
        } catch (e) {}
      }

      if (interruptionCount === 0) {
        // 1st interruption: play 'you_have_to_do_it'
        set({
          phase: "MEME_PLAYING",
          activeMemeId: "you_have_to_do_it",
          interruptionCount: 1,
          isNotificationVisible: false,
        });
      } else if (interruptionCount === 1) {
        // 2nd interruption: play 'whats_wrong_with_you'
        set({
          phase: "MEME_PLAYING",
          activeMemeId: "whats_wrong_with_you",
          interruptionCount: 2,
          isNotificationVisible: false,
        });
      }
    },

    handleMemeFinished: (fromBroadcast = false) => {
      const { interruptionCount } = get();

      if (!fromBroadcast) {
        try {
          reminderChannel?.postMessage({ type: "MEME_FINISHED" });
        } catch (e) {}
      }

      if (interruptionCount === 1) {
        // After 1st meme: resume water reminder sequence cleanly
        set({
          phase: "CENTER_HOLD",
          activeMemeId: null,
          isNotificationVisible: true,
          timelineMs: WATER_REMINDER_TIMING.ENTRY_DURATION,
        });
      } else if (interruptionCount >= 2) {
        // After 2nd meme: conclude sequence and restart timer
        get().handleSequenceCompleted(fromBroadcast);
      }
    },

    handleSequenceCompleted: (fromBroadcast = false) => {
      const { intervalMinutes, totalRemindersCompleted } = get();
      const startTime = Date.now();
      const targetEndTime = startTime + intervalMinutes * 60 * 1000;

      if (!fromBroadcast) {
        try {
          reminderChannel?.postMessage({ type: "SEQUENCE_COMPLETED" });
        } catch (e) {}
      }

      set({
        phase: "COMPLETED",
        timelineMs: WATER_REMINDER_TIMING.TOTAL_DURATION,
        activeMemeId: null,
        isNotificationVisible: false,
        totalRemindersCompleted: totalRemindersCompleted + 1,
        // Seamlessly restart recurring timer for next interval
        isTimerRunning: true,
        startedAt: startTime,
        targetEndTime,
        remainingSeconds: intervalMinutes * 60,
      });

      setTimeout(() => {
        if (get().phase === "COMPLETED") {
          set({ phase: "IDLE" });
        }
      }, 300);
    },

    setPhase: (phase: WaterReminderPhase) => set({ phase }),

    setTimelineMs: (ms: number) => set({ timelineMs: ms }),

    toggleDebugHUD: () => set((state) => ({ showDebugHUD: !state.showDebugHUD })),

    toggleCenterCrosshair: () => set((state) => ({ showCenterCrosshair: !state.showCenterCrosshair })),

    recordWaterDrunk: (amountMl: number) =>
      set((state) => ({ totalWaterDrunkMl: state.totalWaterDrunkMl + amountMl })),
  };
});
