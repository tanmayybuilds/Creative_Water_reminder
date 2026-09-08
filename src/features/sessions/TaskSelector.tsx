"use client";

import React from "react";
import { motion } from "framer-motion";
import { TASK_OPTIONS } from "@/data/tasks";
import { useSessionStore } from "@/store/session";
import type { TaskType } from "@/types";

export const TaskSelector: React.FC = () => {
  const taskType = useSessionStore((s) => s.taskType);
  const setTask = useSessionStore((s) => s.setTask);
  const customTask = useSessionStore((s) => s.customTask);
  const setCustomTask = useSessionStore((s) => s.setCustomTask);

  return (
    <section aria-labelledby="task-heading">
      <h2
        id="task-heading"
        className="text-sm uppercase tracking-widest text-zinc-500 font-mono mb-4"
      >
        What are you locking in for?
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TASK_OPTIONS.map((option) => {
          const isSelected = taskType === option.type;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.type}
              onClick={() => setTask(option.type)}
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

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="task-indicator"
                  className="absolute inset-0 rounded-xl border border-white/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom task input */}
      {taskType === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3"
        >
          <label htmlFor="custom-task-input" className="sr-only">
            Custom task name
          </label>
          <input
            id="custom-task-input"
            type="text"
            value={customTask}
            onChange={(e) => setCustomTask(e.target.value)}
            placeholder="What are you working on?"
            maxLength={100}
            autoFocus
            className={`
              w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-white
              placeholder:text-zinc-600 outline-none transition-all duration-200
              focus:bg-white/[0.05]
              ${
                customTask.trim().length === 0
                  ? "border-white/[0.06] focus:border-zinc-500"
                  : "border-white/15 focus:border-white/25"
              }
            `}
          />
          <p className="text-[10px] text-zinc-600 mt-1.5 pl-1">
            e.g. &ldquo;Physics — Rotational Motion&rdquo; or &ldquo;Build my website&rdquo;
          </p>
        </motion.div>
      )}
    </section>
  );
};
