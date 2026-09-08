"use client";

import React from "react";
import { motion } from "framer-motion";
import { Skull, ArrowRight } from "lucide-react";

interface ExitStageIntroProps {
  onContinue: () => void;
}

export const ExitStageIntro: React.FC<ExitStageIntroProps> = ({ onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center text-center max-w-md w-full"
    >
      <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center mb-6 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
        <Skull className="w-8 h-8" />
      </div>

      <span className="text-[11px] uppercase font-mono tracking-[0.25em] text-red-400/90 mb-2">
        ESCAPE ATTEMPT DETECTED
      </span>

      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
        YOU\u2019RE ESCAPING. 💀
      </h1>

      <p className="text-sm sm:text-base text-zinc-400 mb-8 max-w-xs leading-relaxed">
        You\u2019ve chosen to abandon your focus session. Before you go...
      </p>

      <div className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
          CHALLENGE OBJECTIVE
        </p>
        <p className="text-base font-bold text-white mt-1">
          SURVIVE THE EXIT
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        autoFocus
        className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black font-bold text-base tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer"
      >
        CONTINUE
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};
