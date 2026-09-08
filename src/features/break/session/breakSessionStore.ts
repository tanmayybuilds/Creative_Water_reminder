/**
 * LOCKIN - Break Session State Machine & Store
 * ==============================================
 * Central state machine managing the break reminder lifecycle, refusal tracking,
 * meme playback coordination, final choice interaction, and persistent lifetime statistics.
 * 
 * 100% offline, local-first.
 */

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { BreakSession, BreakSessionState, LifetimeBreakStats } from "./breakSessionTypes";
import type { MemeId } from "@/features/memes/types";
import { useMemeStore } from "@/features/memes/memeStore";
import { useBreakReminderStore } from "@/features/reminder/reminderStore";
import { useBehaviorEngine } from "@/features/memes/behavior/behaviorEngine";
import { calculateCombinedEscalationLevel, selectInterventionMeme } from "@/features/memes/behavior/memeSelector";
import { DEFAULT_BEHAVIOR_CONFIG } from "@/features/memes/behavior/behaviorConfig";
import type { RandomSource } from "@/features/memes/behavior/behaviorTypes";
import { subscribeToBreakEvents } from "@/features/reminder/reminderEvents";
import { FINAL_CHOICE_CONFIG, type FinalChoiceOption } from "./finalChoiceConfig";
import { getMeme } from "@/features/memes/registry";

// Safe memory storage fallback for Node/testing environments
const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const getSafeStorage = (): StateStorage => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return memoryStorage;
};

export interface BreakSessionStoreState {
  // Current Active Break Session
  currentSession: BreakSession | null;

  // Cumulative Lifetime Statistics (Persisted Locally)
  lifetimeStats: LifetimeBreakStats;

  // State Machine Actions
  startNewSession: (preserveConsecutive?: boolean) => BreakSession;
  triggerBreak: () => void;
  showPrompt: () => void;
  handleTakeABreak: () => void;
  handleLeaveMeAlone: (randomSource?: RandomSource) => MemeId | null;
  handleExitAttempt: (randomSource?: RandomSource) => MemeId | null;
  handleMemeFinished: (finishedMemeId?: MemeId) => void;
  handleFinalChoiceAttempt: () => void;
  handleFinalChoice: (choice: FinalChoiceOption) => void;
  resetSession: () => void;
  resetAll: (includeLifetime?: boolean) => void;
}

const createInitialLifetimeStats = (): LifetimeBreakStats => ({
  totalBreaksTriggered: 0,
  totalBreaksAccepted: 0,
  totalBreaksRefused: 0,
  totalMemesPlayed: 0,
  totalExitAttempts: 0,
});

