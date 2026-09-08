/**
 * LOCKIN — Final Choice Configuration
 * ====================================
 * Single source of truth for the "Paisa Ya Pehchaan?" finale experience.
 *
 * All final-choice logic reads from this configuration.
 * Product owner can change the correct answer, meme mappings,
 * and attempt limits here without touching engine logic or UI code.
 */

import type { MemeId } from "@/features/memes/types";

export type FinalChoiceOption = "PAISA" | "PEHCHAAN";

export interface FinalChoiceConfig {
  /**
   * The deterministic correct answer.
   * Only this option resolves the break successfully.
   *
   * PRODUCT OWNER: Set this to the intended correct answer.
   * Currently set to "PAISA" (i.e. "Take the break / health").
   */
  correctOption: FinalChoiceOption;

  /**
   * Meme played when the user selects the WRONG answer.
   * This is the reserved finale asset.
   */
  wrongAnswerMemeId: MemeId;

  /**
   * Meme played when the user selects the CORRECT answer.
   * Should be a celebratory / "I was joking" type clip.
   *
   * PRODUCT OWNER: If a dedicated "correct answer" meme asset is
   * produced in the future, set its ID here. For now, this uses
   * an existing energetic Ravi Kishan clip as the resolution meme.
   *
   * If this meme ID does not exist in the registry, the system
   * will log a developer-visible warning and skip straight to
   * break acceptance without crashing.
   */
  correctAnswerMemeId: MemeId;

  /**
   * Maximum number of wrong-answer attempts before the system
   * forcibly resolves the break (anti-infinite-loop safety).
   *
   * After this many wrong answers:
   * - The reserved finale meme plays one last time.
   * - The break is accepted.
   * - The user is never permanently trapped.
   */
  maxFinalChoiceAttempts: number;
}

/**
 * Active Final Choice Configuration
 * -----------------------------------
 * Edit ONLY this object to tune the finale experience.
 */
export const FINAL_CHOICE_CONFIG: FinalChoiceConfig = {
  correctOption: "PAISA",
  wrongAnswerMemeId: "shutup_manoj_tiwari",
  correctAnswerMemeId: "gucci_dance",
  maxFinalChoiceAttempts: 3,
};
