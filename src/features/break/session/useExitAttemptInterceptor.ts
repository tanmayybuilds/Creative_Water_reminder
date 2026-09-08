/**
 * LOCKIN - Desktop Exit Attempt Interception Hook
 * =================================================
 * Intercepts window close / exit requests while a Break Session is active.
 * 
 * Rules:
 * 1. Active Break Session: Intercepts close event, prevents immediate exit,
 *    and increments exitAttemptCount to trigger strategic meme intervention.
 * 2. Inactive / Idle Timer: Allows normal application close without interference.
 * 3. Never interferes with OS Task Manager, system shutdown, or forced kill.
 */

import { useEffect, useRef } from "react";
import { useBreakSessionStore } from "./breakSessionStore";
import { useBreakReminderStore } from "@/features/reminder/reminderStore";

export function isBreakInterventionActive(): boolean {
  const reminderStatus = useBreakReminderStore.getState().status;
  const currentSession = useBreakSessionStore.getState().currentSession;
  const sessionStatus = currentSession?.status;

  if (reminderStatus === "BREAK_TRIGGERED") return true;

  if (
    sessionStatus === "BREAK_TRIGGERED" ||
    sessionStatus === "BREAK_PROMPT" ||
    sessionStatus === "REFUSED" ||
    sessionStatus === "REFUSED_AGAIN" ||
    sessionStatus === "MEME_PLAYING" ||
    sessionStatus === "FINAL_EXIT_ATTEMPT" ||
    sessionStatus === "FINAL_CHOICE"
  ) {
    return true;
  }

  return false;
}

export function useExitAttemptInterceptor() {
  const lastExitAttemptTime = useRef<number>(0);

  useEffect(() => {
    // Debounced exit attempt dispatcher (1 genuine user action = 1 count)
    const triggerInterceptedExit = () => {
      const now = Date.now();
      if (now - lastExitAttemptTime.current < 500) {
        return; // Guard against rapid duplicate event dispatching
      }
      lastExitAttemptTime.current = now;

      useBreakSessionStore.getState().handleExitAttempt();
    };

    let unlistenTauriClose: (() => void) | null = null;

    // 1. Tauri Window Close Interceptor (Native Desktop)
    const setupTauriListener = async () => {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        try {
          const { getCurrentWindow } = await import("@tauri-apps/api/window");
          const appWindow = getCurrentWindow();

          unlistenTauriClose = await appWindow.onCloseRequested((event) => {
            if (isBreakInterventionActive()) {
              // Prevent default window closing while break is active
              event.preventDefault();
              triggerInterceptedExit();
            }
            // Outside active break: event is NOT prevented -> app closes normally
          });
        } catch (err) {
          console.warn("[ExitInterceptor] Tauri window listener init notice:", err);
        }
      }
    };

    setupTauriListener();

    // 2. Web Browser BeforeUnload Fallback (Web Preview)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBreakInterventionActive()) {
        e.preventDefault();
        e.returnValue = "";
        triggerInterceptedExit();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (unlistenTauriClose) {
        unlistenTauriClose();
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}
