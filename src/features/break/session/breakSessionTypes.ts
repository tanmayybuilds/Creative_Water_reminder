/**
 * LOCKIN - Break Session State Machine Types
 * ===========================================
 * Defines the state transitions, session tracking model, and persistent
 * lifetime statistics for the desktop break reminder experience.
 * 
 * 100% offline, local-first.
 */

import type { MemeId } from "@/features/memes/types";

/**
 * High-level discrete states of the Break Experience lifecycle.
 */
export type BreakSessionState =
  | "IDLE"
  | "BREAK_TRIGGERED"
  | "BREAK_PROMPT"
  | "REFUSED"
  | "MEME_PLAYING"
  | "MEME_FINISHED"
  | "REFUSED_AGAIN"
  | "ESCALATION"
  | "FINAL_EXIT_ATTEMPT"
  | "FINAL_CHOICE"
  | "FINISHED";

/**
 * Active Break Session Data Model
 */
export interface BreakSession {
  sessionId: string;
  sessionStartTime: number;
  refusalCount: number;
  leaveMeAloneCount: number;
  exitAttemptCount: number;
  consecutiveRefusals: number;
  memesPlayedThisBreak: MemeId[];
  lastMemeId: MemeId | null;
  finalChoiceAttempted: boolean;
  /** Number of wrong answers during the FINAL_CHOICE interaction */
  finalChoiceAttempts: number;
  status: BreakSessionState;
}

/**
 * Cumulative Lifetime Counters (persisted locally on device)
 */
export interface LifetimeBreakStats {
  totalBreaksTriggered: number;
  totalBreaksAccepted: number;
  totalBreaksRefused: number;
  totalMemesPlayed: number;
  totalExitAttempts: number;
}
