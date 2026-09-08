import type {
  FocusEventType,
  FocusEvent,
  InterventionStage,
  SessionConfig,
} from "@/types";

export const RAPID_QUIT_WINDOW_MS = 30_000;
export const RAPID_QUIT_THRESHOLD = 2;
export const BLUR_INTERVENTION_THRESHOLD = 3;
export const VISIBILITY_INTERVENTION_THRESHOLD = 3;

export interface PolicyParams {
  eventType: FocusEventType;
  quitAttemptCount: number;
  eventsHistory: FocusEvent[];
  config: SessionConfig;
}

export interface PolicyDecision {
  shouldIntervene: boolean;
  stage: InterventionStage;
  reason: string;
}

/**
 * Core Intervention Policy evaluating whether an event warrants an intervention
 * and determining the corresponding escalation stage.
 */
export function getInterventionDecision({
  eventType,
  quitAttemptCount,
  eventsHistory,
}: PolicyParams): PolicyDecision {
  const now = Date.now();

  // ── Deliberate Quit Actions (Quit button, Escape key, Pause attempt) ───────────
  if (
    eventType === "quit_attempt" ||
    eventType === "escape_key" ||
    eventType === "pause_attempt"
  ) {
    // Check for rapid attempts in the last 30 seconds
    const recentDeliberateQuits = eventsHistory.filter(
      (e) =>
        (e.type === "quit_attempt" ||
          e.type === "escape_key" ||
          e.type === "pause_attempt") &&
        now - e.timestamp <= RAPID_QUIT_WINDOW_MS
    ).length;

    if (recentDeliberateQuits >= RAPID_QUIT_THRESHOLD) {
      return {
        shouldIntervene: true,
        stage: "rapid",
        reason: "rapid_quit_attempts",
      };
    }

    // Standard escalation stages based on cumulative attempts
    if (quitAttemptCount <= 1) {
      return {
        shouldIntervene: true,
        stage: "first",
        reason: "first_quit_attempt",
      };
    }

    if (quitAttemptCount === 2) {
      return {
        shouldIntervene: true,
        stage: "second",
        reason: "second_quit_attempt",
      };
    }

    if (quitAttemptCount === 3) {
      return {
        shouldIntervene: true,
        stage: "third",
        reason: "third_quit_attempt",
      };
    }

    return {
      shouldIntervene: true,
      stage: "final",
      reason: "final_quit_attempt",
    };
  }

  // ── Passive Distraction: Tab Hidden ──────────────────────────────────────────
  if (eventType === "visibility_hidden") {
    const recentHiddenEvents = eventsHistory.filter(
      (e) =>
        e.type === "visibility_hidden" && now - e.timestamp <= 120_000 // last 2 mins
    ).length;

    if (recentHiddenEvents >= VISIBILITY_INTERVENTION_THRESHOLD) {
      return {
        shouldIntervene: true,
        stage: "second",
        reason: "excessive_tab_switching",
      };
    }

    return {
      shouldIntervene: false,
      stage: "first",
      reason: "visibility_logged",
    };
  }

  // ── Passive Distraction: Window Blur ─────────────────────────────────────────
  if (eventType === "window_blur") {
    const recentBlurEvents = eventsHistory.filter(
      (e) =>
        e.type === "window_blur" && now - e.timestamp <= 120_000 // last 2 mins
    ).length;

    if (recentBlurEvents >= BLUR_INTERVENTION_THRESHOLD) {
      return {
        shouldIntervene: true,
        stage: "second",
        reason: "excessive_window_blur",
      };
    }

    return {
      shouldIntervene: false,
      stage: "first",
      reason: "blur_logged",
    };
  }

  return {
    shouldIntervene: false,
    stage: "first",
    reason: "default_no_action",
  };
}
