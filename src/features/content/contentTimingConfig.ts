/**
 * LOCKIN — Content Mode Timing Configuration
 * ============================================
 * Centralized timing delay configuration for screen recording and demo generation.
 *
 * Controls initial delays, action intervals, post-meme pauses, and finale dramatic pauses.
 * Modifiable without touching runner logic or component code.
 */

export type ContentTimingPreset = "FAST" | "NORMAL" | "CINEMATIC";

export interface ContentTimingConfig {
  name: ContentTimingPreset;
  label: string;
  initialDelayMs: number;
  betweenActionsMs: number;
  postMemeDelayMs: number;
  finaleDelayMs: number;
}

export const CONTENT_TIMING_PRESETS: Record<ContentTimingPreset, ContentTimingConfig> = {
  FAST: {
    name: "FAST",
    label: "Fast (Quick Test - 500ms)",
    initialDelayMs: 600,
    betweenActionsMs: 500,
    postMemeDelayMs: 400,
    finaleDelayMs: 600,
  },
  NORMAL: {
    name: "NORMAL",
    label: "Normal (Natural Comedy - 1.2s)",
    initialDelayMs: 1500,
    betweenActionsMs: 1000,
    postMemeDelayMs: 600,
    finaleDelayMs: 1500,
  },
  CINEMATIC: {
    name: "CINEMATIC",
    label: "Cinematic (Screen Recording - 2.0s)",
    initialDelayMs: 2500,
    betweenActionsMs: 1800,
    postMemeDelayMs: 1000,
    finaleDelayMs: 2500,
  },
};

export const DEFAULT_CONTENT_TIMING = CONTENT_TIMING_PRESETS.NORMAL;
