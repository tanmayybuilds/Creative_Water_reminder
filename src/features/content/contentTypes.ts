/**
 * LOCKIN — Content Mode Type Definitions
 * ========================================
 * Data types for Content Mode developer tools, scenario recording presets,
 * and live execution state.
 */

import type { ContentTimingPreset } from "./contentTimingConfig";

export type ContentScenarioId =
  | "POV_30_MINUTES"
  | "TRYING_TO_CLOSE"
  | "FIVE_MORE_MINUTES"
  | "FULL_CHAOS";

export interface ContentScenarioStep {
  name: string;
  action: () => Promise<void> | void;
  waitForMeme?: boolean;
  delayAfterMs?: number;
}

export interface ContentScenarioDef {
  id: ContentScenarioId;
  title: string;
  badge: string;
  description: string;
  estimatedDuration: string;
}
