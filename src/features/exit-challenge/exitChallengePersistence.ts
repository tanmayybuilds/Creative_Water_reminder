import type { ExitChallengeState } from "@/types";

const EXIT_CHALLENGE_STORAGE_KEY = "lockin_exit_challenge";

export function saveExitChallengeState(state: ExitChallengeState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXIT_CHALLENGE_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save exit challenge state:", err);
  }
}

export function getExitChallengeState(): ExitChallengeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EXIT_CHALLENGE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExitChallengeState;
  } catch (err) {
    console.error("Failed to parse exit challenge state:", err);
    return null;
  }
}

export function clearExitChallengeState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(EXIT_CHALLENGE_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear exit challenge state:", err);
  }
}
