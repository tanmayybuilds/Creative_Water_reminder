import type { TargetAndTransition, Variant, Transition } from "framer-motion";
import type { EntranceAnimationType, ExitAnimationType } from "./types";

export interface AnimationVariants {
  initial: Variant;
  animate: Variant;
  exit: Variant;
  transition: Transition;
}

const SPRING_TRANSITION: Transition = {
  type: "spring",
  damping: 24,
  stiffness: 220,
  mass: 0.9,
};

const SMOOTH_EASE_TRANSITION: Transition = {
  duration: 0.45,
  ease: [0.25, 0.1, 0.25, 1.0],
};

const BOUNCY_TRANSITION: Transition = {
  type: "spring",
  damping: 15,
  stiffness: 300,
  mass: 0.8,
};

/**
 * Builds composite Framer Motion variants for a given entrance and exit combination.
 */
export function getAnimationVariants(
  entrance: EntranceAnimationType,
  exit: ExitAnimationType
): AnimationVariants {
  let initialVariant: TargetAndTransition = { opacity: 0 };
  let animateVariant: TargetAndTransition = { opacity: 1, x: 0, y: 0, scale: 1 };
  let exitVariant: TargetAndTransition = { opacity: 0 };
  let transition: Transition = SMOOTH_EASE_TRANSITION;

  // 1. Entrance Initial States
  switch (entrance) {
    case "slideFromLeft":
      initialVariant = { x: "-100vw", opacity: 0 };
      transition = SPRING_TRANSITION;
      break;
    case "slideFromRight":
      initialVariant = { x: "100vw", opacity: 0 };
      transition = SPRING_TRANSITION;
      break;
    case "slideFromTop":
      initialVariant = { y: "-100vh", opacity: 0 };
      transition = SPRING_TRANSITION;
      break;
    case "slideFromBottom":
      initialVariant = { y: "100vh", opacity: 0 };
      transition = SPRING_TRANSITION;
      break;
    case "pop":
      initialVariant = { scale: 0.15, opacity: 0 };
      transition = BOUNCY_TRANSITION;
      break;
    case "fade":
      initialVariant = { opacity: 0 };
      transition = SMOOTH_EASE_TRANSITION;
      break;
    case "peekFromLeft":
      initialVariant = { x: "-70%", opacity: 0 };
      transition = SPRING_TRANSITION;
      break;
    case "peekFromRight":
      initialVariant = { x: "70%", opacity: 0 };
      transition = SPRING_TRANSITION;
      break;
    default:
      initialVariant = { opacity: 0 };
      transition = SMOOTH_EASE_TRANSITION;
  }

  // 2. Exit States
  switch (exit) {
    case "slideToLeft":
      exitVariant = { x: "-100vw", opacity: 0 };
      break;
    case "slideToRight":
      exitVariant = { x: "100vw", opacity: 0 };
      break;
    case "slideToTop":
      exitVariant = { y: "-100vh", opacity: 0 };
      break;
    case "slideToBottom":
      exitVariant = { y: "100vh", opacity: 0 };
      break;
    case "fade":
      exitVariant = { opacity: 0 };
      break;
    case "shrink":
      exitVariant = { scale: 0.1, opacity: 0 };
      break;
    default:
      exitVariant = { opacity: 0 };
  }

  return {
    initial: initialVariant,
    animate: animateVariant,
    exit: exitVariant,
    transition,
  };
}
