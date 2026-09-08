import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemeStore } from "../memeStore";
import { getPositionStyles } from "../positions";
import { getAnimationVariants } from "../animations";
import { calculateMovementMotionVariants } from "../movement";
import type { MovementConfig } from "../types";
import { X, Volume2, VolumeX, Pause, Play, Sparkles, Navigation } from "lucide-react";

export const MemeOverlay: React.FC = () => {
  const activeMeme = useMemeStore((s) => s.activeMeme);
  const handleVideoEnded = useMemeStore((s) => s.handleVideoEnded);
  const handleVideoError = useMemeStore((s) => s.handleVideoError);
  const stopMeme = useMemeStore((s) => s.stopMeme);
  const togglePause = useMemeStore((s) => s.togglePause);
  const setMuted = useMemeStore((s) => s.setMuted);
  const setStage = useMemeStore((s) => s.setStage);
  const isMuted = useMemeStore((s) => s.isMuted);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const position = activeMeme?.options.position || activeMeme?.meme.movement.targetPosition || "center";
  const entrance = activeMeme?.options.entrance || activeMeme?.meme.defaultEntrance || "pop";
  const exit = activeMeme?.options.exit || activeMeme?.meme.defaultExit || "fade";
  const scale = activeMeme?.options.scale ?? activeMeme?.meme.defaultScale ?? 1.0;
  const volume = activeMeme?.options.volume ?? 1.0;
  const loop = activeMeme?.options.loop ?? false;
  const playbackRate = activeMeme?.options.playbackRate ?? 1.0;
  const isPaused = activeMeme?.isPaused ?? false;

  const positionStyles = getPositionStyles(position);

  // Compute Movement Profile Variants
  const movementMotion = useMemo(() => {
    if (!activeMeme) return null;
    const movementConfig: MovementConfig = {
      ...activeMeme.meme.movement,
      profile: activeMeme.options.movementProfile || activeMeme.meme.movement.profile,
      direction: activeMeme.options.trajectoryDirection || activeMeme.meme.movement.direction,
      targetPosition: position,
      exitOverride: exit,
    };
    const effectiveDuration = duration > 0 ? duration : (activeMeme.meme.movement.defaultDurationSeconds || 4.0);
    return calculateMovementMotionVariants(movementConfig, effectiveDuration);
  }, [activeMeme?.meme.id, activeMeme?.options.movementProfile, activeMeme?.options.trajectoryDirection, position, exit, duration]);

  // Fallback entrance/exit animation variants if movementMotion is not available
  const fallbackAnimationVariants = getAnimationVariants(entrance, exit);

  const activeVariants = movementMotion || {
    initial: fallbackAnimationVariants.initial,
    animate: fallbackAnimationVariants.animate,
    exit: fallbackAnimationVariants.exit,
    transition: fallbackAnimationVariants.transition,
    profile: "enterAndStop",
    direction: "none",
    isContinuousTrajectory: false,
  };

  // Sync video audio volume, playbackRate, and mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.loop = loop;
    }
  }, [volume, isMuted, playbackRate, loop, activeMeme?.assetUrl]);

  // Sync video pause / play state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.pause();
    } else if (activeMeme && activeMeme.stage !== "exiting") {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[MemeOverlay] Autoplay interrupted or prevented:", err);
          if (videoRef.current && !videoRef.current.muted) {
            videoRef.current.muted = true;
            videoRef.current.play().catch((e) => console.error("Muted autoplay fallback error:", e));
          }
        });
      }
    }
  }, [isPaused, activeMeme?.assetUrl, activeMeme?.startedAt]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const loadedDuration = videoRef.current.duration || 0;
      setDuration(loadedDuration);
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.muted = isMuted;
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
      videoRef.current.play().catch((err) => console.warn("Autoplay notice:", err));
    }
  };

  const isVisible = activeMeme !== null && activeMeme.stage !== "exiting";

  return (
    <div
      aria-hidden={!isVisible}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[999] overflow-hidden select-none"
    >
      <AnimatePresence
        mode="sync"
        onExitComplete={() => {
          setStage("idle");
        }}
      >
        {isVisible && (
          <div className={`${positionStyles.containerClassName}`}>
            <motion.div
              key={`${activeMeme.meme.id}-${activeMeme.startedAt}`}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: activeVariants.initial,
                animate: activeVariants.animate,
                exit: activeVariants.exit,
              }}
              transition={activeVariants.transition}
              onAnimationComplete={(definition) => {
                if (definition === "animate") {
                  setStage("playing");
                  // If continuous cross-screen movement ends, trigger video ended
                  if (activeVariants.isContinuousTrajectory && !loop) {
                    handleVideoEnded();
                  }
                }
              }}
              style={{
                transformOrigin: positionStyles.transformOrigin,
              }}
              className="flex items-center justify-center pointer-events-auto"
            >
              {/* Scaled Video Frame Wrapper */}
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)] border border-white/15 bg-black/90 transition-transform duration-200"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: positionStyles.transformOrigin,
                  maxWidth: "90vw",
                  maxHeight: "82vh",
                }}
              >
                {/* Top Video Overlay HUD (appears on hover) */}
                <div
                  className={`absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white font-mono leading-tight">
                        {activeMeme.meme.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono capitalize flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 text-amber-400" />
                        {activeVariants.profile}
                        {activeVariants.direction !== "none" ? ` (${activeVariants.direction})` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={togglePause}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title={isPaused ? "Resume" : "Pause"}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={stopMeme}
                      className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-200 transition-colors cursor-pointer"
                      title="Close Meme"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main HTML5 Video Element */}
                <video
                  ref={videoRef}
                  src={activeMeme.assetUrl}
                  autoPlay
                  playsInline
                  controls={false}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  onError={(e) => handleVideoError(e)}
                  className="w-auto h-auto max-w-[85vw] max-h-[75vh] object-contain rounded-3xl block"
                />

                {/* Bottom Progress Bar & Time */}
                <div
                  className={`absolute bottom-0 inset-x-0 z-20 p-2 bg-gradient-to-t from-black/85 to-transparent flex flex-col gap-1 transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300 px-1">
                    <span>{currentTime.toFixed(1)}s</span>
                    <span>{duration.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
