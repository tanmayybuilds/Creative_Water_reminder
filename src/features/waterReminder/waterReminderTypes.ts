/**
 * LOCKIN — Desktop Water Reminder Types & Timing Constants
 */

export const WATER_REMINDER_TIMING = {
  TOTAL_DURATION: 15000, // 15 seconds full traversal from one end to the other
  ENTRY_DURATION: 7500,  // midpoint / screen center milestone (halfway)
  EXIT_DURATION: 7500,   // second half of traversal to opposite edge
} as const;

export type WaterReminderPhase =
  | "IDLE"
  | "ENTERING"
  | "CENTER_HOLD"
  | "EXITING"
  | "MEME_PLAYING"
  | "COMPLETED";

export type InterruptionMemeId = "you_have_to_do_it" | "whats_wrong_with_you";

export interface ScreenGeometry {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  devicePixelRatio: number;
}

export interface VideoDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface PositionCalculation {
  startX: number;
  startY: number;
  centerX: number;
  centerY: number;
  endX: number;
  endY: number;
  currentX: number;
  currentY: number;
  visualCenterErrorPixels: number;
}

export interface WaterReminderState {
  // Timer state
  intervalMinutes: number;
  isTimerRunning: boolean;
  startedAt: number | null;
  targetEndTime: number | null;
  remainingSeconds: number;

  // Overlay state
  phase: WaterReminderPhase;
  timelineMs: number; // 0 -> 15000ms
  activeMemeId: InterruptionMemeId | null;
  interruptionCount: number; // 0, 1, 2 (max 2)
  isNotificationVisible: boolean;
  notificationMessage: string;

  // Debug & Content Creation
  showDebugHUD: boolean;
  showCenterCrosshair: boolean;
  totalRemindersTriggered: number;
  totalRemindersCompleted: number;
  totalWaterDrunkMl: number;

  // Actions
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setIntervalMinutes: (minutes: number) => void;
  tick: () => void;
  triggerReminder: () => void;
  triggerTestReminder: () => void;
  testCenterPosition: () => void;
  handleUserInterruption: (fromBroadcast?: boolean) => void;
  handleMemeFinished: (fromBroadcast?: boolean) => void;
  handleSequenceCompleted: (fromBroadcast?: boolean) => void;
  setPhase: (phase: WaterReminderPhase) => void;
  setTimelineMs: (ms: number) => void;
  toggleDebugHUD: () => void;
  toggleCenterCrosshair: () => void;
  recordWaterDrunk: (amountMl: number) => void;
}
