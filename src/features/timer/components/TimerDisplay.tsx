"use client";

import React from "react";
import { formatTimeRemaining } from "../timerUtils";

interface TimerDisplayProps {
  remainingSeconds: number;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  className = "",
}) => {
  const formattedTime = formatTimeRemaining(remainingSeconds);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Time remaining: ${formattedTime}`}
    >
      {/* Background glow effect */}
      <div className="absolute -inset-4 bg-white/[0.02] blur-2xl rounded-full pointer-events-none" />

      {/* Main Countdown Digits */}
      <span className="relative z-10 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
        {formattedTime}
      </span>
    </div>
  );
};
