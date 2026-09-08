import type { MemeId } from "../types";
import type {
  EscalationLevel,
  BehaviorConfig,
  MemeEscalationConfig,
  RandomSource,
  SelectedMemeIntervention,
  MemeBehaviorCategory,
} from "./behaviorTypes";
import { MEME_ESCALATION_CONFIG } from "./behaviorConfig";
import { getMeme } from "../registry";

/**
 * Calculates the refusal escalation tier based strictly on consecutive refusals.
 */
export function calculateRefusalLevel(
  consecutiveRefusals: number,
  config: BehaviorConfig = MEME_ESCALATION_CONFIG
): number {
  if (consecutiveRefusals <= 0) return 0;
  if (consecutiveRefusals <= config.escalationThresholds.level0Max) return 0;
  if (consecutiveRefusals <= config.escalationThresholds.level1Max) return 1;
  if (consecutiveRefusals <= config.escalationThresholds.level2Max) return 2;
  return 3;
}

/**
 * Calculates the exit acceleration tier based on exit attempt count.
 */
export function calculateExitLevel(
  exitAttempts: number,
  config: MemeEscalationConfig = MEME_ESCALATION_CONFIG
): number {
  if (exitAttempts <= 0) return 0;
  if (exitAttempts >= (config.exitAttemptThreshold || 3)) {
    return 3;
  }
  if (exitAttempts >= 2) {
    return 1;
  }
  return 0;
}

/**
 * Calculates the combined escalation level by fusing refusal level and exit acceleration.
 */
export function calculateCombinedEscalationLevel(
  consecutiveRefusals: number,
  exitAttempts: number,
  config: MemeEscalationConfig = MEME_ESCALATION_CONFIG
): EscalationLevel {
  // If exit attempts reached Level 3 threshold (3+), trigger Level 3
  if (exitAttempts >= (config.exitAttemptThreshold || 3)) {
    return 3;
  }

  // If consecutive refusals reached Level 3 threshold (7+), trigger Level 3
  if (consecutiveRefusals >= (config.escalationThresholds.level3Min || 7)) {
    return 3;
  }

  const refusalLevel = calculateRefusalLevel(consecutiveRefusals, config);
  const exitLevel = calculateExitLevel(exitAttempts, config);

  // Combined level accelerates to the maximum of refusal and exit tiers
  const combined = Math.max(refusalLevel, exitLevel);
  return Math.min(config.maxNormalEscalation || 2, combined) as EscalationLevel;
}

/**
 * Backward-compatible wrapper for calculateCombinedEscalationLevel.
 */
export function calculateEscalationLevel(
  consecutiveDismissals: number,
  exitAttempts: number,
  config: BehaviorConfig = MEME_ESCALATION_CONFIG
): EscalationLevel {
  return calculateCombinedEscalationLevel(
    consecutiveDismissals,
    exitAttempts,
    config as MemeEscalationConfig
  );
}

/**
 * Selects an appropriate meme using controlled randomness, level filtering,
 * category variety progression, and anti-repetition guarantees.
 * 
 * Guarantees:
 * - shutup_manoj_tiwari is NEVER returned by normal selection.
 * - Same meme is never played consecutively (A -> A prevented).
 * - Session history is respected and relaxed gracefully when pool is constrained.
 * - Category repetition is minimized when alternative categories exist in the tier.
 * - Deterministic testing supported via injectable random source.
 */
export function selectInterventionMeme(
  level: EscalationLevel,
  recentMemes: MemeId[],
  lastMemePlayed: MemeId | null,
  config: BehaviorConfig = MEME_ESCALATION_CONFIG,
  randomSource: RandomSource = Math.random
): SelectedMemeIntervention | null {
  // Level 3 transitions to Paisa Ya Pehchaan interaction rather than standard random Ravi meme
  if (level === 3) {
    return null;
  }

  const escalationConfig = (config as MemeEscalationConfig) || MEME_ESCALATION_CONFIG;
  const reserved = escalationConfig.reservedAssets || ["shutup_manoj_tiwari"];

  let pool: MemeId[] = [];
  switch (level) {
    case 0:
      pool = [...config.memePools.level0];
      break;
    case 1:
      pool = [...config.memePools.level1];
      break;
    case 2:
      pool = [...config.memePools.level2];
      break;
    default:
      pool = [...config.memePools.level0];
  }

  // Safety filter: Reserved assets (Manoj Tiwari) must NEVER appear in selection pools
  pool = pool.filter((id) => !reserved.includes(id));

  if (pool.length === 0) {
    return null;
  }

  // Determine last played category to minimize immediate category repetition
  const categoryMap = escalationConfig.categoryMapping || MEME_ESCALATION_CONFIG.categoryMapping;
  const lastCategory = lastMemePlayed ? categoryMap[lastMemePlayed] : null;

  // Step 1: Strict candidate filtering (no immediate repeat, no recent session history, prefer different category)
  let candidates = pool.filter((id) => {
    if (id === lastMemePlayed) return false;
    if (recentMemes.includes(id)) return false;
    if (lastCategory && categoryMap[id] === lastCategory) {
      // Check if there are other candidates with a different category in pool
      const hasOtherCategories = pool.some(
        (otherId) =>
          otherId !== lastMemePlayed &&
          !recentMemes.includes(otherId) &&
          categoryMap[otherId] !== lastCategory
      );
      if (hasOtherCategories) return false;
    }
    return true;
  });

  // Step 2: If strict category + history left 0 candidates, relax category constraint while retaining history constraint
  if (candidates.length === 0) {
    candidates = pool.filter(
      (id) => id !== lastMemePlayed && !recentMemes.includes(id)
    );
  }

  // Step 3: If history filtered everything, relax recent history but strictly keep immediate repeat guard
  if (candidates.length === 0) {
    candidates = pool.filter((id) => id !== lastMemePlayed);
  }

  // Step 4: Absolute Fallback: Single-item pool
  if (candidates.length === 0) {
    candidates = pool;
  }

  // Controlled deterministic selection from candidates
  const randomIndex = Math.floor(randomSource() * candidates.length);
  const selectedId = candidates[Math.min(randomIndex, candidates.length - 1)];

  const memeDef = getMeme(selectedId);
  if (!memeDef) {
    return null;
  }

  const category = categoryMap[selectedId] || "LIGHT";

  return {
    memeId: selectedId,
    escalationLevel: level,
    category,
    position: memeDef.movement.targetPosition || memeDef.preferredPositions[0] || "center",
    entrance: memeDef.defaultEntrance || "pop",
    exit: memeDef.movement.exitOverride || memeDef.defaultExit || "fade",
    scale: memeDef.defaultScale || 1.0,
    reason: `Selected for Level ${level} escalation (${category})`,
  };
}
