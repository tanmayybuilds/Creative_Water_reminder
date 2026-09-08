import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TaskType, RoastIntensity, SessionConfig } from "@/types";
import { TASK_LABELS } from "@/data/tasks";
import { DEFAULT_DURATION_MINUTES } from "@/data/durations";

interface SessionSetupState {
  // ── Setup fields ──────────────────────────────────────────
  taskType: TaskType;
  customTask: string;
  durationMinutes: number;
  isCustomDuration: boolean;
  roastIntensity: RoastIntensity;

  // ── Active session config (created on LOCK IN) ────────────
  activeSession: SessionConfig | null;

  // ── Actions ───────────────────────────────────────────────
  setTask: (taskType: TaskType) => void;
  setCustomTask: (task: string) => void;
  setDuration: (minutes: number, isCustom?: boolean) => void;
  setRoastIntensity: (intensity: RoastIntensity) => void;
  createSession: () => SessionConfig;
  clearSession: () => void;

  // ── Derived ───────────────────────────────────────────────
  getTaskName: () => string;
  isValid: () => boolean;
}

export const useSessionStore = create<SessionSetupState>()(
  persist(
    (set, get) => ({
      // Defaults
      taskType: "study",
      customTask: "",
      durationMinutes: DEFAULT_DURATION_MINUTES,
      isCustomDuration: false,
      roastIntensity: "serious",
      activeSession: null,

      setTask: (taskType) => set({ taskType }),

      setCustomTask: (customTask) => set({ customTask: customTask.slice(0, 100) }),

      setDuration: (minutes, isCustom = false) =>
        set({ durationMinutes: minutes, isCustomDuration: isCustom }),

      setRoastIntensity: (intensity) => set({ roastIntensity: intensity }),

      createSession: () => {
        const state = get();
        const config: SessionConfig = {
          taskType: state.taskType,
          taskName: state.getTaskName(),
          durationMinutes: state.durationMinutes,
          durationSeconds: state.durationMinutes * 60,
          roastIntensity: state.roastIntensity,
          createdAt: Date.now(),
        };
        set({ activeSession: config });
        return config;
      },

      clearSession: () => set({ activeSession: null }),

      getTaskName: () => {
        const state = get();
        if (state.taskType === "custom") {
          return state.customTask.trim() || "Custom Task";
        }
        return TASK_LABELS[state.taskType];
      },

      isValid: () => {
        const state = get();
        if (state.taskType === "custom" && state.customTask.trim().length === 0) {
          return false;
        }
        if (state.durationMinutes < 1 || state.durationMinutes > 480) {
          return false;
        }
        return true;
      },
    }),
    {
      name: "lockin-session-setup",
      partialize: (state) => ({
        taskType: state.taskType,
        customTask: state.taskType === "custom" ? state.customTask : "",
        durationMinutes: state.durationMinutes,
        isCustomDuration: state.isCustomDuration,
        roastIntensity: state.roastIntensity,
        // Do NOT persist activeSession — it's ephemeral
      }),
    }
  )
);
