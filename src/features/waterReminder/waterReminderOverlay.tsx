import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useWaterReminderStore } from "./waterReminderStore";
import {
  getScreenGeometry,
  calculateTrajectoryPositions,
} from "./waterReminderPosition";
import { CartoonTextUnfold } from "./CartoonTextUnfold";
import { Activity } from "lucide-react";

/**
 * Smooth cubic ease-in-out curve for natural walking movement
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Calculates exact relative X coordinate based on video playback timestamp:
 * - 0.0s -> 6.0s: Walk from right offscreen (startXRel) into center (0)
 * - 6.0s -> 9.0s: Stop and dance in screen center (0)
 * - 9.0s -> 15.0s: Walk from center (0) offscreen to the left (endXRel)
 */
function calculateXForTime(t: number, startXRel: number, endXRel: number): number {
  if (t <= 0) return startXRel;
  if (t < 6.0) {
    const p = easeInOutCubic(t / 6.0);
    return startXRel + (0 - startXRel) * p;
  }
  if (t <= 9.0) {
    return 0;
  }
  if (t < 15.0) {
    const p = easeInOutCubic((t - 9.0) / 6.0);
    return 0 + (endXRel - 0) * p;
  }
  return endXRel;
}

interface WaterReminderOverlayProps {
  isDesktopOverlayWindow?: boolean;
}

