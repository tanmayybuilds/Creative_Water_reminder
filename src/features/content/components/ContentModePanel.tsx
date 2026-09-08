import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContentStore, CONTENT_SCENARIOS } from "../contentStore";
import { CONTENT_TIMING_PRESETS, type ContentTimingPreset } from "../contentTimingConfig";
import type { ContentScenarioId } from "../contentTypes";
import { useBreakSessionStore } from "@/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "@/features/reminder/reminderStore";
import { useMemeStore } from "@/features/memes/memeStore";
import {
  Clapperboard,
  Video,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Coffee,
  XCircle,
  DoorOpen,
  Crown,
  ChevronDown,
  ChevronUp,
  Sliders,
  Film,
  Zap,
  Eye,
  EyeOff,
  Activity,
  AlertTriangle,
} from "lucide-react";

export const ContentModePanel: React.FC = () => {
  const content = useContentStore();
  const currentSession = useBreakSessionStore((s) => s.currentSession);
  const reminderStatus = useBreakReminderStore((s) => s.status);
  const activeMeme = useMemeStore((s) => s.activeMeme);

  const [isMinimized, setIsMinimized] = useState(false);

  // Global Keyboard Shortcut: Ctrl + Shift + C (or Cmd + Shift + C) to toggle Content Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        content.togglePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  // If recording mode is enabled, hide the panel completely to keep the screen recording 100% clean
  if (content.isRecordingMode) {
    return (
      <div className="fixed bottom-2 right-2 z-[99999] opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={() => content.setRecordingMode(false)}
          className="px-2.5 py-1 rounded-full bg-red-600/80 hover:bg-red-500 text-white font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          title="Exit Recording Mode (Ctrl+Shift+C)"
        >
          <Eye className="w-3 h-3 animate-pulse" />
          REC ACTIVE (CLICK TO EXIT)
        </button>
      </div>
    );
  }

  // If panel is not open, show a floating trigger button at the bottom-right
  if (!content.isOpen) {
    return (
      <button
        onClick={() => content.setOpen(true)}
        className="fixed bottom-4 right-4 z-[99999] px-3.5 py-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 font-mono text-xs uppercase font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all hover:scale-105 cursor-pointer backdrop-blur-xl"
        title="Open Content Mode Controls (Ctrl+Shift+C)"
      >
        <Clapperboard className="w-4 h-4 text-amber-400" />
        🎬 CONTENT MODE
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
          Ctrl+Shift+C
        </span>
      </button>
    );
  }

  const sessionStatus = currentSession?.status || reminderStatus;
  const refusalCount = currentSession?.refusalCount || 0;
  const exitAttemptCount = currentSession?.exitAttemptCount || 0;
  const memesPlayedCount = currentSession?.memesPlayedThisBreak.length || 0;
  const finalChoiceAttempts = currentSession?.finalChoiceAttempts || 0;

  return (
    <aside
      aria-label="Developer Content Mode Panel"
      className="fixed bottom-4 right-4 z-[99999] w-full max-w-sm sm:max-w-md rounded-3xl bg-zinc-950/95 border border-amber-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-zinc-100 overflow-hidden select-none transition-all duration-300"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-500/[0.08] border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-black tracking-wider uppercase text-amber-300 flex items-center gap-1.5">
              LOCKIN CONTENT MODE
            </h3>
            <p className="text-[9px] font-mono text-zinc-400">Creator Screen-Recording Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Recording Mode Button */}
          <button
            onClick={() => content.setRecordingMode(true)}
            className="px-2 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Hide all developer UI for clean screen recording"
          >
            <Video className="w-3 h-3 text-red-400" />
            REC MODE
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title={isMinimized ? "Expand Panel" : "Minimize Panel"}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close Panel Button */}
          <button
            onClick={() => content.setOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title="Close Panel (Ctrl+Shift+C)"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 flex flex-col gap-3.5 text-xs max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Individual Real User Simulation Controls */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 font-bold uppercase">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Simulated User Actions
              </span>
              <span className="text-zinc-500">Real State Machine</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* TRIGGER BREAK */}
              <button
                id="btn-cm-trigger-break"
                onClick={content.triggerBreak}
                className="h-10 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                TRIGGER BREAK
              </button>

              {/* TAKE A BREAK */}
              <button
                id="btn-cm-take-break"
                onClick={content.takeABreak}
                className="h-10 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Coffee className="w-3.5 h-3.5" />
                TAKE A BREAK
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* LEAVE ME ALONE */}
              <button
                id="btn-cm-leave-alone"
                onClick={content.leaveMeAlone}
                className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3 h-3 text-red-400" />
                LEAVE ME ALONE
              </button>

              {/* REFUSE AGAIN */}
              <button
                id="btn-cm-refuse-again"
                onClick={content.refuseAgain}
                className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3 h-3 text-amber-400" />
                REFUSE AGAIN
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* ATTEMPT EXIT */}
              <button
                id="btn-cm-attempt-exit"
                onClick={content.attemptExit}
                className="h-9 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <DoorOpen className="w-3 h-3" />
                ATTEMPT EXIT ({exitAttemptCount})
              </button>

              {/* FORCE FINALE */}
              <button
                id="btn-cm-force-finale"
                onClick={content.forceFinale}
                className="h-9 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                FORCE FINALE
              </button>
            </div>
          </div>

          {/* Section 2: Full Scenario Demo Automation */}
          <div className="p-3 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 flex flex-col gap-2.5">
            <div className="flex items-center justify-between font-mono text-[10px] text-amber-300 font-bold uppercase">
              <span className="flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Scenario Recording Presets
              </span>
              <span className="text-zinc-400 font-normal">
                {CONTENT_SCENARIOS[content.selectedScenario]?.estimatedDuration}
              </span>
            </div>

            {/* Scenario Picker Dropdown */}
            <select
              value={content.selectedScenario}
              onChange={(e) => content.setSelectedScenario(e.target.value as ContentScenarioId)}
              disabled={content.isRunningScenario}
              className="w-full h-9 rounded-xl bg-zinc-900 border border-white/15 px-3 font-mono text-xs text-zinc-100 focus:outline-none focus:border-amber-400/80 cursor-pointer disabled:opacity-50"
            >
              {Object.values(CONTENT_SCENARIOS).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <p className="text-[10px] text-zinc-400 italic">
              {CONTENT_SCENARIOS[content.selectedScenario]?.description}
            </p>

            {/* Timing Preset Selector */}
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 pt-1 border-t border-white/[0.04]">
              <span className="flex items-center gap-1 uppercase font-bold">
                <Sliders className="w-3 h-3 text-amber-400" />
                Timing:
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {(["FAST", "NORMAL", "CINEMATIC"] as ContentTimingPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => content.setTimingPreset(preset)}
                    disabled={content.isRunningScenario}
                    className={`px-2 py-0.5 rounded-md font-bold uppercase transition-colors cursor-pointer disabled:opacity-50 ${
                      content.activeTimingPreset === preset
                        ? "bg-amber-400 text-black shadow-sm"
                        : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {!content.isRunningScenario ? (
                <button
                  id="btn-cm-run-scenario"
                  onClick={() => content.runScenario()}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  ▶ RUN FULL SCENARIO
                </button>
              ) : (
                <button
                  id="btn-cm-stop-scenario"
                  onClick={content.stopScenario}
                  className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  ⏹ STOP SCENARIO
                </button>
              )}

              {/* Reset Scenario Button */}
              <button
                id="btn-cm-reset-scenario"
                onClick={content.resetScenario}
                className="h-10 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-zinc-200 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Stop meme and return app to clean IDLE state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                RESET
              </button>
            </div>

            {/* Scenario Progress / Status */}
            {content.isRunningScenario && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center justify-between">
                <span className="truncate">{content.scenarioStatusText}</span>
                <span className="font-bold shrink-0">
                  Step {content.currentScenarioStep} / {content.totalScenarioSteps}
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Live System Inspector (Visible only inside panel) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-bold uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                Current State:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                {sessionStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04] text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>Refusals:</span>
                <span className="text-white font-bold">{refusalCount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Exit Attempts:</span>
                <span className="text-purple-300 font-bold">{exitAttemptCount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Memes Played:</span>
                <span className="text-amber-300 font-bold">{memesPlayedCount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Final Attempts:</span>
                <span className="text-red-300 font-bold">{finalChoiceAttempts} / 3</span>
              </div>
            </div>

            {activeMeme && (
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-center justify-between">
                <span className="font-semibold truncate">Active Meme:</span>
                <span className="font-bold">{activeMeme.meme.id}</span>
              </div>
            )}
          </div>

          {/* Hide Controls Button */}
          <button
            onClick={() => content.setOpen(false)}
            className="w-full py-2 rounded-xl font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            [ HIDE CONTENT CONTROLS (Ctrl+Shift+C) ]
          </button>
        </div>
      )}
    </aside>
  );
};
