import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBreakSessionStore } from "@/features/break/session/breakSessionStore";
import { FINAL_CHOICE_CONFIG, type FinalChoiceOption } from "@/features/break/session/finalChoiceConfig";
import { Coins, Crown, Sparkles, Scale } from "lucide-react";

/**
 * PaisaYaPehchaanModal — The Final Choice UI
 * =============================================
 * Appears when Break Session reaches FINAL_EXIT_ATTEMPT or FINAL_CHOICE state.
 * Presents two options: PAISA (💰) and PEHCHAAN (👑).
 *
 * Driven entirely by the Break Session state machine.
 * Does NOT expose which answer is correct through styling.
 */
export const PaisaYaPehchaanModal: React.FC = () => {
  const currentSession = useBreakSessionStore((s) => s.currentSession);
  const sessionStatus = currentSession?.status;
  const consecutiveRefusals = currentSession?.consecutiveRefusals || 0;
  const finalChoiceAttempts = currentSession?.finalChoiceAttempts || 0;
  const maxAttempts = FINAL_CHOICE_CONFIG.maxFinalChoiceAttempts;

  // Auto-transition from FINAL_EXIT_ATTEMPT to FINAL_CHOICE
  useEffect(() => {
    if (sessionStatus === "FINAL_EXIT_ATTEMPT") {
      useBreakSessionStore.getState().handleFinalChoiceAttempt();
    }
  }, [sessionStatus]);

  // Determine visibility: shown during FINAL_EXIT_ATTEMPT, FINAL_CHOICE,
  // but hidden during MEME_PLAYING (meme overlay takes precedence)
  const isVisible =
    sessionStatus === "FINAL_EXIT_ATTEMPT" ||
    sessionStatus === "FINAL_CHOICE";

  const isMemePlaying = sessionStatus === "MEME_PLAYING";

  const handleChoice = (choice: FinalChoiceOption) => {
    useBreakSessionStore.getState().handleFinalChoice(choice);
  };

  // Subtitle text based on attempt count
  const getSubtitle = (): string => {
    if (finalChoiceAttempts === 0) {
      return '"Ab faisla tere haath mein hai — break lega ya aage badhega?"';
    }
    if (finalChoiceAttempts === 1) {
      return '"Galat jawab! Ek aur mauka de raha hoon..."';
    }
    if (finalChoiceAttempts >= maxAttempts - 1) {
      return '"Aakhri mauka... soch le..."';
    }
    return '"Phir se soch... Ravi Kishan wait kar raha hai."';
  };

  return (
    <AnimatePresence>
      {isVisible && !isMemePlaying && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="paisa-title"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Dark Dramatic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.25 }}
            className="relative z-10 w-full max-w-lg rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 sm:p-8 text-center shadow-[0_0_90px_rgba(251,191,36,0.25)] flex flex-col items-center select-none"
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest mb-4">
              <Crown className="w-3.5 h-3.5" />
              <span>FINAL CHOICE</span>
            </div>

            {/* Scale Icon */}
            <motion.div
              animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 text-3xl"
            >
              <Scale className="w-8 h-8 text-amber-400" />
            </motion.div>

            {/* Title */}
            <h2
              id="paisa-title"
              className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2"
            >
              PAISA YA PEHCHAAN?
            </h2>

            {/* Dismissal Count */}
            <p className="text-sm text-zinc-300 font-medium mb-1">
              You dismissed{" "}
              <span className="text-amber-400 font-bold">
                {consecutiveRefusals} breaks
              </span>{" "}
              in a row.
            </p>

            {/* Attempt-aware subtitle */}
            <p className="text-xs text-zinc-500 font-mono italic mb-6">
              {getSubtitle()}
            </p>

            {/* Attempt counter pill (only after first wrong answer) */}
            {finalChoiceAttempts > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-wider mb-4">
                <span>
                  ATTEMPT {finalChoiceAttempts} / {maxAttempts}
                </span>
              </div>
            )}

            {/* Two Big Choices: PAISA vs PEHCHAAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-4">
              {/* Option 1: PAISA */}
              <button
                id="btn-final-paisa"
                onClick={() => handleChoice("PAISA")}
                className="group p-4 rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-900 border border-white/10 hover:border-amber-400/50 text-left flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    💰 PAISA
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Choose wisely.
                  </p>
                </div>
              </button>

              {/* Option 2: PEHCHAAN */}
              <button
                id="btn-final-pehchaan"
                onClick={() => handleChoice("PEHCHAAN")}
                className="group p-4 rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-900 border border-white/10 hover:border-amber-400/50 text-left flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
                    <Crown className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    👑 PEHCHAAN
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Choose wisely.
                  </p>
                </div>
              </button>
            </div>

            {/* Footer hint */}
            <p className="text-[11px] font-mono text-zinc-600 mt-1">
              <Sparkles className="w-3 h-3 inline-block mr-1 text-amber-500/40" />
              Ravi Kishan is waiting...
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
