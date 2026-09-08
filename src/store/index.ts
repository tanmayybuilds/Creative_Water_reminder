import { create } from "zustand";

interface AppState {
  isInitialized: boolean;
  activeFeature: string | null;
  setInitialized: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: true,
  activeFeature: null,
  setInitialized: (val) => set({ isInitialized: val }),
}));
