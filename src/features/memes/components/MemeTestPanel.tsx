import React, { useState, useEffect, useRef } from "react";
import { useMemePlayer } from "../useMemePlayer";
import { MemeAssetProvider } from "../assetProvider";
import { useBehaviorEngine } from "../behavior";
import { BEHAVIOR_FIXTURES } from "../fixtures";
import type {
  MemeId,
  MemePosition,
  EntranceAnimationType,
  ExitAnimationType,
  MovementProfileType,
  TrajectoryDirection,
} from "../types";
import {
  Play,
  Square,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Maximize2,
  Move,
  Film,
  Layers,
  ChevronDown,
  ChevronUp,
  Dices,
  RotateCcw,
  Repeat,
  Gauge,
  ListVideo,
  Pause,
  BrainCircuit,
  Coffee,
  XCircle,
  DoorOpen,
  History,
  Navigation,
  Compass,
  Star,
} from "lucide-react";

const POSITIONS: MemePosition[] = [
  "topLeft",
  "top",
  "topRight",
  "centerLeft",
  "center",
  "centerRight",
  "bottomLeft",
  "bottom",
  "bottomRight",
];

const MOVEMENT_PROFILES: { id: MovementProfileType; label: string; icon: string }[] = [
  { id: "crossScreen", label: "crossScreen (Continuous)", icon: "✈️" },
  { id: "enterAndStop", label: "enterAndStop (Edge → Pos)", icon: "🛑" },
  { id: "popAndReact", label: "popAndReact (Scale 0.1→1)", icon: "💥" },
  { id: "edgePeek", label: "edgePeek (Partial Peek)", icon: "👀" },
  { id: "dropFromTop", label: "dropFromTop (Top Drop)", icon: "⬇️" },
  { id: "riseFromBottom", label: "riseFromBottom (Bottom Rise)", icon: "⬆️" },
];

const TRAJECTORY_DIRECTIONS: { id: TrajectoryDirection; label: string }[] = [
  { id: "rightToLeft", label: "Right → Left" },
  { id: "leftToRight", label: "Left → Right" },
  { id: "topToBottom", label: "Top → Bottom" },
  { id: "bottomToTop", label: "Bottom → Top" },
  { id: "none", label: "None (Stationary / Pop)" },
];

const ENTRANCES: { id: EntranceAnimationType; label: string }[] = [
  { id: "pop", label: "Pop (Bouncy)" },
  { id: "fade", label: "Fade (Smooth)" },
  { id: "slideFromLeft", label: "Slide Left → In" },
  { id: "slideFromRight", label: "Slide Right → In" },
  { id: "slideFromTop", label: "Slide Top → In" },
  { id: "slideFromBottom", label: "Slide Bottom → In" },
  { id: "peekFromLeft", label: "Peek Left (Edge)" },
  { id: "peekFromRight", label: "Peek Right (Edge)" },
];

const EXITS: { id: ExitAnimationType; label: string }[] = [
  { id: "fade", label: "Fade Out" },
  { id: "shrink", label: "Shrink (Scale 0)" },
  { id: "slideToLeft", label: "Slide → Left Out" },
  { id: "slideToRight", label: "Slide → Right Out" },
  { id: "slideToTop", label: "Slide → Top Out" },
  { id: "slideToBottom", label: "Slide → Bottom Out" },
];

