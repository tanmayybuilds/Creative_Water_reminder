import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CartoonTextUnfoldProps {
  isVisible: boolean;
  text?: string;
}

/**
 * CartoonTextUnfold — Premium Animated Text Overlay
 * 
 * Features:
 * - Letter-by-letter staggered spring entrance
 * - Animated gradient shimmer across text
 * - Bouncing water droplet icon
 * - Glowing pulse while visible
 * - Smooth cascade exit animation
 * - Glassmorphic backdrop with animated border
 */
export const CartoonTextUnfold: React.FC<CartoonTextUnfoldProps> = ({
  isVisible,
  text = "Drink Water Now",
}) => {
  const letters = useMemo(() => text.split(""), [text]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="text-overlay"
          initial={{ opacity: 0, scale: 0.3, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.5,
            y: -20,
            filter: "blur(8px)",
            transition: { duration: 0.35, ease: "easeInOut" },
          }}
          transition={{
            duration: 0.5,
            ease: [0.175, 0.885, 0.32, 1.275], // Back.easeOut
          }}
          className="relative pointer-events-none select-none"
        >
          {/* Main container — glassmorphic card */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(56, 189, 248, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)",
                "0 0 40px rgba(56, 189, 248, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)",
                "0 0 20px rgba(56, 189, 248, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 58, 95, 0.9) 50%, rgba(15, 23, 42, 0.85) 100%)",
              backdropFilter: "blur(16px) saturate(180%)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              padding: "14px 24px 12px 22px",
            }}
          >
            {/* Animated shimmer sweep across the card */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(56, 189, 248, 0.12) 45%, rgba(255, 255, 255, 0.08) 50%, rgba(56, 189, 248, 0.12) 55%, transparent 60%)",
                width: "100%",
              }}
            />

            {/* Top accent line with gradient animation */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, #38bdf8, #a78bfa, #38bdf8, transparent)",
                backgroundSize: "200% 100%",
              }}
            />

            {/* Content row */}
            <div className="flex items-center gap-3">
              {/* Animated water droplet */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.3, 0.9, 1.05, 1],
                  rotate: [-180, 10, -5, 2, 0],
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.2,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
                className="relative shrink-0"
              >
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                    rotate: [0, -8, 8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-2xl sm:text-3xl"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(56, 189, 248, 0.5))" }}
                >
                  💧
                </motion.div>

                {/* Ripple ring around droplet */}
                <motion.div
                  animate={{
                    scale: [0.8, 1.8],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 rounded-full border border-cyan-400/40"
                  style={{ margin: "-4px" }}
                />
              </motion.div>

              {/* Letter-by-letter animated text */}
              <div className="flex flex-wrap items-baseline">
                {letters.map((letter, i) => (
                  <motion.span
                    key={`${letter}-${i}`}
                    initial={{
                      opacity: 0,
                      y: 25,
                      rotateX: -90,
                      scale: 0.3,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      rotateX: 60,
                      scale: 0.5,
                      transition: {
                        duration: 0.2,
                        delay: (letters.length - i) * 0.015,
                      },
                    }}
                    transition={{
                      duration: 0.45,
                      delay: 0.15 + i * 0.035,
                      ease: [0.175, 0.885, 0.32, 1.275],
                    }}
                    className="inline-block"
                    style={{
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                      fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
                      fontWeight: 800,
                      letterSpacing: letter === " " ? "0.3em" : "0.04em",
                      color: "transparent",
                      backgroundImage: "linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 30%, #38bdf8 60%, #a78bfa 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      textTransform: "uppercase",
                      lineHeight: 1.1,
                      textShadow: "none",
                      filter: "drop-shadow(0 1px 2px rgba(56, 189, 248, 0.4))",
                      minWidth: letter === " " ? "0.35em" : undefined,
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </div>

              {/* Animated sparkle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  scale: { duration: 0.5, delay: 0.6 },
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                }}
                className="text-lg sm:text-xl shrink-0"
                style={{ filter: "drop-shadow(0 0 6px rgba(167, 139, 250, 0.6))" }}
              >
                ✨
              </motion.div>
            </div>

            {/* Animated underline that draws itself */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 h-[2px] rounded-full origin-left"
              style={{
                background: "linear-gradient(90deg, #38bdf8, #a78bfa, #f472b6, transparent)",
              }}
            />

            {/* Subtle bottom text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-1 text-center"
            >
              <span
                className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase"
                style={{
                  color: "rgba(148, 163, 184, 0.7)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                }}
              >
                stay hydrated • stay locked in
              </span>
            </motion.div>
          </motion.div>

          {/* Floating particles around the card */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0.5],
                x: [0, (i - 1) * 30],
                y: [0, -20 - i * 10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.8 + i * 0.4,
                ease: "easeOut",
              }}
              className="absolute text-xs pointer-events-none"
              style={{
                top: `${30 + i * 15}%`,
                left: i === 0 ? "-5%" : i === 1 ? "50%" : "95%",
              }}
            >
              {["💦", "🫧", "💧"][i]}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
