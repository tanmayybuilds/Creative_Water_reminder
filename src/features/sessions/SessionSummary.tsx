"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session";
import { TASK_LABELS } from "@/data/tasks";
import { ROAST_LABELS } from "@/data/roasts";
import { Clock, Target, Zap } from "lucide-react";

export const SessionSummary: React.FC = () => {
  const taskType = useSessionStore((s) => s.taskType);
  const customTask = useSessionStore((s) => s.customTask);
  const durationMinutes = useSessionStore((s) => s.durationMinutes);
  const roastIntensity = useSessionStore((s) => s.roastIntensity);

  const taskName =
    taskType === "custom"
      ? customTask.trim() || "Custom Task"
      : TASK_LABELS[taskType];

  const durationLabel =
    durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ""}`
      : `${durationMinutes} min`;

  const items = [
    { icon: Target, label: "Task", value: taskName },
    { icon: Clock, label: "Duration", value: durationLabel },
    { icon: Zap, label: "Mode", value: ROAST_LABELS[roastIntensity] },
  ];

  return (
    <motion.div
      layout
      className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5"
    >
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-mono mb-3">
        Session Summary
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.label}>
              {i > 0 && (
                <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
              )}
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    {item.label}
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
};
