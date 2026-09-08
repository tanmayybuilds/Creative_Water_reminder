"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MoneyOrFame } from "@/types";
import { getRandomReaction } from "../data/moneyFameReactions";
import { ArrowRight, Coins, Star, Sparkles } from "lucide-react";

interface ExitStageMoneyFameProps {
  onChoiceSelected: (choice: MoneyOrFame, reaction: string) => void;
  selectedChoice?: MoneyOrFame;
  savedReaction?: string;
  onContinue: () => void;
}

export const ExitStageMoneyFame: React.FC<ExitStageMoneyFameProps> = ({
  onChoiceSelected,
  selectedChoice: initialChoice,
  savedReaction,
  onContinue,
}) => {
  const [choice, setChoice] = useState<MoneyOrFame | undefined>(initialChoice);
  const [reaction, setReaction] = useState<string | undefined>(savedReaction);

  const handleSelect = (selected: MoneyOrFame) => {
    const rx = getRandomReaction(selected, reaction);
    setChoice(selected);
    setReaction(rx);
    onChoiceSelected(selected, rx);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center text-center max-w-lg w-full"
    >
      <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 mb-2">
        STAGE 3 • SIGNATURE TRIAL
      </span>

      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-zinc-400 mb-1 font-mono">
        FINAL QUESTION
      </h2>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-8">
        WHAT DO YOU WANT MORE?
      </h1>

      {/* Two Enormous Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
        {/* Money Card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("money")}
          className={`relative p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer ${
            choice === "money"
              ? "bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] text-emerald-400"
              : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/20 text-zinc-300"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl">
            <Coins className="w-8 h-8 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            💰 MONEY
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            Generational Wealth & Peace
          </span>
        </motion.button>

        {/* Fame Card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("fame")}
          className={`relative p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer ${
            choice === "fame"
              ? "bg-amber-950/30 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-amber-400"
              : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/20 text-zinc-300"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ⭐ FAME
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            Influence & Red Carpets
          </span>
        </motion.button>
      </div>

      {/* Reaction & Continue */}
      <AnimatePresence>
        {choice && reaction && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="w-full flex flex-col items-center mt-2"
          >
            <div className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-4 flex items-center gap-3 text-left">
              <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  {choice === "money" ? "RESPECT." : "MAIN CHARACTER ENERGY."}
                </span>
                <p className="text-xs sm:text-sm text-zinc-200 font-light italic">
                  &ldquo;{reaction}&rdquo;
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              autoFocus
              className="w-full h-14 sm:h-16 rounded-2xl bg-white text-black font-bold text-base tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              CONTINUE
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
