import type { MemePosition } from "./types";

export interface PositionStyles {
  containerClassName: string;
  transformOrigin: string;
  horizontalAlign: "center" | "left" | "right";
  verticalAlign: "center" | "top" | "bottom";
  safeMargin: string;
}

/**
 * Maps named positions to exact full-viewport Flexbox layout wrappers.
 * The overlay occupies the entire visible application viewport (fixed inset-0 w-screen h-screen)
 * and positions the meme without relying on parent element boundaries or hardcoded pixel offsets.
 */
export const POSITION_CONFIGS: Record<MemePosition, PositionStyles> = {
  center: {
    containerClassName: "fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none",
    transformOrigin: "center center",
    horizontalAlign: "center",
    verticalAlign: "center",
    safeMargin: "0px",
  },
  top: {
    containerClassName: "fixed inset-x-0 top-0 pt-6 sm:pt-8 flex items-start justify-center pointer-events-none",
    transformOrigin: "top center",
    horizontalAlign: "center",
    verticalAlign: "top",
    safeMargin: "24px",
  },
  topLeft: {
    containerClassName: "fixed top-0 left-0 p-6 sm:p-8 flex items-start justify-start pointer-events-none",
    transformOrigin: "top left",
    horizontalAlign: "left",
    verticalAlign: "top",
    safeMargin: "24px",
  },
  topRight: {
    containerClassName: "fixed top-0 right-0 p-6 sm:p-8 flex items-start justify-end pointer-events-none",
    transformOrigin: "top right",
    horizontalAlign: "right",
    verticalAlign: "top",
    safeMargin: "24px",
  },
  centerLeft: {
    containerClassName: "fixed inset-y-0 left-0 pl-6 sm:pl-8 flex items-center justify-start pointer-events-none",
    transformOrigin: "center left",
    horizontalAlign: "left",
    verticalAlign: "center",
    safeMargin: "24px",
  },
  centerRight: {
    containerClassName: "fixed inset-y-0 right-0 pr-6 sm:pr-8 flex items-center justify-end pointer-events-none",
    transformOrigin: "center right",
    horizontalAlign: "right",
    verticalAlign: "center",
    safeMargin: "24px",
  },
  bottom: {
    containerClassName: "fixed inset-x-0 bottom-0 pb-6 sm:pb-8 flex items-end justify-center pointer-events-none",
    transformOrigin: "bottom center",
    horizontalAlign: "center",
    verticalAlign: "bottom",
    safeMargin: "24px",
  },
  bottomLeft: {
    containerClassName: "fixed bottom-0 left-0 p-6 sm:p-8 flex items-end justify-start pointer-events-none",
    transformOrigin: "bottom left",
    horizontalAlign: "left",
    verticalAlign: "bottom",
    safeMargin: "24px",
  },
  bottomRight: {
    containerClassName: "fixed bottom-0 right-0 p-6 sm:p-8 flex items-end justify-end pointer-events-none",
    transformOrigin: "bottom right",
    horizontalAlign: "right",
    verticalAlign: "bottom",
    safeMargin: "24px",
  },
};

export function getPositionStyles(position: MemePosition): PositionStyles {
  return POSITION_CONFIGS[position] || POSITION_CONFIGS.center;
}

/**
 * Computes bounding box visual coordinates for verification and testing.
 * Verifies that the mathematical center of the meme box coincides with the viewport center.
 */
export function calculateBoundingBoxCoordinates(
  position: MemePosition,
  viewport: { width: number; height: number },
  element: { width: number; height: number },
  margin: number = 24
): { left: number; top: number; centerX: number; centerY: number } {
  let left = 0;
  let top = 0;

  switch (position) {
    case "center":
      left = (viewport.width - element.width) / 2;
      top = (viewport.height - element.height) / 2;
      break;
    case "top":
      left = (viewport.width - element.width) / 2;
      top = margin;
      break;
    case "topLeft":
      left = margin;
      top = margin;
      break;
    case "topRight":
      left = viewport.width - element.width - margin;
      top = margin;
      break;
    case "centerLeft":
      left = margin;
      top = (viewport.height - element.height) / 2;
      break;
    case "centerRight":
      left = viewport.width - element.width - margin;
      top = (viewport.height - element.height) / 2;
      break;
    case "bottom":
      left = (viewport.width - element.width) / 2;
      top = viewport.height - element.height - margin;
      break;
    case "bottomLeft":
      left = margin;
      top = viewport.height - element.height - margin;
      break;
    case "bottomRight":
      left = viewport.width - element.width - margin;
      top = viewport.height - element.height - margin;
      break;
  }

  const centerX = left + element.width / 2;
  const centerY = top + element.height / 2;

  return { left, top, centerX, centerY };
}
