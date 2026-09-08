"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";

interface ExitStageAdmitProps {
  onConfirmQuit: () => void;
  onTakeMeBack: () => void;
}

export const ExitStageAdmit: React.FC<ExitStageAdmitProps> = ({
  onConfirmQuit,
  onTakeMeBack,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center text-center max-w-md w-full"
    >
      <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center mb-4 text-red-400">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 mb-2">
        STAGE 1
      </span>

      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
        ADMIT DEFEAT
      </h2>

      <p className="text-xs sm:text-sm text-zinc-400 mb-8 max-w-xs leading-relaxed">
        You started this session. You tried to escape. Be honest with yourself.
      </p>

      <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 mb-8">
        <p className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-1">
          CONFIRMATION
        </p>
        <p className="text-xl font-bold text-white">
          Are you quitting?
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTakeMeBack}
          autoFocus
          className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black font-bold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          NO, TAKE ME BACK
        </motion.button>

        <button
          onClick={onConfirmQuit}
          className="w-full h-12 rounded-xl border border-red-900/40 bg-red-950/20 text-red-300 hover:bg-red-950/40 hover:border-red-800/60 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>YES 😭</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
