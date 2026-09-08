import type { MemeDefinition, MemeId } from "./types";

/**
 * Master Registry of all 11 local Ravi Kishan meme assets.
 * 100% offline. Zero third-party or external meme dependencies.
 * Each meme defines its strategic movement profile, direction, and viewport targets.
 */
export const MEME_REGISTRY: Record<MemeId, MemeDefinition> = {
  gucci_dance: {
    id: "gucci_dance",
    title: "Gucci Dance",
    filename: "gucci_dance.mp4",
    character: "Ravi Kishan",
    category: "dance",
    intensity: "brainrot",
    defaultScale: 1.0,
    preferredPositions: ["center", "bottom", "bottomRight"],
    defaultEntrance: "slideFromRight",
    defaultExit: "slideToLeft",
    movement: {
      profile: "crossScreen",
      direction: "rightToLeft", // RIGHT → CENTER → LEFT (Flagship Trajectory)
      targetPosition: "center",
      overscanMargin: "115vw",
      syncWithDuration: true,
      defaultDurationSeconds: 4.5,
      exitOverride: "slideToLeft",
    },
    cooldownSeconds: 60,
    description: "Ravi Kishan signature energetic Gucci dance step traveling continuously across the screen.",
  },
  ravi_dance: {
    id: "ravi_dance",
    title: "Ravi Dance (Loop)",
    filename: "gucci_dance.mp4",
    character: "Ravi Kishan",
    category: "dance",
    intensity: "brainrot",
    defaultScale: 1.0,
    preferredPositions: ["center"],
    defaultEntrance: "slideFromRight",
    defaultExit: "slideToLeft",
    movement: {
      profile: "crossScreen",
      direction: "rightToLeft",
      targetPosition: "center",
      overscanMargin: "120vw",
      syncWithDuration: false,
      defaultDurationSeconds: 5.8,
      exitOverride: "slideToLeft",
    },
    cooldownSeconds: 30,
    description: "Dedicated transparent looping Ravi dance asset with in-place choreography.",
  },
  dcp_ravi_kishan: {
    id: "dcp_ravi_kishan",
    title: "DCP Ravi Kishan",
    filename: "dcp_ravi_kishan.mp4",
    character: "Ravi Kishan",
    category: "dialogue",
    intensity: "serious",
    defaultScale: 1.0,
    preferredPositions: ["center", "centerLeft"],
    defaultEntrance: "slideFromRight",
    defaultExit: "fade",
    movement: {
      profile: "enterAndStop",
      direction: "rightToLeft", // RIGHT → CENTER
      targetPosition: "center",
      overscanMargin: "110vw",
      exitOverride: "fade",
    },
    cooldownSeconds: 90,
    description: "Authoritative DCP police officer demeanor entering from right to center.",
  },
  thinking_ravi: {
    id: "thinking_ravi",
    title: "Thinking Ravi",
    filename: "thinking_ravi.mp4",
    character: "Ravi Kishan",
    category: "reaction",
    intensity: "chill",
    defaultScale: 1.0,
    preferredPositions: ["topRight", "centerRight", "bottomRight"],
    defaultEntrance: "pop",
    defaultExit: "shrink",
    movement: {
      profile: "popAndReact",
      direction: "none",
      targetPosition: "topRight",
      exitOverride: "shrink",
    },
    cooldownSeconds: 45,
    description: "Curious and contemplative thinking expression popping into top-right.",
  },
  you_have_to_do_it: {
    id: "you_have_to_do_it",
    title: "You Have To Do It",
    filename: "you_have_to_do_it.mp4",
    character: "Ravi Kishan",
    category: "dialogue",
    intensity: "serious",
    defaultScale: 1.0,
    preferredPositions: ["center", "top"],
    defaultEntrance: "slideFromTop",
    defaultExit: "slideToBottom",
    movement: {
      profile: "dropFromTop",
      direction: "topToBottom", // TOP → CENTER
      targetPosition: "center",
      exitOverride: "slideToBottom",
    },
    cooldownSeconds: 60,
    description: "Motivational command dropping in from above to center.",
  },
  weird_dance_nakhre: {
    id: "weird_dance_nakhre",
    title: "Weird Dance Nakhre",
    filename: "weird_dance_nakhre.mp4",
    character: "Ravi Kishan",
    category: "dance",
    intensity: "brainrot",
    defaultScale: 1.0,
    preferredPositions: ["center", "bottomLeft", "bottomRight"],
    defaultEntrance: "slideFromLeft",
    defaultExit: "slideToRight",
    movement: {
      profile: "crossScreen",
      direction: "leftToRight", // LEFT → CENTER → RIGHT (Opposite to Gucci)
      targetPosition: "center",
      overscanMargin: "115vw",
      syncWithDuration: true,
      defaultDurationSeconds: 4.0,
      exitOverride: "slideToRight",
    },
    cooldownSeconds: 75,
    description: "Expressive theatrical dance traveling continuously from left to right.",
  },
  flex_look: {
    id: "flex_look",
    title: "Flex Look",
    filename: "flex_look.mp4",
    character: "Ravi Kishan",
    category: "attitude",
    intensity: "savage",
    defaultScale: 1.0,
    preferredPositions: ["center", "centerRight", "bottomRight"],
    defaultEntrance: "slideFromLeft",
    defaultExit: "slideToRight",
    movement: {
      profile: "enterAndStop",
      direction: "leftToRight", // LEFT → CENTER
      targetPosition: "center",
      exitOverride: "slideToRight",
    },
    cooldownSeconds: 60,
    description: "Confident swagger and stylish flex entering left to center, exiting right.",
  },
  koteshwariya_shiv_song: {
    id: "koteshwariya_shiv_song",
    title: "Koteshwariya Shiv Song",
    filename: "koteshwariya_shiv_song.mp4",
    character: "Ravi Kishan",
    category: "song",
    intensity: "savage",
    defaultScale: 1.0,
    preferredPositions: ["center", "bottom"],
    defaultEntrance: "slideFromBottom",
    defaultExit: "slideToTop",
    movement: {
      profile: "riseFromBottom",
      direction: "bottomToTop", // BOTTOM → CENTER
      targetPosition: "center",
      exitOverride: "slideToTop", // Rises upward
    },
    cooldownSeconds: 90,
    description: "High-energy devotional dance rising from bottom to center and exiting upward.",
  },
  money_follows_my_brother: {
    id: "money_follows_my_brother",
    title: "Money Follows My Brother",
    filename: "money_follows_my_brother.mp4",
    character: "Ravi Kishan",
    category: "dialogue",
    intensity: "chill",
    defaultScale: 1.0,
    preferredPositions: ["bottomRight", "centerRight", "center"],
    defaultEntrance: "pop",
    defaultExit: "shrink",
    movement: {
      profile: "popAndReact",
      direction: "none",
      targetPosition: "bottomRight",
      exitOverride: "shrink",
    },
    cooldownSeconds: 90,
    description: "Money wisdom quote popping into bottom-right position.",
  },
  imaandari: {
    id: "imaandari",
    title: "Imaandari",
    filename: "imaandari.mp4",
    character: "Ravi Kishan",
    category: "dialogue",
    intensity: "serious",
    defaultScale: 1.0,
    preferredPositions: ["center", "centerLeft"],
    defaultEntrance: "slideFromLeft",
    defaultExit: "slideToLeft",
    movement: {
      profile: "enterAndStop",
      direction: "leftToRight", // LEFT → CENTER
      targetPosition: "center",
      exitOverride: "slideToLeft",
    },
    cooldownSeconds: 120,
    description: "Honesty and hard work monologue entering left to center, exiting left.",
  },
  whats_wrong_with_you: {
    id: "whats_wrong_with_you",
    title: "What's Wrong With You",
    filename: "whats_wrong_with_you.mp4",
    character: "Ravi Kishan",
    category: "reaction",
    intensity: "savage",
    defaultScale: 1.0,
    preferredPositions: ["center"],
    defaultEntrance: "pop",
    defaultExit: "fade",
    movement: {
      profile: "popAndReact",
      direction: "none",
      targetPosition: "center", // EXACT CENTER
      exitOverride: "fade",
    },
    cooldownSeconds: 30,
    description: "Strong incredulous roast reaction popping in at exact center.",
  },
  shutup_manoj_tiwari: {
    id: "shutup_manoj_tiwari",
    title: "Shut Up Manoj Tiwari",
    filename: "shutup_manoj_tiwari.mp4",
    character: "Ravi Kishan & Manoj Tiwari",
    category: "dialogue",
    intensity: "savage",
    defaultScale: 1.0,
    preferredPositions: ["center"],
    defaultEntrance: "pop",
    defaultExit: "fade",
    movement: {
      profile: "popAndReact",
      direction: "none",
      targetPosition: "center", // EXACT CENTER
      exitOverride: "fade",
    },
    cooldownSeconds: 120,
    description: "Special final confrontation with Manoj Tiwari at exact center (excluded from normal selection).",
  },
};

/**
 * Helper to fetch a single definition safely.
 */
export function getMeme(id: MemeId): MemeDefinition | undefined {
  return MEME_REGISTRY[id];
}

/**
 * Returns an array of all registered memes.
 */
export function getAllMemes(): MemeDefinition[] {
  return Object.values(MEME_REGISTRY);
}
