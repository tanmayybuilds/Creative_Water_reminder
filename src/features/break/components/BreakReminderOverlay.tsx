import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBreakSessionStore } from "@/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "@/features/reminder/reminderStore";
import {
  Coffee,
  Droplets,
  Eye,
  Footprints,
  Sparkles,
  XCircle,
  AlertCircle,
} from "lucide-react";

export const BreakReminderOverlay: React.FC = () => {
  const reminderStatus = useBreakReminderStore((s) => s.status);
  const currentSession = useBreakSessionStore((s) => s.currentSession);
  const sessionStatus = currentSession?.status;
  const consecutiveRefusals = currentSession?.consecutiveRefusals || 0;

  // Determine visibility: shown on BREAK_TRIGGERED, BREAK_PROMPT, or REFUSED_AGAIN
  const isPromptActive =
    reminderStatus === "BREAK_TRIGGERED" ||
    sessionStatus === "BREAK_TRIGGERED" ||
    sessionStatus === "BREAK_PROMPT" ||
    sessionStatus === "REFUSED_AGAIN";

  const isMemePlaying = sessionStatus === "MEME_PLAYING";
  const isFinalChoiceActive =
    sessionStatus === "FINAL_EXIT_ATTEMPT" ||
    sessionStatus === "FINAL_CHOICE";
  const isVisible = isPromptActive && !isMemePlaying && !isFinalChoiceActive;

  // Keyboard shortcut: Escape key tracks exit attempt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && e.key === "Escape") {
        useBreakSessionStore.getState().handleExitAttempt();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const handleTakeBreak = () => {
    useBreakSessionStore.getState().handleTakeABreak();
  };

  const handleLeaveMeAlone = () => {
    useBreakSessionStore.getState().handleLeaveMeAlone();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      useBreakSessionStore.getState().handleExitAttempt();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="break-prompt-title"
          aria-describedby="break-prompt-description"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
        >
          {/* Heavy Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-2xl"
          />

          {/* Centered Modern Break Prompt Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative z-10 w-full max-w-lg rounded-3xl bg-zinc-950/95 border border-white/15 p-6 sm:p-8 text-center shadow-[0_0_90px_rgba(0,0,0,0.9)] flex flex-col items-center"
          >
            {/* Top Status Pill */}
            {consecutiveRefusals > 0 ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-wider mb-5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>STILL TIME FOR A BREAK • REFUSALS: {consecutiveRefusals}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RECURRING BREAK DUE</span>
              </div>
            )}

            {/* Visual Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-3xl shadow-[0_0_30px_rgba(251,191,36,0.15)]">
              🛑
            </div>

            {/* Header Title */}
            <h2
              id="break-prompt-title"
              className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2"
            >
              TIME FOR A BREAK
            </h2>

            {/* Supporting Message */}
            <p
              id="break-prompt-description"
              className="text-sm sm:text-base text-zinc-400 font-medium mb-6 leading-relaxed"
            >
              You've been on your computer for a while. Step away for a moment.
            </p>

            {/* Micro Health Reminders (3 Cards) */}
            <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 mb-7 flex flex-col gap-3 text-left">
              {/* Water Reminder */}
              <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-200">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Drink some water</span>
                  <p className="text-[11px] text-zinc-400">Stay hydrated and refreshed.</p>
                </div>
              </div>

              {/* Eye Rest Reminder */}
              <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-200">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Rest your eyes</span>
                  <p className="text-[11px] text-zinc-400">Look at something 20 feet away.</p>
                </div>
              </div>

              {/* Movement Reminder */}
              <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-200">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Stand up and move around</span>
                  <p className="text-[11px] text-zinc-400">Stretch your neck, shoulders, and legs.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              {/* Primary Action Button: TAKE A BREAK */}
              <button
                id="btn-take-break"
                onClick={handleTakeBreak}
                autoFocus
                className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-white via-zinc-100 to-zinc-200 hover:from-white hover:to-white text-black font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.25)] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-400/80 cursor-pointer"
              >
                <Coffee className="w-5 h-5 text-black" />
                TAKE A BREAK
              </button>

              {/* Secondary Action Button: LEAVE ME ALONE */}
              <button
                id="btn-leave-alone"
                onClick={handleLeaveMeAlone}
                className="w-full py-3 rounded-xl font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-red-400 hover:bg-white/[0.03] border border-transparent hover:border-white/10 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-red-400/60 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                LEAVE ME ALONE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
