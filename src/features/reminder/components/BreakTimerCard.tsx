import React from "react";
import { useRecurringBreakTimer } from "../useRecurringBreakTimer";
import { SUPPORTED_INTERVALS } from "../types";
import {
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

export const BreakTimerCard: React.FC = () => {
  const {
    status,
    intervalMinutes,
    formattedTime,
    consecutiveDismissals,
    totalDismissals,
    breaksAccepted,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    setIntervalMinutes,
    testBreakNow,
  } = useRecurringBreakTimer();

  return (
    <div className="w-full max-w-md rounded-3xl bg-zinc-950/80 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center select-none text-center">
      {/* Top Status Header */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6 shadow-sm">
        <span className="relative flex h-2 w-2">
          {isRunning ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600" />
          )}
        </span>
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-300 font-semibold">
          {isRunning ? "LOCKIN ACTIVE" : status}
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
        LOCKIN
      </h1>

      <p className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6">
        {isRunning ? "Next break in" : "Your next break"}
      </p>

      {/* Hero Countdown Timer Display */}
      <div className="w-full py-4 sm:py-6 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6 shadow-inner">
        <span
          className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white tabular-nums drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]"
          aria-live="polite"
        >
          {formattedTime}
        </span>
      </div>

      {/* Interval Selector Controls */}
      <div className="w-full flex flex-col gap-2 mb-6">
        <label
          htmlFor="interval-select"
          className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          {isRunning ? "Interval Configured" : "Remind me every"}
        </label>

        {isRunning ? (
          <div className="w-full h-11 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center font-mono text-sm text-zinc-300">
            Every {intervalMinutes} minutes
          </div>
        ) : (
          <select
            id="interval-select"
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(parseInt(e.target.value, 10))}
            className="w-full h-11 rounded-xl bg-zinc-900 border border-white/10 px-4 font-mono text-sm text-zinc-100 focus:outline-none focus:border-white/30 text-center cursor-pointer transition-colors"
          >
            {SUPPORTED_INTERVALS.map((opt) => (
              <option key={opt.minutes} value={opt.minutes}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3">
        {!isRunning ? (
          <button
            onClick={() => startTimer()}
            className="w-full h-14 rounded-2xl bg-white text-black font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            START
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={resetTimer}
              className="h-12 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-zinc-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>

            <button
              onClick={stopTimer}
              className="h-12 rounded-xl bg-red-950/30 border border-red-800/40 hover:bg-red-900/40 text-red-300 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              STOP
            </button>
          </div>
        )}
      </div>

      {/* Dismissal / Break Stats Pill */}
      {(breaksAccepted > 0 || totalDismissals > 0) && (
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Breaks: {breaksAccepted}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1 text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Dismissed: {totalDismissals}
            {consecutiveDismissals > 1 && ` (${consecutiveDismissals}x)`}
          </span>
        </div>
      )}

      {/* Developer Instant Test Trigger */}
      <div className="mt-4 pt-3 w-full border-t border-dashed border-white/[0.06] flex justify-center">
        <button
          onClick={testBreakNow}
          className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80 hover:text-amber-300 flex items-center gap-1 py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
          title="Developer Test Trigger — Instantly fires break reminder"
        >
          <Zap className="w-3 h-3" />
          TEST BREAK NOW
        </button>
      </div>
    </div>
  );
};
