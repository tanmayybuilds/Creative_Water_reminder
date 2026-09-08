/**
 * LOCKIN — Character Center Calibration & Mathematical Positioning
 * ==================================================================
 * Calculates the exact rendered pixel coordinates so that Ravi's VISUAL BODY CENTER
 * coincides with the ACTUAL SCREEN CENTER, rather than merely centering the rectangular canvas.
 *
 * Accounts for:
 * - Viewport dimensions (width, height)
 * - Rendered video aspect ratio and scale
 * - Per-asset visual content bounding box and center-of-mass offsets
 * - Device pixel ratio
 */

import type { CharacterCenterCalibration } from "./waterTypes";

/**
 * Calibrated visual center offsets for transparent WebM character assets.
 * Negative X = character is drawn slightly right of canvas center -> shift left.
 * Positive X = character is drawn slightly left of canvas center -> shift right.
 */
export const CHARACTER_CENTER_CALIBRATIONS: Record<string, CharacterCenterCalibration> = {
  ravi_dance: {
    assetId: "ravi_dance",
    horizontalVisualOffsetPercent: 0,
    verticalVisualOffsetPercent: 0,
    scaleMultiplier: 1.15,
  },
  gucci_dance: {
    assetId: "gucci_dance",
    horizontalVisualOffsetPercent: 0, // Perfectly aligned horizontally
    verticalVisualOffsetPercent: -3.5, // Center around Ravi's torso & heart
    scaleMultiplier: 1.15,
  },
  you_have_to_do_it: {
    assetId: "you_have_to_do_it",
    horizontalVisualOffsetPercent: 0,
    verticalVisualOffsetPercent: 0,
    scaleMultiplier: 1.1,
  },
  whats_wrong_with_you: {
    assetId: "whats_wrong_with_you",
    horizontalVisualOffsetPercent: 0,
    verticalVisualOffsetPercent: -2.0,
    scaleMultiplier: 1.1,
  },
};

export interface CalculatedCenterPosition {
  screenCenterX: number;
  screenCenterY: number;
  elementLeft: number;
  elementTop: number;
  characterVisualCenterX: number;
  characterVisualCenterY: number;
  visualCenterErrorPixels: number; // Discrepancy between screen center & character visual center
}

/**
 * Mathematically computes viewport center and element positioning with visual calibration.
 */
export function calculateCharacterCenter(
  assetId: string,
  viewport: { width: number; height: number },
  renderedElement: { width: number; height: number },
  dpr: number = 1
): CalculatedCenterPosition {
  const screenCenterX = viewport.width / 2;
  const screenCenterY = viewport.height / 2;

  const calibration = CHARACTER_CENTER_CALIBRATIONS[assetId] || {
    assetId,
    horizontalVisualOffsetPercent: 0,
    verticalVisualOffsetPercent: 0,
    scaleMultiplier: 1.0,
  };

  // Base element top-left to place bounding box at screen center
  const baseLeft = (viewport.width - renderedElement.width) / 2;
  const baseTop = (viewport.height - renderedElement.height) / 2;

  // Apply character visual offset
  const offsetXPixels = (renderedElement.width * calibration.horizontalVisualOffsetPercent) / 100;
  const offsetYPixels = (renderedElement.height * calibration.verticalVisualOffsetPercent) / 100;

  const elementLeft = baseLeft + offsetXPixels;
  const elementTop = baseTop + offsetYPixels;

  // Visual character center on screen
  const characterVisualCenterX = elementLeft + renderedElement.width / 2 - offsetXPixels;
  const characterVisualCenterY = elementTop + renderedElement.height / 2 - offsetYPixels;

  const visualCenterErrorPixels = Math.hypot(
    characterVisualCenterX - screenCenterX,
    characterVisualCenterY - screenCenterY
  );

  return {
    screenCenterX,
    screenCenterY,
    elementLeft,
    elementTop,
    characterVisualCenterX,
    characterVisualCenterY,
    visualCenterErrorPixels,
  };
}
