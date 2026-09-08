"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { Logo } from "@/components/Logo";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { db } from "@/lib/db";
import { formatTimeRemaining } from "@/features/timer/timerUtils";
import { ROAST_LABELS } from "@/data/roasts";
import type { CompletedSessionRecord } from "@/types";
import {
  Trophy,
  Skull,
  Clock,
  Target,
  AlertCircle,
  Coins,
  Star,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const [latestSession, setLatestSession] = useState<CompletedSessionRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadLatestSession() {
      try {
        const sessions = await db.sessions.toArray();
        if (sessions.length > 0) {
          // Sort by completedAt descending
          sessions.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
          setLatestSession(sessions[0]);
        }
      } catch (err) {
        console.error("Failed to load session results from Dexie:", err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadLatestSession();
  }, []);

  if (!isLoaded) {
    return (
      <PageContainer centered>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      </PageContainer>
    );
  }

  // Fallback if no session found in database
  if (!latestSession) {
    return (
      <PageContainer centered>
        <div className="flex flex-col items-center justify-center text-center max-w-md px-4 py-16 select-none">
          <AnimatedWrapper delay={0.1}>
            <Logo size="sm" className="mb-6" />
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.2}>
            <p className="text-lg text-zinc-300 font-medium mb-2">
              No session results found.
            </p>
            <p className="text-sm text-zinc-500 mb-8">
              Complete a focus session to view your stats and XP.
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.3}>
            <motion.button
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm tracking-wider uppercase hover:bg-zinc-200 transition-colors cursor-pointer shadow-lg shadow-white/5"
            >
              <RotateCcw className="w-4 h-4" />
              Start New Session
            </motion.button>
          </AnimatedWrapper>
        </div>
      </PageContainer>
    );
  }

  const isCompleted = latestSession.status === "completed";
  const actualSeconds =
    latestSession.actualFocusSeconds ??
    (isCompleted
      ? latestSession.durationSeconds
      : Math.max(0, Math.floor((latestSession.completedAt - latestSession.startedAt) / 1000)));

  const formattedActual = formatTimeRemaining(actualSeconds);
  const formattedTarget = formatTimeRemaining(latestSession.durationSeconds);
  const taskName = latestSession.taskName.toUpperCase();
  const roastLabel = ROAST_LABELS[latestSession.roastIntensity]?.toUpperCase() ?? "SERIOUS";

  return (
    <PageContainer centered>
      <div className="flex flex-col items-center justify-center text-center max-w-md w-full px-4 py-12 select-none">
        {/* Status Icon Badge */}
        <AnimatedWrapper delay={0.05}>
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl ${
              isCompleted
                ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                : "bg-red-950/40 border border-red-500/30 text-red-400 shadow-red-500/10"
            }`}
          >
            {isCompleted ? (
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
            ) : (
              <Skull className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </div>
        </AnimatedWrapper>

        {/* Title */}
        <AnimatedWrapper delay={0.1}>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-widest mb-3 ${
              isCompleted
                ? "bg-emerald-950/60 border border-emerald-800/40 text-emerald-400"
                : "bg-red-950/60 border border-red-800/40 text-red-400"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isCompleted ? "SESSION COMPLETED" : "SESSION ABANDONED"}
          </span>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            {isCompleted ? "VICTORY ACHIEVED." : "WALK OF SHAME."}
          </h1>

          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-6">
            STEP 6 GAMIFICATION & XP COMING NEXT
          </p>
        </AnimatedWrapper>

        {/* Session Stats Card */}
        <AnimatedWrapper delay={0.15} className="w-full">
          <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 mb-8 text-left">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Focus Time
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
                  Target / Mode
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {formattedTarget} &bull; {roastLabel}
                </span>
              </div>

              {latestSession.quitAttempts > 0 && (
                <>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                      Quit Attempts
                    </span>
                    <span className="text-xs font-mono text-yellow-400">
                      {latestSession.quitAttempts}
                    </span>
                  </div>
                </>
              )}

              {latestSession.moneyOrFame && (
                <>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                      {latestSession.moneyOrFame === "money" ? (
                        <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      Trial Choice
                    </span>
                    <span className="text-xs font-mono uppercase font-bold text-white">
                      {latestSession.moneyOrFame}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </AnimatedWrapper>

        {/* Action Button */}
        <AnimatedWrapper delay={0.2} className="w-full">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            autoFocus
            className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black font-bold text-base tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            LOCK IN AGAIN
          </motion.button>
        </AnimatedWrapper>
      </div>
    </PageContainer>
  );
}
