"use client";

import React from "react";
import type { ExitStage } from "@/types";

interface ExitProgressBarProps {
  stage: ExitStage;
}

const STAGES: ExitStage[] = ["admit", "question", "money_fame", "final_confirmation"];

export const ExitProgressBar: React.FC<ExitProgressBarProps> = ({ stage }) => {
  if (stage === "intro" || stage === "completed") return null;

  const currentIndex = STAGES.indexOf(stage);

  return (
    <div className="flex items-center justify-center gap-2 select-none mb-8">
      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mr-2">
        EXIT SEQUENCE
      </span>
      {STAGES.map((s, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <React.Fragment key={s}>
            {idx > 0 && (
              <div
                className={`w-4 sm:w-6 h-[1px] transition-colors duration-300 ${
                  isPast ? "bg-red-500/60" : "bg-white/[0.08]"
                }`}
              />
            )}
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isCurrent
                  ? "bg-red-400 ring-4 ring-red-500/20 scale-125"
                  : isPast
                  ? "bg-red-500/80"
                  : "bg-zinc-700"
              }`}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};
