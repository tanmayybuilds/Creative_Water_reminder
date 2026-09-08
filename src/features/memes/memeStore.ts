import { create } from "zustand";
import type {
  MemeId,
  ActiveMemeState,
  PlayMemeOptions,
  PlaybackStage,
} from "./types";
import { getMeme } from "./registry";
import { MemeAssetProvider } from "./assetProvider";

interface MemeStoreState {
  activeMeme: ActiveMemeState | null;
  globalVolume: number;
  isMuted: boolean;
  playbackRate: number;
  isLooping: boolean;
  playMeme: (id: MemeId, options?: PlayMemeOptions) => Promise<boolean>;
  stopMeme: () => void;
  togglePause: () => void;
  setStage: (stage: PlaybackStage) => void;
  setGlobalVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setLooping: (loop: boolean) => void;
  handleVideoEnded: () => void;
  handleVideoError: (err: unknown) => void;
}

export const useMemeStore = create<MemeStoreState>((set, get) => ({
  activeMeme: null,
  globalVolume: 1.0,
  isMuted: false,
  playbackRate: 1.0,
  isLooping: false,

  playMeme: async (id: MemeId, options: PlayMemeOptions = {}) => {
    const meme = getMeme(id);
    if (!meme) {
      console.warn(`[MemeStore] Meme with id "${id}" not found in registry.`);
      return false;
    }

    const { activeMeme, globalVolume, isMuted, playbackRate, isLooping } = get();

    // Concurrency Guard: Cleanly notify previous meme onComplete if interrupted
    if (activeMeme?.options.onComplete) {
      try {
        activeMeme.options.onComplete();
      } catch (e) {
        console.error("[MemeStore] Error in previous meme onComplete callback:", e);
      }
    }

    const assetUrl = MemeAssetProvider.resolveUrl(meme);

    const mergedOptions: PlayMemeOptions = {
      position: options.position || meme.preferredPositions[0] || "center",
      entrance: options.entrance || meme.defaultEntrance || "pop",
      exit: options.exit || meme.defaultExit || "fade",
      scale: options.scale ?? meme.defaultScale ?? 1.0,
      volume: options.volume ?? globalVolume ?? 1.0,
      loop: options.loop ?? isLooping,
      playbackRate: options.playbackRate ?? playbackRate,
      muted: options.muted ?? isMuted,
      onStart: options.onStart,
      onComplete: options.onComplete,
      onError: options.onError,
    };

    set({
      activeMeme: {
        meme,
        options: mergedOptions,
        stage: "entering",
        assetUrl,
        startedAt: Date.now(),
        isPaused: false,
      },
    });

    if (mergedOptions.onStart) {
      try {
        mergedOptions.onStart();
      } catch (e) {
        console.error("[MemeStore] Error in onStart callback:", e);
      }
    }

    return true;
  },

  stopMeme: () => {
    const { activeMeme } = get();
    if (!activeMeme) return;

    // Set to exiting to allow exit animation to complete smoothly
    set({
      activeMeme: {
        ...activeMeme,
        stage: "exiting",
      },
    });
  },

  togglePause: () => {
    const { activeMeme } = get();
    if (!activeMeme) return;

    set({
      activeMeme: {
        ...activeMeme,
        isPaused: !activeMeme.isPaused,
      },
    });
  },

  setStage: (stage: PlaybackStage) => {
    const { activeMeme } = get();
    if (!activeMeme) return;

    if (stage === "idle") {
      if (activeMeme.options.onComplete) {
        try {
          activeMeme.options.onComplete();
        } catch (e) {
          console.error("[MemeStore] Error in onComplete callback:", e);
        }
      }
      set({ activeMeme: null });
    } else {
      set({
        activeMeme: {
          ...activeMeme,
          stage,
        },
      });
    }
  },

  setGlobalVolume: (volume: number) => {
    const vol = Math.max(0, Math.min(1, volume));
    set({ globalVolume: vol });
    const { activeMeme } = get();
    if (activeMeme) {
      set({
        activeMeme: {
          ...activeMeme,
          options: {
            ...activeMeme.options,
            volume: vol,
          },
        },
      });
    }
  },

  setMuted: (muted: boolean) => {
    set({ isMuted: muted });
    const { activeMeme } = get();
    if (activeMeme) {
      set({
        activeMeme: {
          ...activeMeme,
          options: {
            ...activeMeme.options,
            muted,
          },
        },
      });
    }
  },

  setPlaybackRate: (rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(3.0, rate));
    set({ playbackRate: clampedRate });
    const { activeMeme } = get();
    if (activeMeme) {
      set({
        activeMeme: {
          ...activeMeme,
          options: {
            ...activeMeme.options,
            playbackRate: clampedRate,
          },
        },
      });
    }
  },

  setLooping: (loop: boolean) => {
    set({ isLooping: loop });
    const { activeMeme } = get();
    if (activeMeme) {
      set({
        activeMeme: {
          ...activeMeme,
          options: {
            ...activeMeme.options,
            loop,
          },
        },
      });
    }
  },

  handleVideoEnded: () => {
    const { activeMeme } = get();
    if (!activeMeme) return;

    if (activeMeme.options.loop) {
      // If looping, do not exit
      return;
    }

    // Transition to exiting stage for smooth animation completion
    set({
      activeMeme: {
        ...activeMeme,
        stage: "exiting",
      },
    });
  },

  handleVideoError: (err: unknown) => {
    const { activeMeme } = get();
    console.error("[MemeStore] Video playback error:", err);

    if (activeMeme?.options.onError) {
      try {
        activeMeme.options.onError(
          err instanceof Error ? err : new Error("Video playback failed")
        );
      } catch (e) {
        console.error("[MemeStore] Error in onError callback:", e);
      }
    }

    // Clear active meme safely so UI does not crash or remain blocked
    set({ activeMeme: null });
  },
}));
