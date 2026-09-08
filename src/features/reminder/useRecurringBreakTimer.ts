import { useEffect, useRef } from "react";
import { useBreakReminderStore } from "./reminderStore";

/**
 * Hook to manage authoritative timestamp-based timer ticking,
 * window visibility resync, and sleep/wake restoration.
 */
export function useRecurringBreakTimer() {
  const status = useBreakReminderStore((s) => s.status);
  const intervalMinutes = useBreakReminderStore((s) => s.intervalMinutes);
  const remainingSeconds = useBreakReminderStore((s) => s.remainingSeconds);
  const consecutiveDismissals = useBreakReminderStore((s) => s.consecutiveDismissals);
  const totalDismissals = useBreakReminderStore((s) => s.totalDismissals);
  const breaksAccepted = useBreakReminderStore((s) => s.breaksAccepted);

  const startTimer = useBreakReminderStore((s) => s.startTimer);
  const stopTimer = useBreakReminderStore((s) => s.stopTimer);
  const resetTimer = useBreakReminderStore((s) => s.resetTimer);
  const acceptBreak = useBreakReminderStore((s) => s.acceptBreak);
  const dismissBreak = useBreakReminderStore((s) => s.dismissBreak);
  const setIntervalMinutes = useBreakReminderStore((s) => s.setIntervalMinutes);
  const testBreakNow = useBreakReminderStore((s) => s.testBreakNow);
  const tick = useBreakReminderStore((s) => s.tick);
  const resyncFromSleep = useBreakReminderStore((s) => s.resyncFromSleep);

  const intervalRef = useRef<number | null>(null);

  // Authoritative tick interval when RUNNING
  useEffect(() => {
    if (status === "RUNNING") {
      // Immediate initial tick
      tick();

      // Tick every 500ms for precision and zero drift
      intervalRef.current = window.setInterval(() => {
        tick();
      }, 500);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, tick]);

  // Handle system sleep/wake and window focus/visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resyncFromSleep();
      }
    };

    const handleFocus = () => {
      resyncFromSleep();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [resyncFromSleep]);

  // Format remaining seconds into MM:SS (or HH:MM:SS if > 1 hour)
  const formatTime = (totalSec: number): string => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return {
    status,
    intervalMinutes,
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    consecutiveDismissals,
    totalDismissals,
    breaksAccepted,
    isRunning: status === "RUNNING",
    isBreakTriggered: status === "BREAK_TRIGGERED",
    startTimer,
    stopTimer,
    resetTimer,
    acceptBreak,
    dismissBreak,
    setIntervalMinutes,
    testBreakNow,
  };
}
