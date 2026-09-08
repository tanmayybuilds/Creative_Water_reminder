"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  ActiveTimerState,
  FocusEventType,
  InterventionContent,
} from "@/types";
import { getInterventionDecision } from "../interventionPolicy";
import { selectIntervention } from "../memeSelector";

interface UseInterventionEngineProps {
  sessionState: ActiveTimerState | null;
  isRunning: boolean;
  onRecordEvent: (type: FocusEventType, metadata?: Record<string, unknown>) => void;
  onAbandonSession: () => Promise<void>;
}

export function useInterventionEngine({
  sessionState,
  isRunning,
  onRecordEvent,
  onAbandonSession,
}: UseInterventionEngineProps) {
  const router = useRouter();
  const [activeIntervention, setActiveIntervention] = useState<InterventionContent | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const sessionStateRef = useRef<ActiveTimerState | null>(null);
  sessionStateRef.current = sessionState;

  const isOverlayOpenRef = useRef(isOverlayOpen);
  isOverlayOpenRef.current = isOverlayOpen;

  // Internal trigger helper
  const evaluateAndTrigger = useCallback(
    (eventType: FocusEventType, metadata?: Record<string, unknown>) => {
      const state = sessionStateRef.current;
      if (!state || state.status !== "running") return;

      // Record the event first
      onRecordEvent(eventType, metadata);

      // Compute attempts (current attempt + 1 for deliberate actions)
      const isDeliberate =
        eventType === "quit_attempt" ||
        eventType === "escape_key" ||
        eventType === "pause_attempt";

      const currentAttempts = state.quitAttempts + (isDeliberate ? 1 : 0);

      // Policy decision
      const decision = getInterventionDecision({
        eventType,
        quitAttemptCount: currentAttempts,
        eventsHistory: state.events,
        config: state.config,
      });

      if (decision.shouldIntervene) {
        const content = selectIntervention({
          stage: decision.stage,
          intensity: state.config.roastIntensity,
          eventType,
          taskType: state.config.taskType,
          lastInterventionId: state.lastInterventionId,
        });

        setActiveIntervention(content);
        setIsOverlayOpen(true);
      }
    },
    [onRecordEvent]
  );

  // Manual Trigger (e.g. clicking QUIT button)
  const triggerQuitIntervention = useCallback(() => {
    evaluateAndTrigger("quit_attempt");
  }, [evaluateAndTrigger]);

  // Keep Going (Dismiss intervention and resume)
  const handleKeepGoing = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  // Final Quit Handoff (Proceed to Exit Challenge)
  const handleProceedToExit = useCallback(() => {
    setIsOverlayOpen(false);
    router.push("/exit");
  }, [router]);

  // Escape key, Tab Visibility, and Window Blur listeners
  useEffect(() => {
    if (!isRunning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isOverlayOpenRef.current) {
          e.preventDefault();
          evaluateAndTrigger("escape_key");
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        evaluateAndTrigger("visibility_hidden");
      }
    };

    const handleBlur = () => {
      evaluateAndTrigger("window_blur");
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isRunning, evaluateAndTrigger]);

  return {
    activeIntervention,
    isOverlayOpen,
    triggerQuitIntervention,
    handleKeepGoing,
    handleProceedToExit,
  };
}
