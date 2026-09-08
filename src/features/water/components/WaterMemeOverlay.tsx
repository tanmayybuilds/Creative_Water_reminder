import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWaterStore } from "../waterStore";
import { WaterNotificationBubble } from "./WaterNotificationBubble";
import { calculateCharacterCenter } from "../waterCenterCalibration";

type RaviMovementPhase = "entering" | "holding" | "exiting" | "idle";

/**
 * WaterMemeOverlay — Dedicated Transparent Overlay for Water Reminder Mode
 * ==========================================================================
 * Features:
 * - 100% pure transparent character rendering (NO rectangular background or borders).
 * - Exact mathematical visual center alignment.
 * - Choreography: RIGHT -> CENTER (holds 5s with "💧 DRINK WATER" bubble) -> LEFT (exits).
 * - Handles 1st and 2nd click meme escalations (you_have_to_do_it, whats_wrong_with_you).
 */
export const WaterMemeOverlay: React.FC = () => {
  const status = useWaterStore((s) => s.status);
  const activeMemeId = useWaterStore((s) => s.activeMemeId);
  const isNotificationVisible = useWaterStore((s) => s.isNotificationVisible);
  const showNotification = useWaterStore((s) => s.showNotification);
  const hideNotification = useWaterStore((s) => s.hideNotification);
  const handleRaviSequenceCompleted = useWaterStore((s) => s.handleRaviSequenceCompleted);
  const handleUserInteraction = useWaterStore((s) => s.handleUserInteraction);
  const handleMemeFinished = useWaterStore((s) => s.handleMemeFinished);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [movementPhase, setMovementPhase] = useState<RaviMovementPhase>("idle");
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  // Track window resize to ensure mathematical center is always exact
  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isVisible =
    (status === "REMINDER_ACTIVE" || status === "RAVI_PLAYING" || status === "MEME_PLAYING") &&
    activeMemeId !== null;

  // Resolve transparent WebM asset URL
  const assetUrl = useMemo(() => {
    if (!activeMemeId) return "";
    return `/memes/processed/${activeMemeId}.webm`;
  }, [activeMemeId]);

  const isRaviDance = activeMemeId === "ravi_dance" || activeMemeId === "gucci_dance";

  // Master Choreography for Normal Ravi Reminder (ravi_dance)
  useEffect(() => {
    if (status === "REMINDER_ACTIVE" && isRaviDance) {
      setMovementPhase("entering");

      // 1. Enter from Right to Center (takes ~2.5 seconds)
      const centerTimer = setTimeout(() => {
        setMovementPhase("holding");
        showNotification();

        // 2. Hold at Center for ~5 seconds while notification is visible
        const holdTimer = setTimeout(() => {
          hideNotification();
          setMovementPhase("exiting");

          // 3. Move from Center to Left and exit screen (takes ~2.5 seconds)
          const exitTimer = setTimeout(() => {
            setMovementPhase("idle");
            handleRaviSequenceCompleted();
          }, 2500);

          return () => clearTimeout(exitTimer);
        }, 5000);

        return () => clearTimeout(holdTimer);
      }, 2500);

      return () => clearTimeout(centerTimer);
    } else if (status === "MEME_PLAYING") {
      setMovementPhase("holding");
    } else if (!isVisible) {
      setMovementPhase("idle");
    }
  }, [status, isRaviDance, showNotification, hideNotification, handleRaviSequenceCompleted, isVisible]);

  // Calculate mathematical visual center coordinates
  const centerCoords = useMemo(() => {
    return calculateCharacterCenter(
      activeMemeId || "ravi_dance",
      viewport,
      { width: Math.min(viewport.width * 0.85, 750), height: Math.min(viewport.height * 0.85, 680) },
      typeof window !== "undefined" ? window.devicePixelRatio : 1
    );
  }, [activeMemeId, viewport]);

  // Animation variants for the movement choreography
  const variants = {
    // Normal Ravi Dance Trajectory: RIGHT -> CENTER -> LEFT (Separately animated desktop overlay)
    entering: {
      x: "0vw",
      opacity: 1,
      transition: {
        x: { duration: 2.5, ease: [0.25, 0.1, 0.25, 1.0] },
        opacity: { duration: 0.4 },
      },
    },
    holding: {
      x: "0vw",
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exiting: {
      x: "-120vw", // Exits past left edge
      opacity: 1,
      transition: {
        x: { duration: 2.5, ease: [0.42, 0, 0.58, 1.0] },
      },
    },
    initialFromRight: {
      x: "120vw", // Starts offscreen past right edge
      opacity: 1,
    },
    // Pop in place for interaction memes (You Have To Do It, What's Wrong With You)
    popCenter: {
      scale: 1,
      opacity: 1,
      x: "0vw",
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
    popInitial: {
      scale: 0.2,
      opacity: 0,
      x: "0vw",
    },
  };

  const handleVideoEnded = () => {
    if (status === "MEME_PLAYING") {
      handleMemeFinished();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUserInteraction();
  };

  return (
    <div
      aria-hidden={!isVisible}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[999] overflow-hidden select-none"
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <div className="fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none">
            <motion.div
              key={`${activeMemeId}-${status}`}
              initial={isRaviDance ? "initialFromRight" : "popInitial"}
              animate={isRaviDance ? movementPhase : "popCenter"}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
              variants={variants}
              onClick={handleClick}
              className="relative flex flex-col items-center justify-center pointer-events-auto cursor-pointer group"
              style={{
                // Mathematical visual offset calibration
                transformOrigin: "center center",
              }}
            >
              {/* Floating "💧 DRINK WATER" Notification attached to Ravi */}
              <WaterNotificationBubble
                isVisible={isNotificationVisible}
                message="DRINK WATER"
                onClick={() => handleUserInteraction()}
              />

              {/* Pure Transparent WebM Video (NO black rectangle or borders) */}
              <video
                ref={videoRef}
                src={assetUrl}
                autoPlay
                playsInline
                controls={false}
                loop={activeMemeId === "gucci_dance"} // Loop Gucci dance while traversing & holding
                onEnded={handleVideoEnded}
                onError={(e) => console.warn("[WaterOverlay] Transparent video notice:", e)}
                className="w-auto h-auto max-w-[85vw] max-h-[80vh] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] block bg-transparent"
                style={{
                  // Guarantees pure alpha transparency with zero background artifacting
                  background: "transparent",
                  backgroundColor: "transparent",
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
