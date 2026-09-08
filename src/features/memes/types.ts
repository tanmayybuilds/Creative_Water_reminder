/**
 * LOCKIN - Meme System Type Definitions
 * 
 * 100% offline, local-first typed registry, player, and movement profile interfaces.
 */

export type MemeId =
  | "gucci_dance"
  | "ravi_dance"
  | "dcp_ravi_kishan"
  | "thinking_ravi"
  | "you_have_to_do_it"
  | "weird_dance_nakhre"
  | "flex_look"
  | "koteshwariya_shiv_song"
  | "money_follows_my_brother"
  | "imaandari"
  | "whats_wrong_with_you"
  | "shutup_manoj_tiwari";

export type MemePosition =
  | "center"
  | "top"
  | "topLeft"
  | "topRight"
  | "centerLeft"
  | "centerRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight";

export type EntranceAnimationType =
  | "slideFromLeft"
  | "slideFromRight"
  | "slideFromTop"
  | "slideFromBottom"
  | "pop"
  | "fade"
  | "peekFromLeft"
  | "peekFromRight";

export type ExitAnimationType =
  | "slideToLeft"
  | "slideToRight"
  | "slideToTop"
  | "slideToBottom"
  | "fade"
  | "shrink";

export type MovementProfileType =
  | "crossScreen"
  | "enterAndStop"
  | "popAndReact"
  | "edgePeek"
  | "dropFromTop"
  | "riseFromBottom";

export type TrajectoryDirection =
  | "rightToLeft"
  | "leftToRight"
  | "topToBottom"
  | "bottomToTop"
  | "none";

export interface MovementConfig {
  profile: MovementProfileType;
  direction?: TrajectoryDirection;
  targetPosition: MemePosition;
  overscanMargin?: string; // e.g. "115vw", "115vh"
  syncWithDuration?: boolean;
  defaultDurationSeconds?: number;
  entranceOverride?: EntranceAnimationType;
  exitOverride?: ExitAnimationType;
}

export type AssetFormatMode = "raw" | "processed";

export interface MemeDefinition {
  id: MemeId;
  title: string;
  filename: string; // Base filename without path (e.g. "gucci_dance.mp4")
  character: string;
  category: "dance" | "dialogue" | "reaction" | "song" | "attitude";
  intensity: "chill" | "serious" | "savage" | "brainrot";
  defaultScale: number;
  preferredPositions: MemePosition[];
  defaultEntrance: EntranceAnimationType;
  defaultExit: ExitAnimationType;
  movement: MovementConfig;
  cooldownSeconds: number;
  description: string;
}

export interface PlayMemeOptions {
  position?: MemePosition;
  entrance?: EntranceAnimationType;
  exit?: ExitAnimationType;
  movementProfile?: MovementProfileType;
  trajectoryDirection?: TrajectoryDirection;
  scale?: number;
  volume?: number; // 0.0 to 1.0
  loop?: boolean;
  playbackRate?: number;
  muted?: boolean;
  durationSeconds?: number;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export type PlaybackStage = "idle" | "entering" | "playing" | "exiting";

export interface ActiveMemeState {
  meme: MemeDefinition;
  options: PlayMemeOptions;
  stage: PlaybackStage;
  assetUrl: string;
  startedAt: number;
  isPaused?: boolean;
}
