import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sparkles } from "lucide-react";

interface WaterNotificationBubbleProps {
  isVisible: boolean;
  message?: string;
  onClick?: () => void;
}

/**
 * Premium floating notification: "💧 DRINK WATER"
 * Attaches near Ravi's visual center during the reminder sequence without covering his face.
 */
export const WaterNotificationBubble: React.FC<WaterNotificationBubbleProps> = ({
  isVisible,
  message = "DRINK WATER",
  onClick,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -10 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.3 }}
          onClick={onClick}
          className="absolute -top-16 sm:-top-20 z-50 flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-zinc-950/90 border border-blue-400/40 text-white shadow-[0_0_50px_rgba(59,130,246,0.45)] backdrop-blur-2xl cursor-pointer hover:scale-105 transition-transform select-none"
        >
          {/* Animated Water Drop Icon Badge */}
          <motion.div
            animate={{ y: [0, -3, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="p-1.5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-black shadow-[0_0_15px_rgba(56,189,248,0.6)]"
          >
            <Droplets className="w-4 h-4 fill-black" />
          </motion.div>

          {/* Text Label */}
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black tracking-wider uppercase bg-gradient-to-r from-blue-200 via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-sm font-mono">
              {message}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
