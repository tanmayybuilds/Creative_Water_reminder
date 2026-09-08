"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Skull, ShieldCheck } from "lucide-react";

interface ExitStageConfirmationProps {
  onKeepFocusing: () => void;
  onConfirmExit: () => void;
}

export const ExitStageConfirmation: React.FC<ExitStageConfirmationProps> = ({
  onKeepFocusing,
  onConfirmExit,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center text-center max-w-md w-full"
    >
      <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center mb-4 text-red-400">
        <Skull className="w-6 h-6" />
      </div>

      <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 mb-2">
        FINAL STAGE
      </span>

      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
        FINAL DECISION
      </h2>

      <p className="text-xs sm:text-sm text-zinc-400 mb-8 max-w-xs leading-relaxed">
        You made it through the exit sequence. You can still return and lock in.
      </p>

      <div className="w-full flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onKeepFocusing}
          autoFocus
          className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black font-bold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          KEEP FOCUSING
        </motion.button>

        <button
          onClick={onConfirmExit}
          className="w-full h-12 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-800/60 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EXIT SESSION</span>
        </button>
      </div>
    </motion.div>
  );
};
