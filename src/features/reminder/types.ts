/**
 * LOCKIN - Recurring Break Reminder Types
 * 
 * 100% offline, local-first recurring break timer model and event definitions.
 */

export type TimerStatus = "IDLE" | "RUNNING" | "BREAK_TRIGGERED" | "STOPPED";

export type BreakEventType =
  | "BREAK_STARTED"
  | "BREAK_TRIGGERED"
  | "BREAK_ACCEPTED"
  | "BREAK_DISMISSED"
  | "BREAK_TIMER_RESET"
  | "BREAK_TIMER_STOPPED";

export interface BreakEvent {
  type: BreakEventType;
  timestamp: number;
  intervalMinutes: number;
  consecutiveDismissals: number;
  totalDismissals: number;
  breaksAccepted: number;
  metadata?: Record<string, unknown>;
}

export interface IntervalOption {
  minutes: number;
  label: string;
}

export const SUPPORTED_INTERVALS: IntervalOption[] = [
  { minutes: 10, label: "10 minutes" },
  { minutes: 15, label: "15 minutes" },
  { minutes: 20, label: "20 minutes" },
  { minutes: 30, label: "30 minutes" },
  { minutes: 45, label: "45 minutes" },
  { minutes: 60, label: "60 minutes" },
];

export interface BreakReminderState {
  status: TimerStatus;
  intervalMinutes: number;
  startedAt: number | null;
  targetEndTime: number | null;
  remainingSeconds: number;
  consecutiveDismissals: number;
  totalDismissals: number;
  breaksAccepted: number;
}