export const MemeTestPanel: React.FC = () => {
  const {
    allMemes,
    activeMeme,
    isPlaying,
    isPaused,
    stage,
    play,
    stop,
    togglePause,
    globalVolume,
    setGlobalVolume,
    isMuted,
    setMuted,
    playbackRate,
    setPlaybackRate,
    isLooping,
    setLooping,
  } = useMemePlayer();

  // Behavior Engine state
  const behavior = useBehaviorEngine();

  const [activeTab, setActiveTab] = useState<"player" | "behavior">("player");
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMemeId, setSelectedMemeId] = useState<MemeId>("gucci_dance");
  const [selectedMovementProfile, setSelectedMovementProfile] = useState<MovementProfileType>("crossScreen");
  const [selectedDirection, setSelectedDirection] = useState<TrajectoryDirection>("rightToLeft");
  const [selectedPosition, setSelectedPosition] = useState<MemePosition>("center");
  const [selectedEntrance, setSelectedEntrance] = useState<EntranceAnimationType>("slideFromRight");
  const [selectedExit, setSelectedExit] = useState<ExitAnimationType>("slideToLeft");
  const [scale, setScale] = useState<number>(1.0);
  const [assetMode, setAssetMode] = useState<"raw" | "processed">("raw");
  const [isSequentialRunning, setIsSequentialRunning] = useState(false);
  const [selectedFixtureKey, setSelectedFixtureKey] = useState<string>("first_dismissal");

  const sequentialIndexRef = useRef(0);
  const sequentialTimerRef = useRef<number | null>(null);

  const currentMemeDef = allMemes.find((m) => m.id === selectedMemeId);

  // Sync default options when meme changes via dropdown
  const handleMemeChange = (id: MemeId) => {
    setSelectedMemeId(id);
    const def = allMemes.find((m) => m.id === id);
    if (def) {
      setSelectedPosition(def.movement.targetPosition || def.preferredPositions[0] || "center");
      setSelectedMovementProfile(def.movement.profile);
      setSelectedDirection(def.movement.direction || "none");
      setSelectedEntrance(def.defaultEntrance || "pop");
      setSelectedExit(def.movement.exitOverride || def.defaultExit || "fade");
      setScale(def.defaultScale || 1.0);
    }
  };

  const handleRandomMeme = () => {
    const randomIndex = Math.floor(Math.random() * allMemes.length);
    const randomMeme = allMemes[randomIndex];
    handleMemeChange(randomMeme.id);
  };

  const handleResetDefaults = () => {
    if (currentMemeDef) {
      setSelectedPosition(currentMemeDef.movement.targetPosition || currentMemeDef.preferredPositions[0] || "center");
      setSelectedMovementProfile(currentMemeDef.movement.profile);
      setSelectedDirection(currentMemeDef.movement.direction || "none");
      setSelectedEntrance(currentMemeDef.defaultEntrance || "pop");
      setSelectedExit(currentMemeDef.movement.exitOverride || currentMemeDef.defaultExit || "fade");
      setScale(currentMemeDef.defaultScale || 1.0);
      setGlobalVolume(1.0);
      setMuted(false);
      setPlaybackRate(1.0);
      setLooping(false);
    }
  };

  const handlePlayMovement = () => {
    setIsSequentialRunning(false);
    play(selectedMemeId, {
      position: selectedPosition,
      movementProfile: selectedMovementProfile,
      trajectoryDirection: selectedDirection,
      entrance: selectedEntrance,
      exit: selectedExit,
      scale,
      volume: globalVolume,
      loop: isLooping,
      playbackRate,
      muted: isMuted,
    });
  };

  const handlePlayGucciTransparent = () => {
    setIsSequentialRunning(false);
    setAssetMode("processed");
    MemeAssetProvider.setMode("processed");
    setSelectedMemeId("gucci_dance");
    setSelectedMovementProfile("crossScreen");
    setSelectedDirection("rightToLeft");
    setSelectedPosition("center");

    play("gucci_dance", {
      position: "center",
      movementProfile: "crossScreen",
      trajectoryDirection: "rightToLeft",
      scale: 1.0,
      volume: globalVolume,
      loop: isLooping,
      playbackRate,
      muted: isMuted,
    });
  };

  const handleAssetModeToggle = () => {
    const nextMode = assetMode === "raw" ? "processed" : "raw";
    setAssetMode(nextMode);
    MemeAssetProvider.setMode(nextMode);
  };

  // Sequential Playback loop (Gallery demo mode)
  const startSequentialPlay = () => {
    setIsSequentialRunning(true);
    sequentialIndexRef.current = 0;
    playNextSequential();
  };

  const playNextSequential = () => {
    if (sequentialIndexRef.current >= allMemes.length) {
      sequentialIndexRef.current = 0;
    }
    const currentMeme = allMemes[sequentialIndexRef.current];
    setSelectedMemeId(currentMeme.id);
    setSelectedPosition(currentMeme.movement.targetPosition || currentMeme.preferredPositions[0] || "center");
    setSelectedMovementProfile(currentMeme.movement.profile);
    setSelectedDirection(currentMeme.movement.direction || "none");
    setSelectedEntrance(currentMeme.defaultEntrance || "pop");
    setSelectedExit(currentMeme.movement.exitOverride || currentMeme.defaultExit || "fade");
    setScale(currentMeme.defaultScale || 1.0);

    play(currentMeme.id, {
      position: currentMeme.movement.targetPosition || currentMeme.preferredPositions[0] || "center",
      movementProfile: currentMeme.movement.profile,
      trajectoryDirection: currentMeme.movement.direction || "none",
      entrance: currentMeme.defaultEntrance || "pop",
      exit: currentMeme.movement.exitOverride || currentMeme.defaultExit || "fade",
      scale: currentMeme.defaultScale || 1.0,
      volume: globalVolume,
      loop: false,
      playbackRate,
      muted: isMuted,
      onComplete: () => {
        if (isSequentialRunning) {
          sequentialIndexRef.current += 1;
          sequentialTimerRef.current = window.setTimeout(() => {
            playNextSequential();
          }, 800);
        }
      },
    });
  };

  useEffect(() => {
    return () => {
      if (sequentialTimerRef.current) {
        clearTimeout(sequentialTimerRef.current);
      }
    };
  }, []);

  const handleLoadFixture = () => {
    const fixture = BEHAVIOR_FIXTURES[selectedFixtureKey];
    if (fixture) {
      behavior.loadFixture(fixture);
    }
  };

  return (
    <aside
      aria-label="Developer Meme Test Panel"
      className="fixed bottom-4 right-4 z-[9999] w-full max-w-sm sm:max-w-md rounded-3xl bg-zinc-950/95 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-zinc-100 overflow-hidden select-none transition-all duration-300"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-100">
            MEME DEV TEST PANEL
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            STEP 6
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying
                  ? isPaused
                    ? "bg-amber-400"
                    : "bg-emerald-400 animate-pulse"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-[10px] font-mono uppercase text-zinc-300">
              {isPaused ? "PAUSED" : stage}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title={isExpanded ? "Collapse Panel" : "Expand Panel"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 flex flex-col gap-3.5 text-xs max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* Navigation Tabs: Movement & Player vs Behavior Engine */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/10">
            <button
              onClick={() => setActiveTab("player")}
              className={`h-8 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "player"
                  ? "bg-amber-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Movement & Player
            </button>

            <button
              onClick={() => setActiveTab("behavior")}
              className={`h-8 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "behavior"
                  ? "bg-amber-400 text-black shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              Behavior Engine
            </button>
          </div>

          {activeTab === "player" ? (
            /* TAB 1: STRATEGIC MOVEMENT & MEME PLAYER CONTROLS */
            <>
              {/* Highlighted Dedicated Action: PLAY GUCCI TRANSPARENT */}
              <button
                onClick={handlePlayGucciTransparent}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(52,211,153,0.35)] active:scale-[0.98] cursor-pointer"
              >
                <Star className="w-4 h-4 fill-black" />
                PLAY GUCCI TRANSPARENT (WEBM)
              </button>

              {/* Meme Asset Selector & Quick Toolbar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 font-bold uppercase">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    Select Meme ({allMemes.length})
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleRandomMeme}
                      className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-zinc-300 flex items-center gap-1 border border-white/5 transition-colors cursor-pointer"
                      title="Pick random meme"
                    >
                      <Dices className="w-3 h-3 text-amber-400" />
                      Random
                    </button>

                    <button
                      onClick={handleResetDefaults}
                      className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-zinc-300 flex items-center gap-1 border border-white/5 transition-colors cursor-pointer"
                      title="Reset to meme default settings"
                    >
                      <RotateCcw className="w-3 h-3 text-zinc-400" />
                      Reset
                    </button>
                  </div>
                </div>

                <select
                  value={selectedMemeId}
                  onChange={(e) => handleMemeChange(e.target.value as MemeId)}
                  className="w-full h-10 rounded-xl bg-zinc-900 border border-white/15 px-3 font-mono text-xs text-zinc-100 focus:outline-none focus:border-amber-400/80 cursor-pointer"
                >
                  {allMemes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} — [{m.movement.profile.toUpperCase()}]
                    </option>
                  ))}
                </select>

                {currentMemeDef && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="font-semibold text-white truncate max-w-[200px]">
                        {currentMemeDef.filename}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] uppercase font-bold flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5" />
                        {currentMemeDef.movement.profile}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 italic leading-snug">
                      {currentMemeDef.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Strategic Movement Profile Controls */}
              <div className="grid grid-cols-2 gap-2.5 p-2.5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20">
                {/* Movement Profile */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 font-mono text-[10px] text-amber-300 font-bold uppercase">
                    <Navigation className="w-3 h-3 text-amber-400" />
                    Movement Profile
                  </label>
                  <select
                    value={selectedMovementProfile}
                    onChange={(e) => setSelectedMovementProfile(e.target.value as MovementProfileType)}
                    className="w-full h-8 rounded-xl bg-zinc-900 border border-white/15 px-2 font-mono text-[11px] text-zinc-100 focus:outline-none focus:border-amber-400/80 cursor-pointer"
                  >
                    {MOVEMENT_PROFILES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trajectory Direction */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 font-mono text-[10px] text-amber-300 font-bold uppercase">
                    <Compass className="w-3 h-3 text-amber-400" />
                    Trajectory Direction
                  </label>
                  <select
                    value={selectedDirection}
                    onChange={(e) => setSelectedDirection(e.target.value as TrajectoryDirection)}
                    className="w-full h-8 rounded-xl bg-zinc-900 border border-white/15 px-2 font-mono text-[11px] text-zinc-100 focus:outline-none focus:border-amber-400/80 cursor-pointer"
                  >
                    {TRAJECTORY_DIRECTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive 3x3 Position Grid */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3 text-amber-400" />
                    Target Viewport Position
                  </span>
                  <span className="text-amber-300 font-bold">{selectedPosition}</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-zinc-900/80 border border-white/10">
                  {POSITIONS.map((pos) => {
                    const isSelected = selectedPosition === pos;
                    let shortLabel: string = pos;
                    if (pos === "topLeft") shortLabel = "↖ TL";
                    if (pos === "top") shortLabel = "↑ Top";
                    if (pos === "topRight") shortLabel = "↗ TR";
                    if (pos === "centerLeft") shortLabel = "← Left";
                    if (pos === "center") shortLabel = "🎯 Center";
                    if (pos === "centerRight") shortLabel = "→ Right";
                    if (pos === "bottomLeft") shortLabel = "↙ BL";
                    if (pos === "bottom") shortLabel = "↓ Bot";
                    if (pos === "bottomRight") shortLabel = "↘ BR";

                    return (
                      <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`h-8 rounded-lg font-mono text-[10px] uppercase font-semibold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                            : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"
                        }`}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Entrance & Exit Animations */}
              <div className="grid grid-cols-2 gap-3">
                {/* Entrance */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 font-mono text-[10px] text-zinc-400 uppercase font-bold">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    Entrance Override
                  </label>
                  <select
                    value={selectedEntrance}
                    onChange={(e) => setSelectedEntrance(e.target.value as EntranceAnimationType)}
                    className="w-full h-8 rounded-xl bg-zinc-900 border border-white/15 px-2 font-mono text-[11px] text-zinc-200 focus:outline-none focus:border-amber-400/80 cursor-pointer"
                  >
                    {ENTRANCES.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exit */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 font-mono text-[10px] text-zinc-400 uppercase font-bold">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    Exit Override
                  </label>
                  <select
                    value={selectedExit}
                    onChange={(e) => setSelectedExit(e.target.value as ExitAnimationType)}
                    className="w-full h-8 rounded-xl bg-zinc-900 border border-white/15 px-2 font-mono text-[11px] text-zinc-200 focus:outline-none focus:border-amber-400/80 cursor-pointer"
                  >
                    {EXITS.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scale Slider & Presets */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-white/[0.06]">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1 uppercase font-bold">
                    <Maximize2 className="w-3 h-3 text-amber-400" />
                    Scale Override
                  </span>
                  <span className="text-zinc-200 font-bold">{scale.toFixed(2)}x</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.4"
                    max="1.8"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex items-center gap-1 font-mono text-[9px]">
                    {[0.75, 1.0, 1.25, 1.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`px-1.5 py-0.5 rounded ${
                          scale === s
                            ? "bg-amber-400 text-black font-bold"
                            : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio, Speed & Loop Toolbar */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1 border-t border-white/[0.06]">
                {/* Volume */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1 uppercase font-bold">
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      Volume
                    </span>
                    <span className="text-zinc-200">{isMuted ? "Muted" : `${Math.round(globalVolume * 100)}%`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMuted(!isMuted)}
                      className="p-1 rounded bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={globalVolume}
                      onChange={(e) => {
                        setGlobalVolume(parseFloat(e.target.value));
                        if (isMuted) setMuted(false);
                      }}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>

                {/* Playback Speed & Loop */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1 uppercase font-bold">
                      <Gauge className="w-3 h-3 text-amber-400" />
                      Speed & Loop
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {[0.75, 1.0, 1.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setPlaybackRate(rate)}
                        className={`flex-1 h-7 rounded-lg text-center font-bold transition-colors cursor-pointer ${
                          playbackRate === rate
                            ? "bg-amber-400 text-black"
                            : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                    <button
                      onClick={() => setLooping(!isLooping)}
                      className={`h-7 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isLooping
                          ? "bg-purple-600 text-white font-bold"
                          : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
                      }`}
                      title="Toggle continuous video loop"
                    >
                      <Repeat className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Asset Mode Switcher */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] font-mono text-[10px]">
                <span className="flex items-center gap-1 text-zinc-400 font-bold uppercase">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  Asset Mode:
                </span>
                <button
                  onClick={handleAssetModeToggle}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 font-bold border border-white/10 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {assetMode === "raw" ? "RAW (MP4)" : "PROCESSED (WebM)"}
                </button>
              </div>

              {/* Main Action Buttons */}
              <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayMovement}
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(251,191,36,0.3)] active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    PLAY MOVEMENT
                  </button>

                  {isPlaying && (
                    <button
                      onClick={togglePause}
                      className="h-11 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-zinc-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={isPaused ? "Resume video" : "Pause video"}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      {isPaused ? "RESUME" : "PAUSE"}
                    </button>
                  )}

                  <button
                    onClick={stop}
                    disabled={!isPlaying}
                    className={`h-11 px-4 rounded-2xl border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                      isPlaying
                        ? "bg-red-950/60 border-red-800/80 text-red-300 hover:bg-red-900/80 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-zinc-900 border-white/5 text-zinc-600 cursor-not-allowed"
                    }`}
                    title="Interrupt and close active meme"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    STOP
                  </button>
                </div>

                {/* Sequential Demo Gallery Mode Button */}
                <button
                  onClick={startSequentialPlay}
                  className={`w-full h-9 rounded-xl font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isSequentialRunning
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-zinc-300"
                  }`}
                >
                  <ListVideo className="w-3.5 h-3.5 text-amber-400" />
                  {isSequentialRunning ? "⚡ PLAYING ALL 11 MOVEMENTS..." : "⚡ DEMO: PLAY ALL 11 WITH MOVEMENTS"}
                </button>
              </div>
            </>
          ) : (
            /* TAB 2: BEHAVIOR ENGINE SIMULATOR & FIXTURES */
            <div className="flex flex-col gap-3.5">
              {/* Fixture Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 font-bold uppercase">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Load Behavior Test Fixture
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedFixtureKey}
                    onChange={(e) => setSelectedFixtureKey(e.target.value)}
                    className="flex-1 h-9 rounded-xl bg-zinc-900 border border-white/15 px-3 font-mono text-xs text-zinc-100 focus:outline-none focus:border-amber-400/80 cursor-pointer"
                  >
                    {Object.values(BEHAVIOR_FIXTURES).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} (cd:{f.consecutiveDismissals}, td:{f.totalDismissals}, exit:{f.exitAttempts})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleLoadFixture}
                    className="h-9 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-zinc-200 font-mono text-[11px] uppercase font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Behavior Simulation Action Buttons */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-zinc-400 uppercase font-bold">
                  Simulate User Actions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => behavior.handleLeaveMeAlone()}
                    className="h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-[11px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Leave Me Alone
                  </button>

                  <button
                    onClick={() => behavior.handleTakeABreak()}
                    className="h-10 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Take A Break
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => behavior.handleExitAttempt()}
                    className="h-9 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <DoorOpen className="w-3 h-3" />
                    Exit Attempt ({behavior.exitAttempts})
                  </button>

                  <button
                    onClick={() => behavior.triggerManojFinale()}
                    className="h-9 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Manoj Finale
                  </button>
                </div>
              </div>

              {/* Behavior Live Inspector Card */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold uppercase">Escalation Level:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    LEVEL {behavior.currentEscalationLevel} {behavior.currentEscalationLevel === 3 ? "(Final Exit)" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04] text-[10px]">
                  <div className="flex justify-between text-zinc-400">
                    <span>Consecutive:</span>
                    <span className="text-white font-bold">{behavior.consecutiveDismissals}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Refused:</span>
                    <span className="text-white font-bold">{behavior.totalDismissals}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Breaks Taken:</span>
                    <span className="text-emerald-400 font-bold">{behavior.breaksAccepted}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Exit Attempts:</span>
                    <span className="text-purple-300 font-bold">{behavior.exitAttempts}</span>
                  </div>
                </div>

                {behavior.paisaYaPehchaanShown && (
                  <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold text-center">
                    ⚠️ PAISA YA PEHCHAAN TRIGGERED (Level 3)
                  </div>
                )}

                {/* Recent Meme History Queue */}
                <div className="flex flex-col gap-1 pt-1 border-t border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                    <History className="w-3 h-3 text-amber-400" />
                    Recent Meme History (Max {behavior.config.historyLength}):
                  </span>
                  {behavior.recentMemes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {behavior.recentMemes.map((m, idx) => (
                        <span
                          key={`${m}-${idx}`}
                          className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-zinc-300 border border-white/10"
                        >
                          {idx + 1}. {m}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-600 italic">No recent history yet</span>
                  )}
                </div>
              </div>

              {/* Reset Behavior Button */}
              <button
                onClick={() => behavior.resetBehaviorState()}
                className="w-full h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-zinc-400 hover:text-zinc-200 font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Behavior State
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
