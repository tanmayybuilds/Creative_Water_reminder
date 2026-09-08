"use client";

import React from "react";
import { motion } from "framer-motion";
import { ROAST_OPTIONS } from "@/data/roasts";
import { useSessionStore } from "@/store/session";
import type { RoastIntensity } from "@/types";

export const RoastSelector: React.FC = () => {
  const roastIntensity = useSessionStore((s) => s.roastIntensity);
  const setRoastIntensity = useSessionStore((s) => s.setRoastIntensity);

  return (
    <section aria-labelledby="roast-heading">
      <h2
        id="roast-heading"
        className="text-sm uppercase tracking-widest text-zinc-500 font-mono mb-4"
      >
        How savage should we be?
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ROAST_OPTIONS.map((option) => {
          const isSelected = roastIntensity === option.intensity;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.intensity}
              onClick={() => setRoastIntensity(option.intensity)}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isSelected}
              aria-label={`${option.label}: ${option.description}`}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl
                border transition-all duration-200 cursor-pointer text-center
                ${
                  isSelected
                    ? "bg-white/[0.07] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isSelected ? "text-white" : "text-zinc-500"
                }`}
                strokeWidth={isSelected ? 2 : 1.5}
              />
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  isSelected ? "text-white" : "text-zinc-400"
                }`}
              >
                {option.label}
              </span>
              <span className="text-[10px] text-zinc-600 leading-tight hidden sm:block">
                {option.description}
              </span>

              {isSelected && (
                <motion.div
                  layoutId="roast-indicator"
                  className="absolute inset-0 rounded-xl border border-white/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
