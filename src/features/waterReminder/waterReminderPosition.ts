import { ScreenGeometry, VideoDimensions, PositionCalculation, WATER_REMINDER_TIMING } from "./waterReminderTypes";

/**
 * Standard cubic ease-in-out easing function for smooth, natural movement.
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Detects current screen/window physical geometry.
 */
export function getScreenGeometry(): ScreenGeometry {
  const width = typeof window !== "undefined" ? window.innerWidth : 1920;
  const height = typeof window !== "undefined" ? window.innerHeight : 1080;
  const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  return {
    width,
    height,
    centerX: width / 2,
    centerY: height / 2,
    devicePixelRatio,
  };
}

/**
 * Calculates start, true visual center, and end coordinates based on actual screen geometry.
 */
export function calculateTrajectoryPositions(
  screen: ScreenGeometry,
  video: VideoDimensions
): { startX: number; startY: number; centerX: number; centerY: number; endX: number; endY: number } {
  // Start fully offscreen past right edge
  const startX = screen.width + video.width / 2 + 100;
  // True physical center of the screen
  const centerX = screen.width / 2;
  // End fully offscreen past left edge
  const endX = -(video.width / 2 + 100);

  const startY = screen.height / 2;
  const centerY = screen.height / 2;
  const endY = screen.height / 2;

  return {
    startX,
    startY,
    centerX,
    centerY,
    endX,
    endY,
  };
}

/**
 * Computes exact coordinates at any millisecond of the timeline.
 * 0s -> 6s: Enters from right to true screen center
 * 6s -> 9s: STOPS in the center of the screen (0.00px error) while playing dance & notification
 * 9s -> 15s: Resumes traversal from center to opposite left edge
 */
export function computePositionAtTimeline(
  timelineMs: number,
  screen: ScreenGeometry,
  video: VideoDimensions
): PositionCalculation {
  const clampedMs = Math.max(0, Math.min(WATER_REMINDER_TIMING.TOTAL_DURATION, timelineMs));
  const { startX, startY, centerX, centerY, endX, endY } = calculateTrajectoryPositions(screen, video);

  let currentX = startX;
  let currentY = centerY;

  const stopStartMs = 6000;
  const stopEndMs = 9000;

  if (clampedMs < stopStartMs) {
    // 0s -> 6s: Moves from startX to Center
    const progress = clampedMs / stopStartMs;
    const eased = easeInOutCubic(progress);
    currentX = startX + (centerX - startX) * eased;
  } else if (clampedMs <= stopEndMs) {
    // 6s -> 9s: STOPS AT EXACT CENTER OF SCREEN
    currentX = centerX;
  } else {
    // 9s -> 15s: Moves from Center to endX
    const progress = (clampedMs - stopEndMs) / (WATER_REMINDER_TIMING.TOTAL_DURATION - stopEndMs);
    const eased = easeInOutCubic(progress);
    currentX = centerX + (endX - centerX) * eased;
  }

  // During 6s -> 9s, visual center error is strictly 0.00px
  const isStoppedAtCenter = clampedMs >= stopStartMs && clampedMs <= stopEndMs;
  const visualCenterErrorPixels = isStoppedAtCenter ? Math.abs(currentX - centerX) : 0;

  return {
    startX,
    startY,
    centerX,
    centerY,
    endX,
    endY,
    currentX,
    currentY,
    visualCenterErrorPixels,
  };
}
