// ── Task Types ──────────────────────────────────────────────────
export type TaskType =
  | "study"
  | "jee"
  | "homework"
  | "coding"
  | "reading"
  | "creative"
  | "workout"
  | "custom";

// ── Roast Intensity ─────────────────────────────────────────────
export type RoastIntensity = "chill" | "serious" | "savage" | "brainrot";

// ── Session Configuration ───────────────────────────────────────
export interface SessionConfig {
  taskType: TaskType;
  taskName: string;
  durationMinutes: number;
  durationSeconds: number;
  roastIntensity: RoastIntensity;
  createdAt: number;
}

// ── Timer Status ────────────────────────────────────────────────
export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "abandoned";

// ── Focus Events ────────────────────────────────────────────────
export type FocusEventType =
  | "quit_attempt"
  | "escape_key"
  | "pause_attempt"
  | "visibility_hidden"
  | "window_blur"
  | "exit_challenge_started"
  | "exit_challenge_completed"
  | "session_completed"
  | "session_abandoned";

export interface FocusEvent {
  id: string;
  type: FocusEventType;
  timestamp: number;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

// ── Intervention Stages & Content ───────────────────────────────
export type InterventionStage =
  | "first"
  | "second"
  | "third"
  | "rapid"
  | "final";

export interface InterventionContent {
  id: string;
  stage: InterventionStage;
  intensity: RoastIntensity[];
  eventTypes: FocusEventType[];
  title: string;
  message: string;
  mediaType: "image" | "video" | "gif" | "text";
  mediaPath?: string;
  soundPath?: string;
  durationMs?: number;
  tag?: string;
}

export interface InterventionDecision {
  shouldIntervene: boolean;
  stage: InterventionStage;
  reason: string;
  intervention: InterventionContent | null;
}

// ── Exit Challenge Types ────────────────────────────────────────
export type ExitStage =
  | "intro"
  | "admit"
  | "question"
  | "money_fame"
  | "final_confirmation"
  | "completed";

export interface ExitQuestionOption {
  id: string;
  label: string;
  reaction: string;
}

export interface ExitQuestion {
  id: string;
  question: string;
  options: ExitQuestionOption[];
}

export type MoneyOrFame = "money" | "fame";

export interface ExitChallengeState {
  sessionId: string;
  stage: ExitStage;
  question: ExitQuestion | null;
  selectedOptionId?: string;
  moneyOrFame?: MoneyOrFame;
  moneyFameReaction?: string;
  startedAt: number;
  completedAt?: number;
}

// ── Active Timer State (Authoritative Persistence) ──────────────
export interface ActiveTimerState {
  sessionId: string;
  config: SessionConfig;
  status: TimerStatus;
  startedAt: number;
  targetEndTime: number;
  pausedAt: number | null;
  remainingWhenPaused: number | null;
  durationSeconds: number;
  quitAttempts: number;
  events: FocusEvent[];
  lastInterventionId?: string;
  exitChallengeState?: ExitChallengeState;
}

// ── Completed Session Record ────────────────────────────────────
export interface CompletedSessionRecord {
  id: string;
  taskType: TaskType;
  taskName: string;
  durationSeconds: number;
  actualFocusSeconds?: number;
  startedAt: number;
  completedAt: number;
  status: "completed" | "abandoned";
  roastIntensity: RoastIntensity;
  quitAttempts: number;
  events: FocusEvent[];
  moneyOrFame?: MoneyOrFame;
  exitQuestionId?: string;
  exitQuestionOptionId?: string;
  exitChallengeCompleted?: boolean;
}

// ── Feature Module ──────────────────────────────────────────────
export interface FeatureModule {
  id: string;
  name: string;
  enabled: boolean;
}
