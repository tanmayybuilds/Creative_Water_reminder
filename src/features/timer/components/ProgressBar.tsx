"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number; // 0.0 to 1.0
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <div
      className={`w-full flex flex-col gap-1.5 select-none ${className}`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Session progress: ${percentage}%`}
    >
      {/* Outer track */}
      <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/[0.06] overflow-hidden p-[1px]">
        {/* Inner fill */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-zinc-300 via-white to-zinc-300 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          style={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Progress percentage indicator */}
      <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-zinc-600 px-0.5">
        <span>PROGRESS</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
};
