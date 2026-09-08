import React from "react";
import { useRaviPrototypeStore, PrototypeSpeedPreset } from "./raviPrototypeStore";
import {
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Target,
  Volume2,
  VolumeX,
  Clock,
  Zap,
  Film,
  Compass,
} from "lucide-react";

export const RaviPrototypeCard: React.FC = () => {
  const {
    phase,
    speedPreset,
    entranceDuration,
    pauseDuration,
    exitDuration,
    isMuted,
    showCenterCrosshair,
    playCount,
    play,
    stop,
    replay,
    setSpeedPreset,
    setPauseDuration,
    toggleMute,
    toggleCrosshair,
  } = useRaviPrototypeStore();

  const isRunning = phase !== "IDLE" && phase !== "COMPLETED";

  const getPhaseBadge = () => {
    switch (phase) {
      case "ENTERING":
        return {
          text: "1. Entering from Right (120vw ➔ Center)",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          dot: "bg-amber-400 animate-ping",
        };
      case "PAUSED_AT_CENTER":
        return {
          text: "2. Paused at True Visual Center",
          color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          dot: "bg-cyan-400 animate-pulse",
        };
      case "EXITING":
        return {
          text: "3. Crossing Desktop to Left (Center ➔ -120vw)",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          dot: "bg-emerald-400 animate-ping",
        };
      case "COMPLETED":
        return {
          text: "Movement Cycle Finished",
          color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          dot: "bg-blue-400",
        };
      case "IDLE":
      default:
        return {
          text: "Ready to Play Prototype",
          color: "bg-zinc-800/60 text-zinc-400 border-zinc-700/50",
          dot: "bg-zinc-500",
        };
    }
  };

  const badge = getPhaseBadge();

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              Ravi Transparent Movement Prototype
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Pure Alpha WebM Trajectory on Desktop
            </p>
          </div>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
            isMuted
              ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
              : "bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
          }`}
          title={isMuted ? "Unmute Gucci audio" : "Mute audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span>{isMuted ? "Muted" : "Gucci Beat"}</span>
        </button>
      </div>

      {/* Live Trajectory Status Banner */}
      <div className="mb-5 p-3.5 bg-black/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${badge.color}`}>
            {badge.text}
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Runs: {playCount}
        </span>
      </div>

      {/* Primary Action Button */}
      <div className="mb-6">
        {!isRunning ? (
          <button
            onClick={play}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all duration-200 text-base tracking-wide uppercase group"
          >
            <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>Play Ravi Movement (Right ➔ Center ➔ Left)</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={replay}
              className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-200 font-semibold rounded-2xl border border-zinc-700 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>Replay from Right</span>
            </button>
            <button
              onClick={stop}
              className="py-3 px-4 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Square className="w-4 h-4 text-red-400" />
              <span>Stop Prototype</span>
            </button>
          </div>
        )}
      </div>

      {/* Speed & Trajectory Presets */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Speed & Timing Presets
          </span>
          <span className="font-mono text-blue-400/90 text-[11px]">
            {entranceDuration}s Enter • {pauseDuration}s Center • {exitDuration}s Exit
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(["FAST", "NORMAL", "CINEMATIC"] as PrototypeSpeedPreset[]).map((preset) => {
            const isSelected = speedPreset === preset;
            return (
              <button
                key={preset}
                onClick={() => setSpeedPreset(preset)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? "bg-blue-600/30 border-blue-500/60 text-blue-200 shadow-sm"
                    : "bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {preset === "FAST" && "⚡ Fast (1.5s/2.5s/1.5s)"}
                {preset === "NORMAL" && "✨ Normal (2.5s/4s/2.5s)"}
                {preset === "CINEMATIC" && "🎬 Cinematic (4s/6s/4s)"}
              </button>
            );
          })}
        </div>

        {/* Center Pause Duration Adjuster */}
        <div className="flex items-center justify-between gap-3 p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60 text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Center Pause Hold Duration
          </span>
          <div className="flex items-center gap-1">
            {[2, 3, 4, 5, 8].map((sec) => (
              <button
                key={sec}
                onClick={() => setPauseDuration(sec)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all ${
                  pauseDuration === sec
                    ? "bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-500/40"
                    : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Visual Center Crosshair HUD Toggle */}
        <button
          onClick={toggleCrosshair}
          className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            showCenterCrosshair
              ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300"
              : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${showCenterCrosshair ? "text-cyan-400 animate-spin" : "text-zinc-500"}`} />
            <span>Mathematical True Visual Center Crosshair</span>
          </span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40">
            {showCenterCrosshair ? "ACTIVE (ON)" : "OFF"}
          </span>
        </button>
      </div>
    </div>
  );
};