const createNewSessionData = (previousConsecutive = 0): BreakSession => ({
  sessionId: `break_session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  sessionStartTime: Date.now(),
  refusalCount: 0,
  leaveMeAloneCount: 0,
  exitAttemptCount: 0,
  consecutiveRefusals: previousConsecutive,
  memesPlayedThisBreak: [],
  lastMemeId: null,
  finalChoiceAttempted: false,
  finalChoiceAttempts: 0,
  status: "BREAK_PROMPT",
});

export const useBreakSessionStore = create<BreakSessionStoreState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      lifetimeStats: createInitialLifetimeStats(),

      /**
       * Creates and initializes a fresh Break Session.
       */
      startNewSession: (preserveConsecutive = false) => {
        const prevConsecutive = preserveConsecutive ? get().currentSession?.consecutiveRefusals || 0 : 0;
        const newSession = createNewSessionData(prevConsecutive);

        set((state) => ({
          currentSession: newSession,
          lifetimeStats: {
            ...state.lifetimeStats,
            totalBreaksTriggered: state.lifetimeStats.totalBreaksTriggered + 1,
          },
        }));

        return newSession;
      },

      /**
       * Called when the break timer triggers a break.
       */
      triggerBreak: () => {
        let session = get().currentSession;
        if (!session || session.status === "FINISHED" || session.status === "IDLE") {
          session = get().startNewSession(true);
        }

        set({
          currentSession: {
            ...session,
            status: "BREAK_PROMPT",
          },
        });
      },

      /**
       * Moves session to BREAK_PROMPT state.
       */
      showPrompt: () => {
        const session = get().currentSession;
        if (!session) {
          get().startNewSession();
          return;
        }

        set({
          currentSession: {
            ...session,
            status: "BREAK_PROMPT",
          },
        });
      },

      /**
       * User Accepts the Break:
       * - Completes session successfully
       * - Resets consecutive refusals to 0
       * - Increments totalBreaksAccepted
       * - Starts next recurring timer
       *
       * Re-entrancy guarded: stopMeme() triggers onComplete callbacks which may
       * themselves call handleTakeABreak(). The guard prevents infinite recursion.
       */
      handleTakeABreak: () => {
        const session = get().currentSession;

        // Re-entrancy guard: if already FINISHED, do nothing
        if (session?.status === "FINISHED") return;

        // Immediately mark as FINISHED to prevent re-entry from callbacks
        set((state) => ({
          currentSession: {
            ...(session || createNewSessionData(0)),
            consecutiveRefusals: 0,
            status: "FINISHED",
          },
          lifetimeStats: {
            ...state.lifetimeStats,
            totalBreaksAccepted: state.lifetimeStats.totalBreaksAccepted + 1,
          },
        }));

        // Stop any currently playing meme (safe now: re-entry blocked above)
        useMemeStore.getState().stopMeme();

        // Notify and sync Break Reminder Store
        useBreakReminderStore.getState().acceptBreak();

        // Sync Behavior Engine
        useBehaviorEngine.getState().handleTakeABreak();
      },

      /**
       * User Selects "Leave Me Alone":
       * - Increments leaveMeAloneCount, refusalCount, consecutiveRefusals
       * - Increments lifetime totalBreaksRefused
       * - Selects intervention meme via Behavior Engine
       * - Transitions to MEME_PLAYING
       */
      handleLeaveMeAlone: (randomSource: RandomSource = Math.random) => {
        let session = get().currentSession;
        if (!session || session.status === "FINISHED" || session.status === "IDLE") {
          session = get().startNewSession();
        }

        const updatedLeaveMeAlone = session.leaveMeAloneCount + 1;
        const updatedRefusalCount = session.refusalCount + 1;
        const updatedConsecutive = session.consecutiveRefusals + 1;

        const config = DEFAULT_BEHAVIOR_CONFIG;
        const level = calculateCombinedEscalationLevel(updatedConsecutive, session.exitAttemptCount, config);

        // Sync to Break Reminder store
        useBreakReminderStore.setState({
          consecutiveDismissals: updatedConsecutive,
          totalDismissals: useBreakReminderStore.getState().totalDismissals + 1,
        });

        // If Level 3 escalation reached: transition to FINAL_EXIT_ATTEMPT
        if (level === 3) {
          set((state) => ({
            currentSession: {
              ...session,
              leaveMeAloneCount: updatedLeaveMeAlone,
              refusalCount: updatedRefusalCount,
              consecutiveRefusals: updatedConsecutive,
              status: "FINAL_EXIT_ATTEMPT",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalBreaksRefused: state.lifetimeStats.totalBreaksRefused + 1,
            },
          }));
          return null;
        }

        // Query Meme Selection Engine
        const intervention = selectInterventionMeme(
          level,
          session.memesPlayedThisBreak,
          session.lastMemeId,
          config,
          randomSource
        );

        if (intervention) {
          const updatedPlayed = [...session.memesPlayedThisBreak, intervention.memeId];

          // Trigger meme playback with completion callback hooked to state machine
          useMemeStore.getState().playMeme(intervention.memeId, {
            position: intervention.position,
            entrance: intervention.entrance,
            exit: intervention.exit,
            scale: intervention.scale,
            onComplete: () => {
              get().handleMemeFinished(intervention.memeId);
            },
          });

          set((state) => ({
            currentSession: {
              ...session,
              leaveMeAloneCount: updatedLeaveMeAlone,
              refusalCount: updatedRefusalCount,
              consecutiveRefusals: updatedConsecutive,
              lastMemeId: intervention.memeId,
              memesPlayedThisBreak: updatedPlayed,
              status: "MEME_PLAYING",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalBreaksRefused: state.lifetimeStats.totalBreaksRefused + 1,
              totalMemesPlayed: state.lifetimeStats.totalMemesPlayed + 1,
            },
          }));

          return intervention.memeId;
        } else {
          // Fallback if no meme selected: transition to REFUSED_AGAIN
          set((state) => ({
            currentSession: {
              ...session,
              leaveMeAloneCount: updatedLeaveMeAlone,
              refusalCount: updatedRefusalCount,
              consecutiveRefusals: updatedConsecutive,
              status: updatedRefusalCount > 1 ? "REFUSED_AGAIN" : "REFUSED",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalBreaksRefused: state.lifetimeStats.totalBreaksRefused + 1,
            },
          }));

          return null;
        }
      },

      /**
       * Tracks exit attempts separately from standard refusals.
       * Triggers an exit intervention meme for normal exit escalation tiers (< 3),
       * or transitions to FINAL_EXIT_ATTEMPT when threshold (3) is reached.
       *
       * If already in FINAL_CHOICE or FINAL_EXIT_ATTEMPT, exit attempts are
       * absorbed without triggering another normal escalation meme.
       */
      handleExitAttempt: (randomSource: RandomSource = Math.random) => {
        let session = get().currentSession;
        if (!session || session.status === "FINISHED" || session.status === "IDLE") {
          session = get().startNewSession();
        }

        // During FINAL_CHOICE: absorb exit attempt, do NOT allow bypassing the finale
        if (session.status === "FINAL_CHOICE" || session.status === "FINAL_EXIT_ATTEMPT") {
          set((state) => ({
            currentSession: {
              ...session,
              exitAttemptCount: session.exitAttemptCount + 1,
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalExitAttempts: state.lifetimeStats.totalExitAttempts + 1,
            },
          }));
          return null;
        }

        const updatedExitAttempts = session.exitAttemptCount + 1;
        const config = DEFAULT_BEHAVIOR_CONFIG;
        const level = calculateCombinedEscalationLevel(session.consecutiveRefusals, updatedExitAttempts, config);

        // Sync to Behavior Engine
        useBehaviorEngine.getState().handleExitAttempt();

        // If reached Level 3 (e.g. exitAttemptCount >= 3): transition cleanly to FINAL_EXIT_ATTEMPT handoff state
        if (level === 3) {
          set((state) => ({
            currentSession: {
              ...session,
              exitAttemptCount: updatedExitAttempts,
              status: "FINAL_EXIT_ATTEMPT",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalExitAttempts: state.lifetimeStats.totalExitAttempts + 1,
            },
          }));
          return null;
        }

        // If already playing a meme, just increment counter without interrupting current playback
        if (session.status === "MEME_PLAYING") {
          set((state) => ({
            currentSession: {
              ...session,
              exitAttemptCount: updatedExitAttempts,
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalExitAttempts: state.lifetimeStats.totalExitAttempts + 1,
            },
          }));
          return null;
        }

        // Query Meme Selection Engine for this exit intervention tier
        const intervention = selectInterventionMeme(
          level,
          session.memesPlayedThisBreak,
          session.lastMemeId,
          config,
          randomSource
        );

        if (intervention) {
          const updatedPlayed = [...session.memesPlayedThisBreak, intervention.memeId];

          // Play intervention meme through existing Meme Player
          useMemeStore.getState().playMeme(intervention.memeId, {
            position: intervention.position,
            entrance: intervention.entrance,
            exit: intervention.exit,
            scale: intervention.scale,
            onComplete: () => {
              get().handleMemeFinished(intervention.memeId);
            },
          });

          set((state) => ({
            currentSession: {
              ...session,
              exitAttemptCount: updatedExitAttempts,
              lastMemeId: intervention.memeId,
              memesPlayedThisBreak: updatedPlayed,
              status: "MEME_PLAYING",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalExitAttempts: state.lifetimeStats.totalExitAttempts + 1,
              totalMemesPlayed: state.lifetimeStats.totalMemesPlayed + 1,
            },
          }));

          return intervention.memeId;
        } else {
          set((state) => ({
            currentSession: {
              ...session,
              exitAttemptCount: updatedExitAttempts,
              status: "BREAK_PROMPT",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalExitAttempts: state.lifetimeStats.totalExitAttempts + 1,
            },
          }));
          return null;
        }
      },

      /**
       * Called when an intervention meme finishes playback.
       * Strictly transitions back to interaction state WITHOUT automatically triggering another meme.
       *
       * Context-aware: if the session was in FINAL_CHOICE flow (finalChoiceAttempted === true),
       * returns to FINAL_CHOICE instead of BREAK_PROMPT/REFUSED_AGAIN. If max attempts reached
       * during finale, resolves the break.
       */
      handleMemeFinished: (finishedMemeId?: MemeId) => {
        const session = get().currentSession;
        if (!session) return;

        // Guard against stale callback from interrupted previous meme
        if (finishedMemeId && session.lastMemeId && finishedMemeId !== session.lastMemeId) {
          return;
        }

        // Determine return state based on context
        const isFinalChoiceFlow = session.finalChoiceAttempted;
        const maxAttempts = FINAL_CHOICE_CONFIG.maxFinalChoiceAttempts;
        const reachedMax = isFinalChoiceFlow && session.finalChoiceAttempts >= maxAttempts;

        if (reachedMax) {
          // Anti-infinite-loop: max wrong answers reached, forcibly resolve the break
          // handleTakeABreak is re-entrancy guarded so this is safe even if
          // called from within a meme completion callback chain.
          get().handleTakeABreak();
          return;
        }

        set({
          currentSession: {
            ...session,
            status: "MEME_FINISHED",
          },
        });

        // Smoothly return to appropriate interaction state
        setTimeout(() => {
          const current = get().currentSession;
          if (current && current.status === "MEME_FINISHED") {
            if (current.finalChoiceAttempted) {
              // Return to FINAL_CHOICE after finale meme
              set({
                currentSession: {
                  ...current,
                  status: "FINAL_CHOICE",
                },
              });
            } else {
              set({
                currentSession: {
                  ...current,
                  status: current.refusalCount > 1 || current.exitAttemptCount > 0 ? "REFUSED_AGAIN" : "BREAK_PROMPT",
                },
              });
            }
          }
        }, 100);
      },

      /**
       * Transitions from FINAL_EXIT_ATTEMPT to FINAL_CHOICE.
       * Called when the final choice UI should be presented.
       */
      handleFinalChoiceAttempt: () => {
        const session = get().currentSession;
        if (!session) return;

        set({
          currentSession: {
            ...session,
            finalChoiceAttempted: true,
            status: "FINAL_CHOICE",
          },
        });
      },

      /**
       * Handles the user's final choice selection (PAISA or PEHCHAAN).
       *
       * CORRECT ANSWER:
       *   → Play correct-answer meme → on completion → handleTakeABreak → FINISHED
       *
       * WRONG ANSWER:
       *   → Increment finalChoiceAttempts
       *   → Play wrong-answer finale meme (shutup_manoj_tiwari)
       *   → On completion → handleMemeFinished returns to FINAL_CHOICE
       *   → Unless max attempts reached → then forcibly resolve
       */
      handleFinalChoice: (choice: FinalChoiceOption) => {
        const session = get().currentSession;
        if (!session) return;

        const config = FINAL_CHOICE_CONFIG;
        const isCorrect = choice === config.correctOption;

        if (isCorrect) {
          // ===== CORRECT ANSWER =====
          const correctMeme = getMeme(config.correctAnswerMemeId);

          if (!correctMeme) {
            // Developer-visible warning: configured meme doesn't exist in registry
            console.warn(
              `[FinalChoice] FINAL_CORRECT_MEME_ID "${config.correctAnswerMemeId}" not found in registry. ` +
              `Skipping meme playback and accepting break directly.`
            );
            get().handleTakeABreak();
            return;
          }

          const updatedPlayed = [...session.memesPlayedThisBreak, config.correctAnswerMemeId];

          // Play the correct-answer celebration meme
          useMemeStore.getState().playMeme(config.correctAnswerMemeId, {
            position: correctMeme.movement.targetPosition || correctMeme.preferredPositions[0] || "center",
            entrance: correctMeme.defaultEntrance || "pop",
            exit: correctMeme.movement.exitOverride || correctMeme.defaultExit || "fade",
            scale: correctMeme.defaultScale || 1.0,
            onComplete: () => {
              // After the correct-answer meme finishes, accept the break
              get().handleTakeABreak();
            },
          });

          set((state) => ({
            currentSession: {
              ...session,
              lastMemeId: config.correctAnswerMemeId,
              memesPlayedThisBreak: updatedPlayed,
              status: "MEME_PLAYING",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalMemesPlayed: state.lifetimeStats.totalMemesPlayed + 1,
            },
          }));
        } else {
          // ===== WRONG ANSWER =====
          const updatedAttempts = session.finalChoiceAttempts + 1;

          // Check if max attempts will be reached after this attempt
          const isMaxReached = updatedAttempts >= config.maxFinalChoiceAttempts;

          const wrongMeme = getMeme(config.wrongAnswerMemeId);

          if (!wrongMeme) {
            console.warn(
              `[FinalChoice] wrongAnswerMemeId "${config.wrongAnswerMemeId}" not found in registry. ` +
              `Returning to FINAL_CHOICE without meme.`
            );
            set({
              currentSession: {
                ...session,
                finalChoiceAttempts: updatedAttempts,
                status: isMaxReached ? "FINISHED" : "FINAL_CHOICE",
              },
            });
            if (isMaxReached) {
              get().handleTakeABreak();
            }
            return;
          }

          const updatedPlayed = [...session.memesPlayedThisBreak, config.wrongAnswerMemeId];

          // Play the wrong-answer finale meme (shutup_manoj_tiwari)
          useMemeStore.getState().playMeme(config.wrongAnswerMemeId, {
            position: wrongMeme.movement.targetPosition || wrongMeme.preferredPositions[0] || "center",
            entrance: wrongMeme.defaultEntrance || "slideFromBottom",
            exit: wrongMeme.movement.exitOverride || wrongMeme.defaultExit || "fade",
            scale: wrongMeme.defaultScale || 1.0,
            onComplete: () => {
              get().handleMemeFinished(config.wrongAnswerMemeId);
            },
          });

          set((state) => ({
            currentSession: {
              ...session,
              finalChoiceAttempts: updatedAttempts,
              finalChoiceAttempted: true,
              lastMemeId: config.wrongAnswerMemeId,
              memesPlayedThisBreak: updatedPlayed,
              status: "MEME_PLAYING",
            },
            lifetimeStats: {
              ...state.lifetimeStats,
              totalMemesPlayed: state.lifetimeStats.totalMemesPlayed + 1,
            },
          }));
        }
      },

      /**
       * Resets active session back to IDLE.
       */
      resetSession: () => {
        set({
          currentSession: null,
        });
      },

      /**
       * Resets session and optionally lifetime statistics.
       */
      resetAll: (includeLifetime = false) => {
        set({
          currentSession: null,
          ...(includeLifetime ? { lifetimeStats: createInitialLifetimeStats() } : {}),
        });
      },
    }),
    {
      name: "lockin_lifetime_break_stats",
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        lifetimeStats: state.lifetimeStats,
      }),
    }
  )
);

// Auto-sync Break Session when BREAK_TRIGGERED event is emitted
subscribeToBreakEvents((event) => {
  if (event.type === "BREAK_TRIGGERED") {
    useBreakSessionStore.getState().triggerBreak();
  }
});
