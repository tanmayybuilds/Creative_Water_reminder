import { create } from "zustand";

export type PrototypePhase =
  | "IDLE"
  | "ENTERING"
  | "PAUSED_AT_CENTER"
  | "EXITING"
  | "COMPLETED";

export type PrototypeSpeedPreset = "FAST" | "NORMAL" | "CINEMATIC";

export interface RaviPrototypeState {
  phase: PrototypePhase;
  speedPreset: PrototypeSpeedPreset;
  entranceDuration: number; // in seconds
  pauseDuration: number; // in seconds
  exitDuration: number; // in seconds
  scale: number;
  volume: number;
  isMuted: boolean;
  showCenterCrosshair: boolean;
  showNotification: boolean;
  notificationText: string;
  playCount: number;

  // Actions
  play: () => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  stop: () => void;
  replay: () => void;
  setPhase: (phase: PrototypePhase) => void;
  setSpeedPreset: (preset: PrototypeSpeedPreset) => void;
  setPauseDuration: (seconds: number) => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  toggleCrosshair: () => void;
  toggleNotification: () => void;
}

export const useRaviPrototypeStore = create<RaviPrototypeState>((set, get) => ({
  phase: "IDLE",
  speedPreset: "NORMAL",
  entranceDuration: 2.5,
  pauseDuration: 4.0,
  exitDuration: 2.5,
  scale: 1.0,
  volume: 0.8,
  isMuted: false,
  showCenterCrosshair: false,
  showNotification: true,
  notificationText: "💧 DRINK WATER",
  playCount: 0,

  play: () => {
    set((state) => ({
      phase: "ENTERING",
      playCount: state.playCount + 1,
    }));
  },

  pauseAnimation: () => {
    // Keeps current phase but stops advancement if needed
  },

  resumeAnimation: () => {
    // Resumes
  },

  stop: () => {
    set({ phase: "IDLE" });
  },

  replay: () => {
    set((state) => ({
      phase: "IDLE",
    }));
    setTimeout(() => {
      set((state) => ({
        phase: "ENTERING",
        playCount: state.playCount + 1,
      }));
    }, 50);
  },

  setPhase: (phase) => set({ phase }),

  setSpeedPreset: (preset) => {
    switch (preset) {
      case "FAST":
        set({
          speedPreset: "FAST",
          entranceDuration: 1.5,
          pauseDuration: 2.5,
          exitDuration: 1.5,
        });
        break;
      case "CINEMATIC":
        set({
          speedPreset: "CINEMATIC",
          entranceDuration: 4.0,
          pauseDuration: 6.0,
          exitDuration: 4.0,
        });
        break;
      case "NORMAL":
      default:
        set({
          speedPreset: "NORMAL",
          entranceDuration: 2.5,
          pauseDuration: 4.0,
          exitDuration: 2.5,
        });
        break;
    }
  },

  setPauseDuration: (seconds) => set({ pauseDuration: Math.max(0.5, seconds) }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),

  toggleCrosshair: () => set((state) => ({ showCenterCrosshair: !state.showCenterCrosshair })),

  toggleNotification: () => set((state) => ({ showNotification: !state.showNotification })),
}));
