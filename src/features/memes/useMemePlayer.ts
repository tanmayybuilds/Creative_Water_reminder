import { useCallback } from "react";
import { useMemeStore } from "./memeStore";
import type { MemeId, PlayMemeOptions } from "./types";
import { getAllMemes, getMeme } from "./registry";

/**
 * Reusable hook for components to control and monitor meme playback.
 */
export function useMemePlayer() {
  const activeMeme = useMemeStore((s) => s.activeMeme);
  const globalVolume = useMemeStore((s) => s.globalVolume);
  const isMuted = useMemeStore((s) => s.isMuted);
  const playbackRate = useMemeStore((s) => s.playbackRate);
  const isLooping = useMemeStore((s) => s.isLooping);

  const playMemeAction = useMemeStore((s) => s.playMeme);
  const stopMemeAction = useMemeStore((s) => s.stopMeme);
  const togglePauseAction = useMemeStore((s) => s.togglePause);
  const setGlobalVolume = useMemeStore((s) => s.setGlobalVolume);
  const setMuted = useMemeStore((s) => s.setMuted);
  const setPlaybackRate = useMemeStore((s) => s.setPlaybackRate);
  const setLooping = useMemeStore((s) => s.setLooping);

  const play = useCallback(
    (id: MemeId, options?: PlayMemeOptions) => {
      return playMemeAction(id, options);
    },
    [playMemeAction]
  );

  const stop = useCallback(() => {
    stopMemeAction();
  }, [stopMemeAction]);

  const togglePause = useCallback(() => {
    togglePauseAction();
  }, [togglePauseAction]);

  return {
    activeMeme,
    isPlaying: activeMeme !== null && activeMeme.stage !== "idle",
    isPaused: activeMeme?.isPaused ?? false,
    stage: activeMeme?.stage ?? "idle",
    globalVolume,
    isMuted,
    playbackRate,
    isLooping,
    play,
    stop,
    togglePause,
    setGlobalVolume,
    setMuted,
    setPlaybackRate,
    setLooping,
    allMemes: getAllMemes(),
    getMemeDefinition: getMeme,
  };
}
