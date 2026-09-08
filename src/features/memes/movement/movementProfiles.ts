import type { TargetAndTransition, Transition } from "framer-motion";
import type {
  MovementProfileType,
  TrajectoryDirection,
  MovementConfig,
} from "../types";

export interface MovementMotionDefinition {
  profile: MovementProfileType;
  direction: TrajectoryDirection;
  isContinuousTrajectory: boolean;
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}

const SPRING_TRANSITION: Transition = {
  type: "spring",
  damping: 24,
  stiffness: 220,
  mass: 0.9,
};

const BOUNCY_POP_TRANSITION: Transition = {
  type: "spring",
  damping: 14,
  stiffness: 280,
  mass: 0.8,
};

const SMOOTH_EASE_TRANSITION: Transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1.0],
};

/**
 * Calculates continuous keyframes for crossScreen trajectories.
 * Guarantees overscan so the meme begins and ends completely outside the viewport.
 */
export function getContinuousCrossScreenKeyframes(
  direction: TrajectoryDirection = "rightToLeft",
  overscanMargin: string = "115vw"
): { initialX: string; targetX: string | string[]; animateValues: string[] } {
  if (direction === "leftToRight") {
    const startX = `-${overscanMargin}`;
    const endX = overscanMargin;
    return {
      initialX: startX,
      targetX: [startX, "0vw", endX],
      animateValues: [startX, endX],
    };
  }

  // Default: rightToLeft
  const startX = overscanMargin;
  const endX = `-${overscanMargin}`;
  return {
    initialX: startX,
    targetX: [startX, "0vw", endX],
    animateValues: [startX, endX],
  };
}

/**
 * Builds Framer Motion animation definitions for any movement profile.
 * Synchronizes duration for continuous cross-screen traversal.
 */
export function calculateMovementMotionVariants(
  config: MovementConfig,
  durationSeconds: number = 4.0
): MovementMotionDefinition {
  const overscan = config.overscanMargin || "115vw";
  const verticalOverscan = "115vh";
  const direction = config.direction || "rightToLeft";
  const validDuration = Math.max(1.5, durationSeconds);

  switch (config.profile) {
    // 1. Continuous Cross-Screen Traversal (Flagship Profile)
    case "crossScreen": {
      const keyframes = getContinuousCrossScreenKeyframes(direction, overscan);
      return {
        profile: "crossScreen",
        direction,
        isContinuousTrajectory: true,
        initial: {
          x: keyframes.initialX,
          opacity: 1,
          scale: 1,
        },
        animate: {
          x: keyframes.animateValues[1],
          opacity: 1,
          scale: 1,
        },
        exit: {
          opacity: 0,
        },
        transition: {
          duration: validDuration,
          ease: "linear", // Smooth continuous movement across screen
        },
      };
    }

    // 2. Enter From Edge And Stop at Target Position
    case "enterAndStop": {
      const startX = direction === "rightToLeft" ? overscan : `-${overscan}`;
      const exitX = config.exitOverride === "slideToRight" ? overscan : `-${overscan}`;
      return {
        profile: "enterAndStop",
        direction,
        isContinuousTrajectory: false,
        initial: {
          x: startX,
          opacity: 0,
          scale: 1,
        },
        animate: {
          x: 0,
          opacity: 1,
          scale: 1,
        },
        exit: config.exitOverride === "fade" ? { opacity: 0 } : { x: exitX, opacity: 0 },
        transition: SPRING_TRANSITION,
      };
    }

    // 3. Pop And React (Scale 0.1 -> 1.0 Spring)
    case "popAndReact": {
      return {
        profile: "popAndReact",
        direction: "none",
        isContinuousTrajectory: false,
        initial: {
          scale: 0.1,
          opacity: 0,
          x: 0,
          y: 0,
        },
        animate: {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
        },
        exit: config.exitOverride === "shrink" ? { scale: 0.1, opacity: 0 } : { opacity: 0 },
        transition: BOUNCY_POP_TRANSITION,
      };
    }

    // 4. Edge Peek (Partially enter from edge and return)
    case "edgePeek": {
      const isRight = direction === "rightToLeft";
      return {
        profile: "edgePeek",
        direction,
        isContinuousTrajectory: false,
        initial: {
          x: isRight ? "80%" : "-80%",
          opacity: 0,
        },
        animate: {
          x: "0%",
          opacity: 1,
        },
        exit: {
          x: isRight ? "80%" : "-80%",
          opacity: 0,
        },
        transition: SPRING_TRANSITION,
      };
    }

    // 5. Drop From Top
    case "dropFromTop": {
      return {
        profile: "dropFromTop",
        direction: "topToBottom",
        isContinuousTrajectory: false,
        initial: {
          y: `-${verticalOverscan}`,
          opacity: 0,
        },
        animate: {
          y: 0,
          opacity: 1,
        },
        exit: config.exitOverride === "slideToBottom" ? { y: verticalOverscan, opacity: 0 } : { y: `-${verticalOverscan}`, opacity: 0 },
        transition: SPRING_TRANSITION,
      };
    }

    // 6. Rise From Bottom
    case "riseFromBottom": {
      return {
        profile: "riseFromBottom",
        direction: "bottomToTop",
        isContinuousTrajectory: false,
        initial: {
          y: verticalOverscan,
          opacity: 0,
        },
        animate: {
          y: 0,
          opacity: 1,
        },
        exit: config.exitOverride === "slideToTop" ? { y: `-${verticalOverscan}`, opacity: 0 } : { y: verticalOverscan, opacity: 0 },
        transition: SPRING_TRANSITION,
      };
    }

    default:
      return {
        profile: "popAndReact",
        direction: "none",
        isContinuousTrajectory: false,
        initial: { scale: 0.1, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { opacity: 0 },
        transition: SMOOTH_EASE_TRANSITION,
      };
  }
}
