"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DURATION_PRESETS, MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from "@/data/durations";
import { useSessionStore } from "@/store/session";
import { Timer } from "lucide-react";

export const DurationSelector: React.FC = () => {
  const durationMinutes = useSessionStore((s) => s.durationMinutes);
  const isCustomDuration = useSessionStore((s) => s.isCustomDuration);
  const setDuration = useSessionStore((s) => s.setDuration);

  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");

  // Sync custom input with store when switching to custom
  useEffect(() => {
    if (isCustomDuration) {
      setCustomInput(String(durationMinutes));
    }
  }, [isCustomDuration, durationMinutes]);

  const isPreset = !isCustomDuration && DURATION_PRESETS.some((p) => p.minutes === durationMinutes);

  const handleCustomToggle = () => {
    if (!isCustomDuration) {
      setCustomInput(String(durationMinutes));
      setDuration(durationMinutes, true);
    }
  };

  const handleCustomChange = (value: string) => {
    // Allow only digits
    const cleaned = value.replace(/[^\d]/g, "");
    setCustomInput(cleaned);
    setCustomError("");

    if (cleaned === "") return;

    const num = parseInt(cleaned, 10);
    if (num < MIN_DURATION_MINUTES) {
      setCustomError(`Minimum ${MIN_DURATION_MINUTES} minute`);
    } else if (num > MAX_DURATION_MINUTES) {
      setCustomError(`Maximum ${MAX_DURATION_MINUTES} minutes (8 hours)`);
    } else {
      setDuration(num, true);
    }
  };

  const handleCustomBlur = () => {
    if (customInput === "" || parseInt(customInput, 10) < MIN_DURATION_MINUTES) {
      setCustomInput(String(durationMinutes));
      setCustomError("");
    } else if (parseInt(customInput, 10) > MAX_DURATION_MINUTES) {
      setCustomInput(String(MAX_DURATION_MINUTES));
      setDuration(MAX_DURATION_MINUTES, true);
      setCustomError("");
    }
  };

  return (
    <section aria-labelledby="duration-heading">
      <h2
        id="duration-heading"
        className="text-sm uppercase tracking-widest text-zinc-500 font-mono mb-4"
      >
        How long are you locking in?
      </h2>

      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map((preset) => {
          const isSelected = !isCustomDuration && durationMinutes === preset.minutes;
          return (
            <motion.button
              key={preset.minutes}
              onClick={() => setDuration(preset.minutes, false)}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isSelected}
              aria-label={`${preset.label} duration`}
              className={`
                relative px-4 py-2.5 rounded-xl border text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? "bg-white/[0.07] border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:border-white/10 hover:text-zinc-300"
                }
              `}
            >
              {preset.label}
              {isSelected && (
                <motion.div
                  layoutId="duration-indicator"
                  className="absolute inset-0 rounded-xl border border-white/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}

        {/* Custom duration toggle */}
        <motion.button
          onClick={handleCustomToggle}
          whileTap={{ scale: 0.95 }}
          aria-pressed={isCustomDuration}
          aria-label="Custom duration"
          className={`
            relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium
            transition-all duration-200 cursor-pointer
            ${
              isCustomDuration
                ? "bg-white/[0.07] border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:border-white/10 hover:text-zinc-300"
            }
          `}
        >
          <Timer className="w-3.5 h-3.5" />
          Custom
          {isCustomDuration && (
            <motion.div
              layoutId="duration-indicator"
              className="absolute inset-0 rounded-xl border border-white/20"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </motion.button>
      </div>

      {/* Custom duration input */}
      {isCustomDuration && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3"
        >
          <div className="flex items-center gap-3">
            <label htmlFor="custom-duration-input" className="sr-only">
              Custom duration in minutes
            </label>
            <input
              id="custom-duration-input"
              type="text"
              inputMode="numeric"
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              onBlur={handleCustomBlur}
              placeholder="Minutes"
              autoFocus
              className={`
                w-28 px-4 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white text-center
                placeholder:text-zinc-600 outline-none transition-all duration-200
                focus:bg-white/[0.05]
                ${customError ? "border-red-500/40" : "border-white/[0.06] focus:border-white/15"}
              `}
            />
            <span className="text-sm text-zinc-500">minutes</span>
          </div>
          {customError && (
            <p className="text-[11px] text-red-400/80 mt-1.5 pl-1">{customError}</p>
          )}
        </motion.div>
      )}
    </section>
  );
};
