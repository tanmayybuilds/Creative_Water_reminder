"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { Logo } from "@/components/Logo";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { useSessionStore } from "@/store/session";
import { useFocusTimer } from "@/features/timer/useFocusTimer";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import { ProgressBar } from "@/features/timer/components/ProgressBar";
import { CompletionView } from "@/features/timer/components/CompletionView";
import { useInterventionEngine } from "@/features/interventions/hooks/useInterventionEngine";
import { InterventionOverlay } from "@/features/interventions/components/InterventionOverlay";
import { ROAST_LABELS } from "@/data/roasts";
import { ArrowLeft } from "lucide-react";

export default function FocusPage() {
  const router = useRouter();
  const sessionConfig = useSessionStore((s) => s.activeSession);
  const clearSessionConfig = useSessionStore((s) => s.clearSession);

  const {
    timerState,
    status,
    remainingSeconds,
    progress,
    isLoaded,
    recordFocusEvent,
    abandonSession,
    resetSession,
  } = useFocusTimer({ initialConfig: sessionConfig });

  // Clear ephemeral session store config once timer is initialized
  useEffect(() => {
    if (sessionConfig && timerState) {
      clearSessionConfig();
    }
  }, [sessionConfig, timerState, clearSessionConfig]);

  // Hook up the full Intervention Engine
  const {
    activeIntervention,
    isOverlayOpen,
    triggerQuitIntervention,
    handleKeepGoing,
    handleProceedToExit,
  } = useInterventionEngine({
    sessionState: timerState,
    isRunning: status === "running",
    onRecordEvent: recordFocusEvent,
    onAbandonSession: abandonSession,
  });

  const handleContinueAfterCompletion = () => {
    resetSession();
    router.push("/");
  };

  // Loading state during hydration/recovery check
  if (!isLoaded) {
    return (
      <PageContainer centered>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      </PageContainer>
    );
  }

  // Fallback: No session configured and nothing to recover
  if (status === "idle" || !timerState) {
    return (
      <PageContainer centered>
        <div className="flex flex-col items-center justify-center text-center max-w-md px-4 py-16 select-none">
          <AnimatedWrapper delay={0.1}>
            <Logo size="sm" className="mb-6" />
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.2}>
            <p className="text-lg text-zinc-300 font-medium mb-2">
              No focus session configured.
            </p>
            <p className="text-sm text-zinc-500 mb-8">
              Set up your session to commit and lock in.
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.3}>
            <motion.button
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm tracking-wider uppercase hover:bg-zinc-200 transition-colors cursor-pointer shadow-lg shadow-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Set up a session
            </motion.button>
          </AnimatedWrapper>
        </div>
      </PageContainer>
    );
  }

  // Completion State
  if (status === "completed") {
    return (
      <PageContainer centered>
        <CompletionView
          timerState={timerState}
          onContinue={handleContinueAfterCompletion}
        />
      </PageContainer>
    );
  }

  // Active Focus Timer View
  const taskName = timerState.config.taskName.toUpperCase();
  const durationLabel = `${timerState.config.durationMinutes} MIN SESSION`;
  const roastLabel = `${ROAST_LABELS[timerState.config.roastIntensity].toUpperCase()} MODE`;

  return (
    <PageContainer centered>
      <div className="flex flex-col items-center justify-center w-full max-w-lg px-4 py-8 sm:py-12 select-none text-center">
        {/* Top Status Badge */}
        <AnimatedWrapper delay={0.05}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8 sm:mb-12 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs uppercase tracking-[0.25em] text-zinc-300 font-mono font-semibold">
              LOCKED IN
            </span>
          </div>
        </AnimatedWrapper>

        {/* Hero Countdown Timer */}
        <AnimatedWrapper delay={0.1} className="w-full my-2 sm:my-4">
          <TimerDisplay remainingSeconds={remainingSeconds} />
        </AnimatedWrapper>

        {/* Task Name */}
        <AnimatedWrapper delay={0.15}>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-4 mb-8 truncate max-w-md">
            {taskName}
          </h2>
        </AnimatedWrapper>

        {/* Progress Indicator */}
        <AnimatedWrapper delay={0.2} className="w-full max-w-xs sm:max-w-sm mb-8">
          <ProgressBar progress={progress} />
        </AnimatedWrapper>

        {/* Session Meta Tags */}
        <AnimatedWrapper delay={0.25}>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12 sm:mb-16">
            <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              {durationLabel}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              {roastLabel}
            </span>
          </div>
        </AnimatedWrapper>

        {/* Small Quit Control */}
        <AnimatedWrapper delay={0.3}>
          <button
            onClick={triggerQuitIntervention}
            className="text-xs uppercase tracking-widest text-zinc-600 hover:text-red-400/80 transition-colors py-2 px-4 rounded-lg hover:bg-red-950/20 font-mono cursor-pointer"
            aria-label="Quit focus session"
          >
            QUIT
          </button>
        </AnimatedWrapper>

        {/* Meme Intervention Fullscreen/Modal Overlay */}
        <InterventionOverlay
          isOpen={isOverlayOpen}
          intervention={activeIntervention}
          roastIntensity={timerState.config.roastIntensity}
          onKeepGoing={handleKeepGoing}
          onProceedToExit={handleProceedToExit}
        />
      </div>
    </PageContainer>
  );
}
