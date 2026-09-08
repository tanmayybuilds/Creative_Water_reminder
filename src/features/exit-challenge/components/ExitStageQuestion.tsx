"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExitQuestion } from "@/types";
import { HelpCircle, ArrowRight, Sparkles } from "lucide-react";

interface ExitStageQuestionProps {
  question: ExitQuestion;
  onAnswerSelected: (optionId: string) => void;
  selectedOptionId?: string;
  onContinue: () => void;
}

export const ExitStageQuestion: React.FC<ExitStageQuestionProps> = ({
  question,
  onAnswerSelected,
  selectedOptionId: initialSelectedId,
  onContinue,
}) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);

  const handleSelect = (optionId: string) => {
    setSelectedId(optionId);
    onAnswerSelected(optionId);
  };

  const selectedOption = question.options.find((o) => o.id === selectedId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center text-center max-w-lg w-full"
    >
      <div className="w-12 h-12 rounded-full bg-blue-950/40 border border-blue-800/40 flex items-center justify-center mb-4 text-blue-400">
        <HelpCircle className="w-6 h-6" />
      </div>

      <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 mb-2">
        STAGE 2 • PERSONALITY CHECK
      </span>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
        QUICK QUESTION
      </h2>

      <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 my-4 text-left">
        <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="w-full flex flex-col gap-2.5 my-3">
        {question.options.map((opt, idx) => {
          const letter = ["A", "B", "C", "D"][idx];
          const isSelected = selectedId === opt.id;

          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(opt.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                isSelected
                  ? "bg-white/[0.08] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15 text-zinc-300"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? "bg-white text-black" : "bg-white/[0.06] text-zinc-400"
                }`}
              >
                {letter}
              </span>
              <span className="text-xs sm:text-sm font-medium leading-relaxed">
                {opt.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Reaction Box & Continue Action */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="w-full flex flex-col items-center mt-4"
          >
            <div className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 mb-4 flex items-center gap-3 text-left">
              <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-zinc-200 font-light italic">
                &ldquo;{selectedOption.reaction}&rdquo;
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              autoFocus
              className="w-full h-14 rounded-2xl bg-white text-black font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              CONTINUE
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
