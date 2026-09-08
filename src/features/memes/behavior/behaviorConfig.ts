import type { MemeEscalationConfig } from "./behaviorTypes";

/**
 * Centralized Strategic Meme Escalation Configuration
 * ===================================================
 * All numeric escalation thresholds, exit acceleration tiers, behavioral category mappings,
 * and anti-repetition rules are declared here.
 * 
 * Modifiable and tunable without altering engine logic or UI components.
 */
export const MEME_ESCALATION_CONFIG: MemeEscalationConfig = {
  historyLength: 4,
  maxNormalEscalation: 2,
  escalationThresholds: {
    level0Max: 1, // consecutiveDismissals <= 1 -> Level 0 (Initial Refusal)
    level1Max: 3, // consecutiveDismissals 2..3 -> Level 1 (Repeated Refusal)
    level2Max: 6, // consecutiveDismissals 4..6 -> Level 2 (Persistent Refusal)
    level3Min: 7, // consecutiveDismissals >= 7 -> Level 3 (Final Climax Sequence)
  },
  exitAttemptThreshold: 3,
  exitAcceleration: {
    level1Threshold: 1, // 1 exit attempt -> minimum Level 1
    level2Threshold: 2, // 2 exit attempts -> minimum Level 2
    level3Threshold: 3, // 3 exit attempts -> Level 3
  },
  antiRepetition: {
    avoidImmediate: true,
    avoidSessionRepeats: true,
    avoidCategoryRepeats: true,
  },
  memePools: {
    // Level 0: Initial Refusal (Light / Reaction / Playful attitude)
    level0: ["thinking_ravi", "flex_look", "money_follows_my_brother"],

    // Level 1: Repeated Refusal (High-energy Dances / Commands / Dialogue)
    level1: [
      "weird_dance_nakhre",
      "gucci_dance",
      "you_have_to_do_it",
      "imaandari",
    ],

    // Level 2: Persistent Refusal (Savage / Dramatic Roasts / Powerful Intervention)
    level2: [
      "koteshwariya_shiv_song",
      "dcp_ravi_kishan",
      "whats_wrong_with_you",
    ],
  },
  categoryMapping: {
    thinking_ravi: "LIGHT",
    flex_look: "ATTITUDE",
    money_follows_my_brother: "ATTITUDE",
    gucci_dance: "DANCE",
    ravi_dance: "DANCE",
    weird_dance_nakhre: "DANCE",
    you_have_to_do_it: "DIALOGUE",
    imaandari: "DIALOGUE",
    dcp_ravi_kishan: "SAVAGE",
    whats_wrong_with_you: "SAVAGE",
    koteshwariya_shiv_song: "SAVAGE",
    shutup_manoj_tiwari: "SPECIAL_FINALE",
  },
  reservedAssets: ["shutup_manoj_tiwari"],
};

export const DEFAULT_BEHAVIOR_CONFIG = MEME_ESCALATION_CONFIG;
