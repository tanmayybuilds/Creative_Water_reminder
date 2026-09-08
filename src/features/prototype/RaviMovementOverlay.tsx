import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRaviPrototypeStore } from "./raviPrototypeStore";
import { calculateCharacterCenter } from "../water/waterCenterCalibration";
import { Droplets, Target } from "lucide-react";

export const RaviMovementOverlay: React.FC = () => {
  const phase = useRaviPrototypeStore((s) => s.phase);
  const entranceDuration = useRaviPrototypeStore((s) => s.entranceDuration);
  const pauseDuration = useRaviPrototypeStore((s) => s.pauseDuration);
  const exitDuration = useRaviPrototypeStore((s) => s.exitDuration);
  const isMuted = useRaviPrototypeStore((s) => s.isMuted);
  const volume = useRaviPrototypeStore((s) => s.volume);
  const showCenterCrosshair = useRaviPrototypeStore((s) => s.showCenterCrosshair);
  const showNotification = useRaviPrototypeStore((s) => s.showNotification);
  const notificationText = useRaviPrototypeStore((s) => s.notificationText);
  const setPhase = useRaviPrototypeStore((s) => s.setPhase);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Track window dimensions for dynamic viewport calibration
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync video audio settings
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // Master Prototype Sequence Orchestrator
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === "ENTERING") {
      // 1. Enter from Right to Center
      timer = setTimeout(() => {
        setPhase("PAUSED_AT_CENTER");
      }, entranceDuration * 1000);
    } else if (phase === "PAUSED_AT_CENTER") {
      // 2. Pause at True Visual Center
      timer = setTimeout(() => {
        setPhase("EXITING");
      }, pauseDuration * 1000);
    } else if (phase === "EXITING") {
      // 3. Move from Center to Left and exit offscreen
      timer = setTimeout(() => {
        setPhase("COMPLETED");
        setTimeout(() => setPhase("IDLE"), 200);
      }, exitDuration * 1000);
    }

    return () => clearTimeout(timer);
  }, [phase, entranceDuration, pauseDuration, exitDuration, setPhase]);

  // Calculate mathematical visual center coordinates
  const centerCoords = useMemo(() => {
    return calculateCharacterCenter(
      "ravi_dance",
      viewport,
      { width: Math.min(viewport.width * 0.85, 750), height: Math.min(viewport.height * 0.85, 680) },
      typeof window !== "undefined" ? window.devicePixelRatio : 1
    );
  }, [viewport]);

  const isVisible = phase !== "IDLE" && phase !== "COMPLETED";

  // Animation variants
  const variants = {
    initial: {
      x: "120vw", // Starts offscreen past right edge
      opacity: 1,
    },
    entering: {
      x: "0vw", // Smoothly enters to exact screen center
      opacity: 1,
      transition: {
        x: { duration: entranceDuration, ease: [0.22, 1, 0.36, 1] }, // Smooth ease-out deceleration
      },
    },
    holding: {
      x: "0vw", // Holds firmly at center
      opacity: 1,
      transition: { duration: 0.1 },
    },
    exiting: {
      x: "-120vw", // Exits past left edge
      opacity: 1,
      transition: {
        x: { duration: exitDuration, ease: [0.42, 0, 0.58, 1] }, // Smooth continuous traversal
      },
    },
  };

  const currentVariant =
    phase === "ENTERING"
      ? "entering"
      : phase === "PAUSED_AT_CENTER"
      ? "holding"
      : phase === "EXITING"
      ? "exiting"
      : "initial";

  return (
    <div
      aria-hidden={!isVisible}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[9999] overflow-hidden select-none"
    >
      {/* Optional Visual Center Alignment Crosshair HUD */}
      {showCenterCrosshair && isVisible && (
        <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
          {/* Horizontal line */}
          <div className="absolute w-full h-[1px] bg-cyan-500/40" />
          {/* Vertical line */}
          <div className="absolute h-full w-[1px] bg-cyan-500/40" />
          {/* Center Target Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded-full text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-500/20">
            <Target className="w-3.5 h-3.5 animate-spin" />
            <span>True Visual Center: (X: {centerCoords.screenCenterX}px, Y: {centerCoords.screenCenterY}px)</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none">
            <motion.div
              key="ravi-prototype-actor"
              initial="initial"
              animate={currentVariant}
              variants={variants}
              className="relative flex flex-col items-center justify-center pointer-events-auto"
              style={{
                transformOrigin: "center center",
              }}
            >
              {/* Floating "💧 DRINK WATER" Notification attached above Ravi */}
              {showNotification && phase === "PAUSED_AT_CENTER" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: -20 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ type: "spring", stiffness: 340, damping: 22 }}
                  className="absolute -top-12 z-20 flex items-center gap-2 px-5 py-2.5 bg-blue-950/80 border border-blue-400/40 rounded-full shadow-[0_0_35px_rgba(59,130,246,0.5)] backdrop-blur-2xl text-blue-100 font-bold text-sm tracking-wider uppercase select-none"
                >
                  <Droplets className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span>{notificationText}</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping ml-1" />
                </motion.div>
              )}

              {/* Pure Transparent WebM Video (NO black rectangle or borders) */}
              <video
                ref={videoRef}
                src="/memes/processed/ravi_dance.webm"
                autoPlay
                playsInline
                controls={false}
                loop
                className="max-w-[750px] max-h-[680px] w-auto h-auto object-contain bg-transparent border-0 outline-none shadow-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
                style={{
                  backgroundColor: "transparent",
                  mixBlendMode: "normal",
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
