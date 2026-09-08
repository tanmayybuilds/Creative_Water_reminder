"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  ActiveTimerState,
  CompletedSessionRecord,
  ExitChallengeState,
  ExitStage,
  MoneyOrFame,
  ExitQuestion,
  FocusEvent,
} from "@/types";
import { getActiveTimer, clearActiveTimer, persistCompletedSession } from "@/features/timer/timerPersistence";
import { generateSessionId } from "@/features/timer/timerUtils";
import { selectExitQuestion } from "../questionSelector";
import {
  saveExitChallengeState,
  getExitChallengeState,
  clearExitChallengeState,
} from "../exitChallengePersistence";

export function useExitChallenge() {
  const router = useRouter();

  const [activeSession, setActiveSession] = useState<ActiveTimerState | null>(null);
  const [stage, setStage] = useState<ExitStage>("intro");
  const [question, setQuestion] = useState<ExitQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined);
  const [moneyOrFame, setMoneyOrFame] = useState<MoneyOrFame | undefined>(undefined);
  const [moneyFameReaction, setMoneyFameReaction] = useState<string | undefined>(undefined);
  const [abandonedRecord, setAbandonedRecord] = useState<CompletedSessionRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const activeSessionRef = useRef<ActiveTimerState | null>(null);
  activeSessionRef.current = activeSession;

  // Initialize and recover state
  useEffect(() => {
    const timer = getActiveTimer();
    const persistedChallenge = getExitChallengeState();

    if (timer) {
      setActiveSession(timer);

      if (persistedChallenge && persistedChallenge.sessionId === timer.sessionId) {
        setStage(persistedChallenge.stage);
        setSelectedOptionId(persistedChallenge.selectedOptionId);
        setMoneyOrFame(persistedChallenge.moneyOrFame);
        setMoneyFameReaction(persistedChallenge.moneyFameReaction);

        const q = selectExitQuestion(persistedChallenge.question?.id);
        setQuestion(q);
      } else {
        const q = selectExitQuestion();
        setQuestion(q);
        setStage("intro");
      }
    }

    setIsLoaded(true);
  }, []);

  // Sync state changes to persistence
  const persistState = useCallback(
    (newStage: ExitStage, newOptionId?: string, newChoice?: MoneyOrFame, newReaction?: string) => {
      const session = activeSessionRef.current;
      if (!session) return;

      const stateToSave: ExitChallengeState = {
        sessionId: session.sessionId,
        stage: newStage,
        question,
        selectedOptionId: newOptionId ?? selectedOptionId,
        moneyOrFame: newChoice ?? moneyOrFame,
        moneyFameReaction: newReaction ?? moneyFameReaction,
        startedAt: Date.now(),
      };

      saveExitChallengeState(stateToSave);
    },
    [question, selectedOptionId, moneyOrFame, moneyFameReaction]
  );

  // Transition to a new stage
  const goToStage = useCallback(
    (nextStage: ExitStage) => {
      setStage(nextStage);
      persistState(nextStage);
    },
    [persistState]
  );

  // Answer selected in Stage 2
  const selectAnswer = useCallback(
    (optionId: string) => {
      setSelectedOptionId(optionId);
      persistState(stage, optionId);
    },
    [stage, persistState]
  );

  // Choice selected in Stage 3 (Money vs Fame)
  const selectMoneyOrFameChoice = useCallback(
    (choice: MoneyOrFame, reaction: string) => {
      setMoneyOrFame(choice);
      setMoneyFameReaction(reaction);
      persistState(stage, selectedOptionId, choice, reaction);
    },
    [stage, selectedOptionId, persistState]
  );

  // Return to Focus Session (Keep Focusing / No Take Me Back)
  const returnToFocus = useCallback(() => {
    clearExitChallengeState();
    router.push("/focus");
  }, [router]);

  // Final Session Abandonment
  const confirmExit = useCallback(async () => {
    const session = activeSessionRef.current;
    if (!session) return;

    const now = Date.now();
    const actualSeconds = Math.min(
      session.durationSeconds,
      Math.max(0, Math.floor((now - session.startedAt) / 1000))
    );

    const exitEvent: FocusEvent = {
      id: generateSessionId(),
      type: "exit_challenge_completed",
      timestamp: now,
      sessionId: session.sessionId,
      metadata: {
        moneyOrFame,
        exitQuestionId: question?.id,
        exitQuestionOptionId: selectedOptionId,
        actualFocusSeconds: actualSeconds,
      },
    };

    const record: CompletedSessionRecord = {
      id: session.sessionId,
      taskType: session.config.taskType,
      taskName: session.config.taskName,
      durationSeconds: session.durationSeconds,
      actualFocusSeconds: actualSeconds,
      startedAt: session.startedAt,
      completedAt: now,
      status: "abandoned",
      roastIntensity: session.config.roastIntensity,
      quitAttempts: session.quitAttempts,
      events: [...session.events, exitEvent],
      moneyOrFame,
      exitQuestionId: question?.id,
      exitQuestionOptionId: selectedOptionId,
      exitChallengeCompleted: true,
    };

    // Save permanently to Dexie
    await persistCompletedSession(record);

    // Clean up active session and exit challenge from localStorage
    clearActiveTimer();
    clearExitChallengeState();

    setAbandonedRecord(record);
    setStage("completed");
  }, [moneyOrFame, question, selectedOptionId]);

  return {
    isLoaded,
    hasActiveSession: !!activeSession,
    activeSession,
    stage,
    question,
    selectedOptionId,
    moneyOrFame,
    moneyFameReaction,
    abandonedRecord,
    goToStage,
    selectAnswer,
    selectMoneyOrFameChoice,
    returnToFocus,
    confirmExit,
  };
}