export const WaterReminderOverlay: React.FC<WaterReminderOverlayProps> = ({
  isDesktopOverlayWindow = false,
}) => {
  // HARD SAFETY GUARD: NEVER render or play any video unless running inside the dedicated desktop transparent overlay window!
  if (!isDesktopOverlayWindow) {
    return null;
  }

  const {
    phase,
    activeMemeId,
    totalRemindersTriggered,
    showDebugHUD,
    showCenterCrosshair,
    handleUserInterruption,
    handleMemeFinished,
    handleSequenceCompleted,
  } = useWaterReminderStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const meme1Ref = useRef<HTMLVideoElement>(null);
  const meme2Ref = useRef<HTMLVideoElement>(null);
  const actorContainerRef = useRef<HTMLDivElement>(null);

  // Screen Geometry
  const [screen, setScreen] = useState(() => getScreenGeometry());
  const [isTextUnfolded, setIsTextUnfolded] = useState(false);

  // Current calculated X position for exact freeze-in-place
  const currentXRef = useRef<number>(0);

  // Exact timestamp for pause/resume
  const savedTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => setScreen(getScreenGeometry());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const videoDimensions = useMemo(
    () => ({
      width: Math.min(screen.width * 0.8, 720),
      height: Math.min(screen.height * 0.8, 720),
      aspectRatio: 1.0,
    }),
    [screen]
  );

  const isVisible = phase !== "IDLE" && phase !== "COMPLETED";
  const isMemePlaying = phase === "MEME_PLAYING";

  // Relative Trajectory Coordinates
  const positions = useMemo(
    () => calculateTrajectoryPositions(screen, videoDimensions),
    [screen, videoDimensions]
  );

  const startXRel = positions.startX - positions.centerX;
  const endXRel = positions.endX - positions.centerX;

  // Initialize position to startXRel
  useEffect(() => {
    currentXRef.current = startXRel;
    if (actorContainerRef.current) {
      actorContainerRef.current.style.transform = `translate3d(${startXRel}px, 0px, 0px)`;
    }
  }, [startXRel]);

  // Sync position with video playback time via requestAnimationFrame with 0-render direct DOM transform
  const updatePosition = useCallback(() => {
    if (!videoRef.current || isMemePlaying) return;

    const t = videoRef.current.currentTime;
    const newX = calculateXForTime(t, startXRel, endXRel);
    currentXRef.current = newX;

    // Direct GPU-accelerated DOM transform: Zero React re-render thrashing
    if (actorContainerRef.current) {
      actorContainerRef.current.style.transform = `translate3d(${newX}px, 0px, 0px)`;
    }

    // Cartoon Text unfold trigger (during center stop 5.8s - 8.8s) - only update state when value changes
    const shouldUnfold = t >= 5.8 && t <= 8.8;
    setIsTextUnfolded((prev) => (prev !== shouldUnfold ? shouldUnfold : prev));

    if (!videoRef.current.paused && !videoRef.current.ended) {
      rafIdRef.current = requestAnimationFrame(updatePosition);
    }
  }, [startXRel, endXRel, isMemePlaying]);

  // Video timeupdate backup listener
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || isMemePlaying || rafIdRef.current) return;
    const t = videoRef.current.currentTime;
    const newX = calculateXForTime(t, startXRel, endXRel);
    currentXRef.current = newX;
    if (actorContainerRef.current) {
      actorContainerRef.current.style.transform = `translate3d(${newX}px, 0px, 0px)`;
    }

    const shouldUnfold = t >= 5.8 && t <= 8.8;
    setIsTextUnfolded((prev) => (prev !== shouldUnfold ? shouldUnfold : prev));
  };

  // Track trigger count to differentiate new starts vs resumes
  const lastTriggeredRef = useRef<number>(0);

  // Playback lifecycle controller
  useEffect(() => {
    if (!videoRef.current) return;

    // Bring Desktop Transparent Overlay on Top of All Other Apps when Reminder triggers
    if (isDesktopOverlayWindow) {
      const api = typeof window !== "undefined" ? (window as unknown as { electronAPI?: { showOverlay?: () => Promise<boolean>; hideOverlay?: () => Promise<boolean> } }).electronAPI : undefined;
      if (isVisible) {
        api?.showOverlay?.()?.catch(() => {});
      } else {
        api?.hideOverlay?.()?.catch(() => {});
      }
    }

    if (isMemePlaying) {
      // 1. HARD PAUSE: Meme is playing — freeze video, mute, and stop animation frame
      videoRef.current.pause();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setIsTextUnfolded(false);
      return;
    }

    if (!isVisible) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setIsTextUnfolded(false);
      return;
    }

    // 2. FRESH START (New reminder trigger)
    if (totalRemindersTriggered !== lastTriggeredRef.current) {
      lastTriggeredRef.current = totalRemindersTriggered;
      videoRef.current.currentTime = 0;
      currentXRef.current = startXRel;
      if (actorContainerRef.current) {
        actorContainerRef.current.style.transform = `translate3d(${startXRel}px, 0px, 0px)`;
      }
      setIsTextUnfolded(false);
      savedTimeRef.current = 0;

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            rafIdRef.current = requestAnimationFrame(updatePosition);
          })
          .catch(() => {});
      }
      return;
    }

    // 3. RESUME from Interruption Meme (Exact frame and position)
    if (savedTimeRef.current > 0) {
      videoRef.current.currentTime = savedTimeRef.current;
      const resumeX = calculateXForTime(savedTimeRef.current, startXRel, endXRel);
      currentXRef.current = resumeX;
      if (actorContainerRef.current) {
        actorContainerRef.current.style.transform = `translate3d(${resumeX}px, 0px, 0px)`;
      }

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            rafIdRef.current = requestAnimationFrame(updatePosition);
          })
          .catch(() => {});
      }
      savedTimeRef.current = 0;
    }
  }, [isVisible, isMemePlaying, totalRemindersTriggered, startXRel, endXRel, updatePosition]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Interruption Click: Freeze immediately, save timestamp & position, trigger meme
  const handleActorClick = () => {
    if (isMemePlaying) return;

    if (videoRef.current) {
      savedTimeRef.current = videoRef.current.currentTime;
      videoRef.current.pause();
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    handleUserInterruption();
  };

  // Immediate Zero-Latency Interruption Playback
  useEffect(() => {
    if (isMemePlaying) {
      if (activeMemeId === "you_have_to_do_it" && meme1Ref.current) {
        meme1Ref.current.currentTime = 0;
        const playPromise = meme1Ref.current.play();
        if (playPromise !== undefined) playPromise.catch(() => {});
      } else if (activeMemeId === "whats_wrong_with_you" && meme2Ref.current) {
        meme2Ref.current.currentTime = 0;
        const playPromise = meme2Ref.current.play();
        if (playPromise !== undefined) playPromise.catch(() => {});
      }
    } else {
      if (meme1Ref.current && !meme1Ref.current.paused) {
        meme1Ref.current.pause();
      }
      if (meme2Ref.current && !meme2Ref.current.paused) {
        meme2Ref.current.pause();
      }
    }
  }, [isMemePlaying, activeMemeId]);

  // Interruption Meme Ended
  const handleMemeEnded = () => {
    handleMemeFinished();
  };

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed inset-0 w-screen h-screen z-[9999] overflow-hidden select-none ${
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* 1. Debug Telemetry HUD */}
      {(showDebugHUD || showCenterCrosshair) && isVisible && (
        <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-cyan-500/40" />
          <div className="absolute h-full w-[1px] bg-cyan-500/40" />
          <div className="absolute top-6 left-6 p-3.5 bg-black/85 border border-cyan-500/40 rounded-2xl text-[11px] font-mono text-cyan-300 backdrop-blur-xl shadow-2xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-cyan-200 border-b border-cyan-500/30 pb-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIME-SYNCHRONIZED POSITION ENGINE</span>
            </div>
            <div>SCREEN: {screen.width}×{screen.height} (DPR: {screen.devicePixelRatio})</div>
            <div>CURRENT X: {Math.round(currentXRef.current)}px (Relative)</div>
            <div>SAVED TIME: {savedTimeRef.current.toFixed(2)}s</div>
            <div>PHASE: {phase}</div>
          </div>
        </div>
      )}

      {/* 2. Ravi Kishan Overlay — Strictly Single Instance Bound to Video Timestamp */}
      {isVisible && (
        <div key="single-ravi-overlay" className="fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none z-40">
          <div
            ref={actorContainerRef}
            onClick={isMemePlaying ? undefined : handleActorClick}
            className={`relative flex flex-col items-center justify-center cursor-pointer group ${
              isMemePlaying ? "pointer-events-none" : "pointer-events-auto"
            }`}
            style={{
              transformOrigin: "center center",
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Animated Text ("Drink Water Now 💧") positioned right above Ravi's raised hand */}
            <div className="absolute top-[2%] left-[64%] sm:left-[68%] z-40 flex items-center justify-start pointer-events-none whitespace-nowrap">
              <CartoonTextUnfold isVisible={isTextUnfolded && !isMemePlaying} text="Drink Water Now 💧" />
            </div>

            {/* Transparent WebM Video — Single Guaranteed Stream */}
            <video
              ref={videoRef}
              src="/memes/processed/water_ravi_final.webm"
              muted={!isDesktopOverlayWindow}
              onError={(e) => {
                const target = e.currentTarget as HTMLVideoElement;
                if (!target.src.includes("ravi_dance.webm")) {
                  target.src = "/memes/processed/ravi_dance.webm";
                }
              }}
              onTimeUpdate={handleVideoTimeUpdate}
              onPlay={() => {
                if (!isMemePlaying) {
                  if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
                  rafIdRef.current = requestAnimationFrame(updatePosition);
                }
              }}
              onPause={() => {
                if (rafIdRef.current) {
                  cancelAnimationFrame(rafIdRef.current);
                  rafIdRef.current = null;
                }
              }}
              onEnded={() => {
                setIsTextUnfolded(false);
                handleSequenceCompleted();
              }}
              playsInline
              controls={false}
              className="max-w-[575px] max-h-[92vh] w-auto h-auto object-contain bg-transparent border-0 outline-none shadow-none"
              style={{
                backgroundColor: "transparent",
                mixBlendMode: "normal",
                transform: "translateZ(0)",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                isolation: "isolate",
                imageRendering: "auto",
                contain: "layout paint",
              }}
            />
          </div>
        </div>
      )}

      {/* 3. Interruption Memes — 60 FPS Crystal-Clear Hardware-Accelerated Zero-Lag Video */}
      <div
        className={`fixed inset-0 w-screen h-screen flex items-center justify-center z-50 transition-opacity duration-150 ${
          isMemePlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          willChange: "opacity",
          contain: "paint layout",
        }}
      >
        {/* Dark backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <div
          className="relative flex flex-col items-center justify-center z-10 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-2 border-white/20"
          style={{
            transform: "translateZ(0)",
            isolation: "isolate",
          }}
        >
          {/* Preloaded Meme 1: You Have To Do It (60 FPS FastDecode) */}
          <video
            ref={meme1Ref}
            src="/memes/processed/you_have_to_do_it.webm"
            onError={(e) => {
              const target = e.currentTarget as HTMLVideoElement;
              if (target.src && !target.src.includes("./memes/")) {
                target.src = "./memes/processed/you_have_to_do_it.webm";
              }
            }}
            muted={!isDesktopOverlayWindow}
            preload="auto"
            playsInline
            controls={false}
            onEnded={handleMemeEnded}
            className={`max-w-[720px] max-h-[75vh] w-auto h-auto object-contain bg-black ${
              activeMemeId === "you_have_to_do_it" ? "block" : "hidden"
            }`}
            style={{
              backgroundColor: "#000000",
              transform: "translateZ(0)",
              contain: "paint layout",
            }}
          />

          {/* Preloaded Meme 2: What's Wrong With You (60 FPS FastDecode) */}
          <video
            ref={meme2Ref}
            src="/memes/processed/whats_wrong_with_you.webm"
            onError={(e) => {
              const target = e.currentTarget as HTMLVideoElement;
              if (target.src && !target.src.includes("./memes/")) {
                target.src = "./memes/processed/whats_wrong_with_you.webm";
              }
            }}
            muted={!isDesktopOverlayWindow}
            preload="auto"
            playsInline
            controls={false}
            onEnded={handleMemeEnded}
            className={`max-w-[720px] max-h-[75vh] w-auto h-auto object-contain bg-black ${
              activeMemeId === "whats_wrong_with_you" ? "block" : "hidden"
            }`}
            style={{
              backgroundColor: "#000000",
              transform: "translateZ(0)",
              contain: "paint layout",
            }}
          />
        </div>
      </div>
    </div>
  );
};
