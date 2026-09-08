import { db } from "@/lib/db";
import type { ActiveTimerState, CompletedSessionRecord } from "@/types";

const ACTIVE_TIMER_STORAGE_KEY = "lockin_active_timer";

/**
 * Persists the active running/paused timer state in localStorage for refresh recovery.
 */
export function saveActiveTimer(state: ActiveTimerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save active timer state:", err);
  }
}

/**
 * Retrieves the persisted active timer state if present.
 */
export function getActiveTimer(): ActiveTimerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveTimerState;
  } catch (err) {
    console.error("Failed to parse active timer state:", err);
    return null;
  }
}

/**
 * Clears the active timer from localStorage.
 */
export function clearActiveTimer(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear active timer state:", err);
  }
}

/**
 * Saves a completed or abandoned session record into Dexie IndexedDB.
 */
export async function persistCompletedSession(
  session: CompletedSessionRecord
): Promise<void> {
  try {
    await db.sessions.put(session);
  } catch (err) {
    console.error("Failed to persist completed session into Dexie:", err);
  }
}
