"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InterventionContent, RoastIntensity } from "@/types";
import { MediaDisplay } from "./MediaDisplay";
import { ShieldAlert, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";

interface InterventionOverlayProps {
  isOpen: boolean;
  intervention: InterventionContent | null;
  roastIntensity: RoastIntensity;
  onKeepGoing: () => void;
  onProceedToExit: () => void;
}

export const InterventionOverlay: React.FC<InterventionOverlayProps> = ({
  isOpen,
  intervention,
  roastIntensity,
  onKeepGoing,
  onProceedToExit,
}) => {
  const [isConfirmingQuit, setIsConfirmingQuit] = useState(false);

  // Reset confirmation state whenever the overlay opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmingQuit(false);
    }
  }, [isOpen]);

  if (!isOpen || !intervention) return null;

  const isBrainrot = roastIntensity === "brainrot";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with strong blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          onClick={onKeepGoing}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isBrainrot ? [0, -3, 3, -2, 2, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{
            type: "spring",
            duration: 0.35,
            x: isBrainrot ? { repeat: Infinity, repeatDelay: 4, duration: 0.4 } : undefined,
          }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-zinc-950/95 border border-white/10 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col items-center select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intervention-title"
        >
          {/* Top Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-300" />
            <span>LOCKIN INTERVENTION • {intervention.stage.toUpperCase()}</span>
          </div>

          {!isConfirmingQuit ? (
            <>
              {/* Media Display Area */}
              <div className="w-full flex justify-center mb-6">
                <MediaDisplay content={intervention} />
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onKeepGoing}
                  autoFocus
                  className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black font-bold text-base tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  KEEP GOING
                </motion.button>

                <button
                  onClick={() => setIsConfirmingQuit(true)}
                  className="text-xs uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors py-2.5 font-mono cursor-pointer"
                >
                  QUIT ANYWAY
                </button>
              </div>
            </>
          ) : (
            /* Quit Confirmation / Transition Step */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full py-4 flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center mb-4 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                Okay... You\u2019re really doing this?
              </h3>

              <p className="text-xs sm:text-sm text-zinc-400 mb-8 max-w-xs leading-relaxed">
                Leaving now will count as an abandoned session. Step 5 Exit Challenge awaits ahead.
              </p>

              <div className="w-full flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onKeepGoing}
                  autoFocus
                  className="w-full h-14 rounded-2xl bg-white text-black font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all cursor-pointer shadow-lg shadow-white/5"
                >
                  <RotateCcw className="w-4 h-4" />
                  NEVERMIND, KEEP GOING
                </motion.button>

                <button
                  onClick={onProceedToExit}
                  className="w-full h-12 rounded-xl border border-red-900/40 bg-red-950/20 text-red-300 hover:bg-red-950/40 hover:border-red-800/60 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>PROCEED TO EXIT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
