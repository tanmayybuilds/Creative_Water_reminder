import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useWaterStore } from "../waterStore";
import {
  Droplets,
  Clock,
  Sparkles,
  RotateCcw,
  Play,
  GlassWater,
  Activity,
  Zap,
} from "lucide-react";

const INTERVAL_PRESETS = [5, 15, 20, 30, 45, 60];

export const WaterReminderCard: React.FC = () => {
  const status = useWaterStore((s) => s.status);
  const intervalMinutes = useWaterStore((s) => s.intervalMinutes);
  const remainingSeconds = useWaterStore((s) => s.remainingSeconds);
  const totalWaterDrunk = useWaterStore((s) => s.totalWaterDrunk);
  const totalRemindersCompleted = useWaterStore((s) => s.totalRemindersCompleted);
  const totalRemindersTriggered = useWaterStore((s) => s.totalRemindersTriggered);

  const tick = useWaterStore((s) => s.tick);
  const setIntervalMinutes = useWaterStore((s) => s.setIntervalMinutes);
  const recordWaterDrunk = useWaterStore((s) => s.recordWaterDrunk);
  const testReminderNow = useWaterStore((s) => s.testReminderNow);
  const resetWaterTimer = useWaterStore((s) => s.resetWaterTimer);
  const playMeme1 = useWaterStore((s) => s.playMeme1);
  const playMeme2 = useWaterStore((s) => s.playMeme2);

  // Master Clock: Tick every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, (1 - remainingSeconds / (intervalMinutes * 60)) * 100)
  );

  return (
    <div className="w-full max-w-lg rounded-3xl bg-zinc-950/90 border border-blue-500/25 p-6 sm:p-8 shadow-[0_0_80px_rgba(59,130,246,0.15)] backdrop-blur-2xl text-zinc-100 flex flex-col items-center select-none relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Status Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono uppercase tracking-wider mb-5">
        <Droplets className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>
          {status === "REMINDER_ACTIVE" || status === "RAVI_PLAYING"
            ? "💧 RAVI WATER REMINDER ACTIVE"
            : status === "MEME_PLAYING"
            ? "⚡ MEME INTERACTION ACTIVE"
            : `RECURRING WATER REMINDER • ${intervalMinutes} MIN`}
        </span>
      </div>

      {/* Animated Droplet Visual Icon */}
      <motion.div
        animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-transparent border border-blue-400/30 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(59,130,246,0.25)] relative"
      >
        <Droplets className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
      </motion.div>

      {/* App Title */}
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
        RAVI KISHAN WATER REMINDER
      </h1>
      <p className="text-xs sm:text-sm text-zinc-400 font-medium mb-6">
        Ravi Kishan appears on your screen to remind you to hydrate.
      </p>

      {/* Main Countdown Display */}
      <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 mb-5 flex flex-col items-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Next Water Reminder In
        </span>

        <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white my-1 tabular-nums drop-shadow-md">
          {formatTime(remainingSeconds)}
        </span>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden mt-3 border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 rounded-full"
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Interval Selector Buttons */}
      <div className="w-full flex flex-col gap-2 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 text-left">
          Reminder Interval:
        </span>
        <div className="grid grid-cols-6 gap-2">
          {INTERVAL_PRESETS.map((mins) => {
            const isSelected = intervalMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => setIntervalMinutes(mins)}
                className={`py-2 px-1.5 rounded-xl font-mono text-xs uppercase font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 border border-white/5"
                }`}
              >
                {mins}m
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button: I DRANK WATER */}
      <button
        id="btn-drank-water"
        onClick={() => recordWaterDrunk(250)}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 hover:from-blue-400 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-[0_0_40px_rgba(59,130,246,0.35)] active:scale-[0.99] cursor-pointer mb-5"
      >
        <GlassWater className="w-5 h-5 text-white" />
        I DRANK WATER (+250 ML)
      </button>

      {/* Live Hydration Statistics */}
      <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] font-mono text-[11px] mb-5">
        <div className="flex flex-col items-center">
          <span className="text-zinc-400 text-[10px] uppercase">Drunk</span>
          <span className="text-cyan-300 font-bold mt-0.5">{totalWaterDrunk} ml</span>
        </div>
        <div className="flex flex-col items-center border-x border-white/[0.06]">
          <span className="text-zinc-400 text-[10px] uppercase">Completed</span>
          <span className="text-white font-bold mt-0.5">{totalRemindersCompleted}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-400 text-[10px] uppercase">Triggered</span>
          <span className="text-white font-bold mt-0.5">{totalRemindersTriggered}</span>
        </div>
      </div>

      {/* Developer Testing Controls Bar */}
      <div className="w-full pt-4 border-t border-white/[0.08] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase font-bold">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Developer Controls
          </span>
          <span className="text-zinc-600">Water Mode v1.0</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* TEST WATER REMINDER */}
          <button
            id="btn-test-water-reminder"
            onClick={testReminderNow}
            className="h-9 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            TEST WATER REMINDER
          </button>

          {/* RESET WATER TIMER */}
          <button
            id="btn-reset-water-timer"
            onClick={resetWaterTimer}
            className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            RESET WATER TIMER
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* PLAY MEME 1 */}
          <button
            id="btn-play-meme-1"
            onClick={playMeme1}
            className="h-8 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-mono text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            PLAY MEME 1 (Do It)
          </button>

          {/* PLAY MEME 2 */}
          <button
            id="btn-play-meme-2"
            onClick={playMeme2}
            className="h-8 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-mono text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            PLAY MEME 2 (Insane)
          </button>
        </div>
      </div>
    </div>
  );
};
