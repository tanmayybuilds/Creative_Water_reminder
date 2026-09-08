"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/PageContainer";
import { Logo } from "@/components/Logo";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { TaskSelector } from "@/features/sessions/TaskSelector";
import { DurationSelector } from "@/features/sessions/DurationSelector";
import { RoastSelector } from "@/features/sessions/RoastSelector";
import { SessionSummary } from "@/features/sessions/SessionSummary";
import { useSessionStore } from "@/store/session";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const isValid = useSessionStore((s) => s.isValid);
  const createSession = useSessionStore((s) => s.createSession);
  const taskType = useSessionStore((s) => s.taskType);
  const customTask = useSessionStore((s) => s.customTask);

  const [validationError, setValidationError] = useState("");
  const [isLocking, setIsLocking] = useState(false);

  const handleLockIn = () => {
    if (!isValid()) {
      if (taskType === "custom" && customTask.trim().length === 0) {
        setValidationError("Enter a task name to lock in.");
      } else {
        setValidationError("Check your session settings.");
      }
      return;
    }

    setValidationError("");
    setIsLocking(true);
    createSession();

    // Brief delay for the button animation
    setTimeout(() => {
      router.push("/focus");
    }, 300);
  };

  const canLockIn = isValid();

  return (
    <PageContainer>
      <div className="w-full max-w-xl mx-auto px-1 sm:px-0 py-8 sm:py-12">
        {/* Header */}
        <AnimatedWrapper delay={0.05}>
          <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
            <Logo size="md" className="mb-3" />
            <p className="text-sm sm:text-base text-zinc-500 font-light tracking-wide">
              &ldquo;You can quit. But should you?&rdquo;
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              The focus timer that fights back.
            </p>
          </div>
        </AnimatedWrapper>

        {/* Setup sections */}
        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Task Selection */}
          <AnimatedWrapper delay={0.1}>
            <TaskSelector />
          </AnimatedWrapper>

          {/* Duration Selection */}
          <AnimatedWrapper delay={0.15}>
            <DurationSelector />
          </AnimatedWrapper>

          {/* Roast Intensity */}
          <AnimatedWrapper delay={0.2}>
            <RoastSelector />
          </AnimatedWrapper>

          {/* Session Summary */}
          <AnimatedWrapper delay={0.25}>
            <SessionSummary />
          </AnimatedWrapper>

          {/* Validation Error */}
          {validationError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400/80 text-center -mt-4"
            >
              {validationError}
            </motion.p>
          )}

          {/* LOCK IN Button */}
          <AnimatedWrapper delay={0.3}>
            <motion.button
              onClick={handleLockIn}
              disabled={isLocking}
              whileHover={canLockIn ? { scale: 1.01 } : {}}
              whileTap={canLockIn ? { scale: 0.98 } : {}}
              className={`
                w-full h-14 sm:h-16 rounded-2xl text-base sm:text-lg font-bold
                tracking-widest uppercase flex items-center justify-center gap-2
                transition-all duration-300 border
                ${
                  canLockIn
                    ? "bg-white text-black hover:bg-zinc-100 shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] border-white/20 cursor-pointer"
                    : "bg-zinc-800/50 text-zinc-500 border-zinc-700/30 cursor-not-allowed"
                }
                ${isLocking ? "scale-95 opacity-80" : ""}
              `}
            >
              {isLocking ? "LOCKING IN..." : "LOCK IN"}
              {!isLocking && (
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              )}
            </motion.button>
          </AnimatedWrapper>

          {/* Footer */}
          <AnimatedWrapper delay={0.35}>
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-zinc-700 font-mono">
              Local-first &bull; No account required
            </p>
          </AnimatedWrapper>
        </div>
      </div>
    </PageContainer>
  );
}
