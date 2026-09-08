/**
 * LOCKIN - Meme Behavior Engine Type Definitions
 */

import type { MemeId, MemePosition, EntranceAnimationType, ExitAnimationType } from "../types";

export type EscalationLevel = 0 | 1 | 2 | 3;

export type MemeBehaviorCategory =
  | "LIGHT"
  | "REACTION"
  | "DANCE"
  | "ATTITUDE"
  | "DIALOGUE"
  | "SAVAGE"
  | "SPECIAL_FINALE";

export interface BehaviorState {
  breakSessionId: string;
  consecutiveDismissals: number;
  totalDismissals: number;
  breaksAccepted: number;
  exitAttempts: number;
  lastMemePlayed: MemeId | null;
  recentMemes: MemeId[];
  currentEscalationLevel: EscalationLevel;
  paisaYaPehchaanShown: boolean;
  finalExitStage: number;
}

export interface BehaviorConfig {
  historyLength: number;
  escalationThresholds: {
    level0Max: number; // 1 (First refusal)
    level1Max: number; // 3 (Repeated refusal)
    level2Max: number; // 6 (Persistent refusal)
    level3Min: number; // 7+ or exit attempts >= 3 (Final Exit / Paisa Ya Pehchaan)
  };
  exitAttemptThreshold: number; // 3+ triggers Level 3
  memePools: {
    level0: MemeId[];
    level1: MemeId[];
    level2: MemeId[];
  };
}

export interface MemeEscalationConfig extends BehaviorConfig {
  maxNormalEscalation: 2;
  exitAcceleration: {
    level1Threshold: number;
    level2Threshold: number;
    level3Threshold: number;
  };
  antiRepetition: {
    avoidImmediate: boolean;
    avoidSessionRepeats: boolean;
    avoidCategoryRepeats: boolean;
  };
  categoryMapping: Record<MemeId, MemeBehaviorCategory>;
  reservedAssets: MemeId[];
}

export interface SelectedMemeIntervention {
  memeId: MemeId;
  escalationLevel: EscalationLevel;
  category?: MemeBehaviorCategory;
  position?: MemePosition;
  entrance?: EntranceAnimationType;
  exit?: ExitAnimationType;
  scale?: number;
  reason: string;
}

export type RandomSource = () => number;
