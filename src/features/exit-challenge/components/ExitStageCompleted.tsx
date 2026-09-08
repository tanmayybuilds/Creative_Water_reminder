"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatTimeRemaining } from "@/features/timer/timerUtils";
import { ROAST_LABELS } from "@/data/roasts";
import type { CompletedSessionRecord } from "@/types";
import { Skull, ArrowRight, Clock, Target, AlertCircle, Coins, Star } from "lucide-react";

interface ExitStageCompletedProps {
  sessionRecord: CompletedSessionRecord;
  onViewSession: () => void;
}

export const ExitStageCompleted: React.FC<ExitStageCompletedProps> = ({
  sessionRecord,
  onViewSession,
}) => {
  const actualSeconds = sessionRecord.actualFocusSeconds ?? Math.max(0, Math.floor((sessionRecord.completedAt - sessionRecord.startedAt) / 1000));
  const formattedActual = formatTimeRemaining(actualSeconds);
  const formattedTarget = formatTimeRemaining(sessionRecord.durationSeconds);
  const taskName = sessionRecord.taskName.toUpperCase();
  const roastLabel = ROAST_LABELS[sessionRecord.roastIntensity].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center text-center max-w-md w-full select-none"
    >
      <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center mb-6 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <Skull className="w-8 h-8" />
      </div>

      <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-red-400/90 mb-2">
        EXIT COMPLETE
      </span>

      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
        SESSION ABANDONED
      </h1>

      <p className="text-xs sm:text-sm text-zinc-400 mb-8 italic">
        &ldquo;Okay. You win this round. 💀&rdquo;
      </p>

      {/* Recap Stats Card */}
      <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 mb-8 text-left">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Focused For
            </span>
            <span className="text-sm font-mono font-bold text-white">
              {formattedActual}
            </span>
          </div>

          <div className="h-px bg-white/[0.04]" />

          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-zinc-400" />
              Task
            </span>
            <span className="text-sm font-medium text-white truncate max-w-[180px]">
              {taskName}
            </span>
          </div>

          <div className="h-px bg-white/[0.04]" />

          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">
              Target Duration
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {formattedTarget} ({roastLabel})
            </span>
          </div>

          {sessionRecord.quitAttempts > 0 && (
            <>
              <div className="h-px bg-white/[0.04]" />
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                  Quit Attempts
                </span>
                <span className="text-xs font-mono text-yellow-400">
                  {sessionRecord.quitAttempts}
                </span>
              </div>
            </>
          )}

          {sessionRecord.moneyOrFame && (
            <>
              <div className="h-px bg-white/[0.04]" />
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                  {sessionRecord.moneyOrFame === "money" ? (
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  Choice
                </span>
                <span className="text-xs font-mono uppercase font-bold text-white">
                  {sessionRecord.moneyOrFame}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onViewSession}
        autoFocus
        className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black font-bold text-base tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer"
      >
        VIEW SESSION
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};
