"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  SessionConfig,
  TimerStatus,
  ActiveTimerState,
  FocusEvent,
  FocusEventType,
  CompletedSessionRecord,
} from "@/types";
import {
  calculateRemainingSeconds,
  calculateProgress,
  generateSessionId,
} from "./timerUtils";
import {
  saveActiveTimer,
  getActiveTimer,
  clearActiveTimer,
  persistCompletedSession,
} from "./timerPersistence";

interface UseFocusTimerProps {
  initialConfig: SessionConfig | null;
}

export function useFocusTimer({ initialConfig }: UseFocusTimerProps) {
  const [timerState, setTimerState] = useState<ActiveTimerState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Guards to ensure completion logic fires strictly once per session
  const completionHandledRef = useRef<boolean>(false);
  const timerStateRef = useRef<ActiveTimerState | null>(null);
  timerStateRef.current = timerState;

  // Complete session handler (persists to Dexie and updates state)
  const handleSessionCompletion = useCallback(async (state: ActiveTimerState) => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    const completionEvent: FocusEvent = {
      id: generateSessionId(),
      type: "session_completed",
      timestamp: Date.now(),
    };

    const completedRecord: CompletedSessionRecord = {
      id: state.sessionId,
      taskType: state.config.taskType,
      taskName: state.config.taskName,
      durationSeconds: state.durationSeconds,
      startedAt: state.startedAt,
      completedAt: Date.now(),
      status: "completed",
      roastIntensity: state.config.roastIntensity,
      quitAttempts: state.quitAttempts,
      events: [...state.events, completionEvent],
    };

    // Persist to Dexie
    await persistCompletedSession(completedRecord);

    // Update active timer status in state and clear from active localStorage
    const finalState: ActiveTimerState = {
      ...state,
      status: "completed",
      events: completedRecord.events,
    };

    setTimerState(finalState);
    setRemainingSeconds(0);
    clearActiveTimer();
  }, []);

  // Initialize or Recover Timer on Mount
  useEffect(() => {
    const recovered = getActiveTimer();

    if (recovered) {
      // If we recovered a running timer
      if (recovered.status === "running") {
        const rem = calculateRemainingSeconds(recovered.targetEndTime);
        if (rem <= 0) {
          // Completed during browser restart/refresh
          setTimerState(recovered);
          setRemainingSeconds(0);
          handleSessionCompletion(recovered);
        } else {
          setTimerState(recovered);
          setRemainingSeconds(rem);
        }
      } else {
        setTimerState(recovered);
        setRemainingSeconds(0);
      }
    } else if (initialConfig) {
      // Start a brand new session from the passed config
      const now = Date.now();
      const targetEnd = now + initialConfig.durationSeconds * 1000;
      const newSessionId = generateSessionId();

      const newState: ActiveTimerState = {
        sessionId: newSessionId,
        config: initialConfig,
        status: "running",
        startedAt: now,
        targetEndTime: targetEnd,
        pausedAt: null,
        remainingWhenPaused: null,
        durationSeconds: initialConfig.durationSeconds,
        quitAttempts: 0,
        events: [],
      };

      saveActiveTimer(newState);
      setTimerState(newState);
      setRemainingSeconds(initialConfig.durationSeconds);
    }

    setIsLoaded(true);
  }, [initialConfig, handleSessionCompletion]);

  const isRunning = timerState?.status === "running";
  const targetEndTime = timerState?.targetEndTime;

  // Accurate Timer Tick Loop
  useEffect(() => {
    if (!isRunning || !targetEndTime) return;

    const tick = () => {
      const currentState = timerStateRef.current;
      if (!currentState || currentState.status !== "running") return;

      const rem = calculateRemainingSeconds(currentState.targetEndTime);
      setRemainingSeconds(rem);

      if (rem <= 0) {
        handleSessionCompletion(currentState);
      }
    };

    // Immediate initial sync
    tick();

    // High frequency interval (250ms) to prevent drift and catch sub-second precision
    const interval = setInterval(tick, 250);

    // Visibility change handler for tab-switching / browser minimize recovery
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, targetEndTime, handleSessionCompletion]);

  // Record a Focus Event (quit attempt, escape key, pause, blur, visibility change)
  const recordFocusEvent = useCallback(
    (type: FocusEventType, metadata?: Record<string, unknown>) => {
      const currentState = timerStateRef.current;
      if (!currentState) return;

      const newEvent: FocusEvent = {
        id: generateSessionId(),
        type,
        timestamp: Date.now(),
        sessionId: currentState.sessionId,
        metadata,
      };

      const isDeliberateQuit =
        type === "quit_attempt" ||
        type === "escape_key" ||
        type === "pause_attempt";

      const updatedState: ActiveTimerState = {
        ...currentState,
        quitAttempts: isDeliberateQuit
          ? currentState.quitAttempts + 1
          : currentState.quitAttempts,
        events: [...currentState.events, newEvent],
      };

      setTimerState(updatedState);
      if (updatedState.status === "running") {
        saveActiveTimer(updatedState);
      }
    },
    []
  );

  // Abandon Session Handler
  const abandonSession = useCallback(async () => {
    const currentState = timerStateRef.current;
    if (!currentState) return;

    const abandonEvent: FocusEvent = {
      id: generateSessionId(),
      type: "session_abandoned",
      timestamp: Date.now(),
    };

    const record: CompletedSessionRecord = {
      id: currentState.sessionId,
      taskType: currentState.config.taskType,
      taskName: currentState.config.taskName,
      durationSeconds: currentState.durationSeconds,
      startedAt: currentState.startedAt,
      completedAt: Date.now(),
      status: "abandoned",
      roastIntensity: currentState.config.roastIntensity,
      quitAttempts: currentState.quitAttempts,
      events: [...currentState.events, abandonEvent],
    };

    await persistCompletedSession(record);
    clearActiveTimer();
    setTimerState(null);
    setRemainingSeconds(0);
  }, []);

  // Reset Session (cleans up state without saving)
  const resetSession = useCallback(() => {
    clearActiveTimer();
    setTimerState(null);
    setRemainingSeconds(0);
  }, []);

  const durationSeconds = timerState?.durationSeconds ?? 0;
  const elapsedSeconds = Math.max(0, durationSeconds - remainingSeconds);
  const progress = calculateProgress(durationSeconds, remainingSeconds);

  return {
    timerState,
    status: (timerState?.status ?? "idle") as TimerStatus,
    remainingSeconds,
    elapsedSeconds,
    durationSeconds,
    progress,
    isLoaded,
    recordQuitAttempt: () => recordFocusEvent("quit_attempt"),
    recordFocusEvent,
    abandonSession,
    resetSession,
  };
}
