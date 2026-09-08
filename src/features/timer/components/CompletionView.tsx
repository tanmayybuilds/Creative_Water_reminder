"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Trophy, ArrowRight, ShieldCheck } from "lucide-react";
import { formatTimeRemaining } from "../timerUtils";
import { ROAST_LABELS } from "@/data/roasts";
import type { ActiveTimerState } from "@/types";

interface CompletionViewProps {
  timerState: ActiveTimerState;
  onContinue: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  timerState,
  onContinue,
}) => {
  const formattedDuration = formatTimeRemaining(timerState.durationSeconds);
  const taskName = timerState.config.taskName.toUpperCase();
  const roastLabel = ROAST_LABELS[timerState.config.roastIntensity].toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md w-full px-4 py-12 select-none">
      {/* Success Badge */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
      >
        <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
      </motion.div>

      {/* Main Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          SESSION COMPLETE
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
          YOU LOCKED IN.
        </h1>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 my-8 text-left"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">
              Task
            </span>
            <span className="text-sm font-semibold text-white truncate max-w-[200px]">
              {taskName}
            </span>
          </div>

          <div className="h-px bg-white/[0.04]" />

          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">
              Duration
            </span>
            <span className="text-sm font-mono font-medium text-white">
              {formattedDuration}
            </span>
          </div>

          <div className="h-px bg-white/[0.04]" />

          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">
              Intensity
            </span>
            <span className="text-sm font-mono text-zinc-300">
              {roastLabel} MODE
            </span>
          </div>

          {timerState.quitAttempts > 0 && (
            <>
              <div className="h-px bg-white/[0.04]" />
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
                  Quit Attempts
                </span>
                <span className="text-xs font-mono text-yellow-400">
                  {timerState.quitAttempts} resisted
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Continue Action */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full"
      >
        <button
          onClick={onContinue}
          className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-base sm:text-lg tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98] cursor-pointer"
        >
          CONTINUE
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};
