import { create } from "zustand";

export interface BreakSettingsState {
  intervalMinutes: number;
  isEnabled: boolean;
  soundEnabled: boolean;
  setIntervalMinutes: (minutes: number) => void;
  setIsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useBreakSettingsStore = create<BreakSettingsState>((set) => ({
  intervalMinutes: 30,
  isEnabled: true,
  soundEnabled: true,
  setIntervalMinutes: (minutes) => set({ intervalMinutes: minutes }),
  setIsEnabled: (enabled) => set({ isEnabled: enabled }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
}));
