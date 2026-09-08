/**
 * LOCKIN — Water Reminder Mode Type Definitions
 * ===============================================
 * Clean state model specifically designed for the recurring water reminder experience.
 */

export type WaterReminderStatus =
  | "IDLE"
  | "WAITING"
  | "REMINDER_ACTIVE"
  | "RAVI_PLAYING"
  | "MEME_PLAYING"
  | "REMINDER_COMPLETE";

export interface WaterReminderState {
  // Core status & interval
  status: WaterReminderStatus;
  intervalMinutes: number;
  startedAt: number | null;
  targetEndTime: number | null;
  remainingSeconds: number;

  // Interaction tracking (0 | 1 | 2)
  interactionCount: number;
  activeMemeId: string | null;

  // Notification visibility
  isNotificationVisible: boolean;
  notificationMessage: string;

  // Statistics (persisted locally)
  totalRemindersTriggered: number;
  totalRemindersCompleted: number;
  totalWaterDrunk: number; // in glasses / ml
  totalInteractions: number;
}

export interface CharacterCenterCalibration {
  assetId: string;
  horizontalVisualOffsetPercent: number; // e.g. -2% to align torso
  verticalVisualOffsetPercent: number;   // e.g. -5% to align chest/face
  scaleMultiplier: number;
}
