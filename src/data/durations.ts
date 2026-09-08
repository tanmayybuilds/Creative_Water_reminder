export interface DurationOption {
  minutes: number;
  label: string;
}

export const DURATION_PRESETS: DurationOption[] = [
  { minutes: 10, label: "10 min" },
  { minutes: 25, label: "25 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 45, label: "45 min" },
  { minutes: 60, label: "60 min" },
  { minutes: 90, label: "90 min" },
];

export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 480; // 8 hours
export const DEFAULT_DURATION_MINUTES = 25;
