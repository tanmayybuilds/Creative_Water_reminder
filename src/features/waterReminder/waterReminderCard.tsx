import React, { useEffect, useState } from "react";
import { useWaterReminderStore } from "./waterReminderStore";
import { Logo } from "@/components/Logo";
import {
  Droplets,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  GlassWater,
  Flame,
  Settings,
  X,
  FileText,
  Sliders,
  ShieldCheck,
  Power,
} from "lucide-react";

export const WaterReminderCard: React.FC = () => {
  const {
    intervalMinutes,
    isTimerRunning,
    remainingSeconds,
    phase,
    totalRemindersTriggered,
    totalRemindersCompleted,
    totalWaterDrunkMl,
    showDebugHUD,
    showCenterCrosshair,
    toggleDebugHUD,
    toggleCenterCrosshair,
    startTimer,
    stopTimer,
    resetTimer,
    setIntervalMinutes,
    tick,
    triggerTestReminder,
    recordWaterDrunk,
  } = useWaterReminderStore();

  const [dailyGoalMl] = useState(2000);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [launchAtStartup, setLaunchAtStartup] = useState(false);
  const [appVersion, setAppVersion] = useState("1.0.0");

  // Fetch initial startup status & version from Electron main
  useEffect(() => {
    const api = typeof window !== "undefined" ? (window as any).electronAPI : undefined;
    if (api) {
      api.getStartupStatus?.().then((enabled: boolean) => setLaunchAtStartup(Boolean(enabled))).catch(() => {});
      api.getVersion?.().then((v: string) => { if (v) setAppVersion(v); }).catch(() => {});
    }
  }, []);

  const handleToggleStartup = async () => {
    const api = typeof window !== "undefined" ? (window as any).electronAPI : undefined;
    const nextVal = !launchAtStartup;
    setLaunchAtStartup(nextVal);
    if (api && api.setStartupStatus) {
      await api.setStartupStatus(nextVal).catch(() => {});
    }
  };

  const handleOpenLogs = () => {
    const api = typeof window !== "undefined" ? (window as any).electronAPI : undefined;
    api?.openLogsFolder?.()?.catch(() => {});
  };

  // Mount 1-second timer tick (only in browser standalone mode; Electron main process is authoritative)
  useEffect(() => {
    const api = typeof window !== "undefined" ? (window as any).electronAPI : undefined;
    if (!api) {
      const interval = setInterval(() => {
        tick();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tick]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const intervalPresets = [5, 10, 15, 20, 30, 45, 60];
  const totalDurationSeconds = intervalMinutes * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100)
  );

  const hydrationProgressPercent = Math.min(100, Math.round((totalWaterDrunkMl / dailyGoalMl) * 100));

  const adjustMinutes = (delta: number) => {
    const newMins = Math.max(1, Math.min(180, intervalMinutes + delta));
    setIntervalMinutes(newMins);
  };

  const isReminderActive = phase !== "IDLE" && phase !== "COMPLETED";

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Brand Logo, Live State & Settings Toggle */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Logo size="sm" showBadge={true} badgeText="v1.0 Pro" />

        <div className="flex items-center gap-2">
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-zinc-800 rounded-full text-xs font-mono shadow-inner">
            <span
              className={`w-2 h-2 rounded-full ${
                isTimerRunning ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-zinc-600"
              }`}
            />
            <span className={isTimerRunning ? "text-emerald-400 font-bold" : "text-zinc-500 font-medium"}>
              {isTimerRunning ? "ACTIVE" : "PAUSED"}
            </span>
          </div>

          {/* Settings Modal Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            title="Settings & System Information"
            aria-label="Settings and System Information"
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Central Hero Countdown Widget */}
      <div className="relative flex flex-col items-center justify-center p-7 bg-gradient-to-b from-black/60 to-zinc-950/60 border border-zinc-800/80 rounded-2xl mb-6 shadow-xl overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5 font-semibold">
            <Droplets className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            Next Hydration In
          </span>

          <div className="flex items-center gap-4 my-2">
            <button
              onClick={() => adjustMinutes(-1)}
              title="Decrease interval by 1m"
              aria-label="Decrease interval by 1 minute"
              className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors focus:ring-2 focus:ring-cyan-500"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_4px_24px_rgba(34,211,238,0.25)]">
              {formatCountdown(remainingSeconds)}
            </span>

            <button
              onClick={() => adjustMinutes(1)}
              title="Increase interval by 1m"
              aria-label="Increase interval by 1 minute"
              className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors focus:ring-2 focus:ring-cyan-500"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Linear Interval Progress Bar */}
          <div className="w-48 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden mt-1 mb-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-zinc-400">
            Interval: <span className="text-cyan-300 font-bold">{intervalMinutes} minutes</span>
          </span>
        </div>
      </div>

      {/* Interval Selector Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
          <span>Reminder Interval</span>
          <span className="font-mono text-cyan-400 font-bold">{intervalMinutes} min</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {intervalPresets.map((mins) => {
            const isSelected = intervalMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => setIntervalMinutes(mins)}
                aria-label={`Set interval to ${mins} minutes`}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all border text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)] scale-[1.02]"
                    : "bg-zinc-800/30 border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                {mins}m
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Timer Controls: [ START / PAUSE ] & [ RESET ] */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {isTimerRunning ? (
          <button
            onClick={stopTimer}
            aria-label="Pause hydration timer"
            className="py-3.5 px-4 bg-zinc-800/90 hover:bg-zinc-800 active:scale-[0.98] text-amber-300 font-bold rounded-2xl border border-amber-500/30 hover:border-amber-500/50 flex items-center justify-center gap-2 transition-all text-sm shadow-md focus:ring-2 focus:ring-amber-400"
          >
            <Pause className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>PAUSE TIMER</span>
          </button>
        ) : (
          <button
            onClick={startTimer}
            aria-label="Start hydration timer"
            className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide focus:ring-2 focus:ring-emerald-400"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>START TIMER</span>
          </button>
        )}

        <button
          onClick={resetTimer}
          aria-label="Reset hydration timer"
          className="py-3.5 px-4 bg-zinc-800/50 hover:bg-zinc-800 active:scale-[0.98] text-zinc-300 hover:text-white font-semibold rounded-2xl border border-zinc-700/60 hover:border-zinc-600 flex items-center justify-center gap-2 transition-all text-sm focus:ring-2 focus:ring-zinc-400"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>RESET TIMER</span>
        </button>
      </div>

      {/* Daily Hydration Tracker Card */}
      <div className="p-4 bg-black/40 border border-zinc-800/80 rounded-2xl mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <GlassWater className="w-4 h-4 text-cyan-400" />
            Daily Hydration Progress
          </span>
          <span className="font-mono text-cyan-300 font-bold">
            {totalWaterDrunkMl} / {dailyGoalMl} ml ({hydrationProgressPercent}%)
          </span>
        </div>

        {/* Hydration Progress Bar */}
        <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${hydrationProgressPercent}%` }}
          />
        </div>

        {/* Quick Log Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => recordWaterDrunk(250)}
            aria-label="Log 250ml glass of water"
            className="py-2 px-3 bg-zinc-800/60 hover:bg-zinc-700/80 active:scale-[0.98] border border-cyan-500/20 text-cyan-200 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all focus:ring-2 focus:ring-cyan-500"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+250 ml (Glass)</span>
          </button>

          <button
            onClick={() => recordWaterDrunk(500)}
            aria-label="Log 500ml bottle of water"
            className="py-2 px-3 bg-zinc-800/60 hover:bg-zinc-700/80 active:scale-[0.98] border border-teal-500/20 text-teal-200 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all focus:ring-2 focus:ring-teal-500"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>+500 ml (Bottle)</span>
          </button>
        </div>
      </div>

      {/* Production Reminder Preview */}
      <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2.5">
        <button
          onClick={triggerTestReminder}
          disabled={isReminderActive}
          aria-label="Trigger instant reminder preview"
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            isReminderActive
              ? "bg-zinc-800 text-zinc-500 border border-zinc-700/40 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 active:scale-[0.98] text-white shadow-cyan-500/20 cursor-pointer"
          }`}
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{isReminderActive ? "Reminder Active on Screen" : "Preview Water Reminder"}</span>
        </button>

        {/* Stat Summary Footer */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Triggered: <strong className="text-zinc-300">{totalRemindersTriggered}</strong>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Completed: <strong className="text-zinc-300">{totalRemindersCompleted}</strong>
          </span>
        </div>
      </div>

      {/* Settings & System Information Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Application Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Launch on Windows Startup */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-zinc-800/80 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Power className="w-3.5 h-3.5 text-cyan-400" />
                  Launch on Windows Startup
                </span>
                <span className="text-[10px] text-zinc-500">Run quietly in background when PC boots</span>
              </div>
              <button
                onClick={handleToggleStartup}
                role="switch"
                aria-checked={launchAtStartup}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  launchAtStartup ? "bg-cyan-500 justify-end" : "bg-zinc-700 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
              </button>
            </div>

            {/* Advanced Developer Telemetry Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-zinc-800/80 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-200">Developer Calibration Crosshair</span>
                <span className="text-[10px] text-zinc-500">Display trajectory telemetry HUD</span>
              </div>
              <button
                onClick={() => {
                  toggleDebugHUD();
                  toggleCenterCrosshair();
                }}
                role="switch"
                aria-checked={showDebugHUD || showCenterCrosshair}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  showDebugHUD ? "bg-cyan-500 justify-end" : "bg-zinc-700 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
              </button>
            </div>

            {/* Application Logs */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-zinc-800/80 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  Production Diagnostic Logs
                </span>
                <span className="text-[10px] text-zinc-500">Local rotating log files in %AppData%</span>
              </div>
              <button
                onClick={handleOpenLogs}
                className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 rounded-xl transition-colors border border-zinc-700"
              >
                Open Folder
              </button>
            </div>

            {/* Identity & About Info */}
            <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-2xl text-[11px] font-mono text-zinc-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Application:</span>
                <span className="text-zinc-200 font-bold">Water Reminder (Meme Edition)</span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-cyan-400 font-bold">{appVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>Publisher:</span>
                <span className="text-zinc-200">tanmay_chaudhary</span>
              </div>
              <div className="flex justify-between">
                <span>Architecture:</span>
                <span className="text-zinc-200">Windows x64 / Offline Local</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 pt-1 border-t border-zinc-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Telemetry • 100% Privacy-First</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
