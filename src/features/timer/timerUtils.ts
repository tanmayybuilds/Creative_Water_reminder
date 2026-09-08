/**
 * Formats seconds into MM:SS (for < 1 hour) or HH:MM:SS (for >= 1 hour).
 */
export function formatTimeRemaining(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates remaining seconds authoritatively from target timestamp.
 */
export function calculateRemainingSeconds(targetEndTime: number): number {
  const diffMs = targetEndTime - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 1000);
}

/**
 * Calculates normalized progress [0.0 - 1.0] representing elapsed fraction.
 */
export function calculateProgress(
  durationSeconds: number,
  remainingSeconds: number
): number {
  if (durationSeconds <= 0) return 1;
  const elapsed = durationSeconds - remainingSeconds;
  return Math.min(1, Math.max(0, elapsed / durationSeconds));
}

/**
 * Generates a unique UUID for each focus session.
 */
export function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
