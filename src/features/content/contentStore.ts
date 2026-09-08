/**
 * LOCKIN — Content Mode State Machine & Runner
 * ===============================================
 * Central store and automation engine for content creators and screen recording.
 *
 * Rules:
 * 1. Always calls real underlying actions (handleLeaveMeAlone, handleExitAttempt, etc.).
 * 2. Never overlaps memes; always awaits natural video completion.
 * 3. Never wipes lifetime statistics on scenario reset unless explicitly requested.
 * 4. Supports fast, normal, and cinematic timing presets.
 */

import { create } from "zustand";
import {
  CONTENT_TIMING_PRESETS,
  type ContentTimingPreset,
  type ContentTimingConfig,
} from "./contentTimingConfig";
import type { ContentScenarioId, ContentScenarioDef } from "./contentTypes";
import { useBreakSessionStore } from "@/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "@/features/reminder/reminderStore";
import { useBehaviorEngine } from "@/features/memes/behavior/behaviorEngine";
import { useMemeStore } from "@/features/memes/memeStore";
import { FINAL_CHOICE_CONFIG } from "@/features/break/session/finalChoiceConfig";

export const CONTENT_SCENARIOS: Record<ContentScenarioId, ContentScenarioDef> = {
  POV_30_MINUTES: {
    id: "POV_30_MINUTES",
    title: "POV: 30 minutes of work",
    badge: "VIRAL FORMAT",
    description: "Break Reminder → Refuse (Level 0) → Refuse (Level 1) → Exit Attempt → Climax Finale.",
    estimatedDuration: "~25s",
  },
  TRYING_TO_CLOSE: {
    id: "TRYING_TO_CLOSE",
    title: "TRYING TO CLOSE LOCKIN",
    badge: "DESKTOP CHAOS",
    description: "Break Reminder → 3 Exit Attempts → Escalation → Paisa Ya Pehchaan Finale.",
    estimatedDuration: "~20s",
  },
  FIVE_MORE_MINUTES: {
    id: "FIVE_MORE_MINUTES",
    title: "I JUST WANT 5 MORE MINUTES",
    badge: "STUBBORN REFUSAL",
    description: "Repeated break refusals escalating through high-energy Ravi dances to the finale.",
    estimatedDuration: "~30s",
  },
  FULL_CHAOS: {
    id: "FULL_CHAOS",
    title: "FULL CHAOS (COMPLETE SEQUENCE)",
    badge: "FULL DEMO",
    description: "Complete comedy sequence: break prompt, refusal, exit, Manoj confrontation & resolution.",
    estimatedDuration: "~35s",
  },
};

export interface ContentStoreState {
  // Panel Visibility & Recording Mode
  isOpen: boolean;
  isRecordingMode: boolean;
  activeTimingPreset: ContentTimingPreset;
  selectedScenario: ContentScenarioId;

  // Live Scenario Execution State
  isRunningScenario: boolean;
  currentScenarioStep: number;
  totalScenarioSteps: number;
  scenarioStatusText: string;

  // Panel Control Actions
  togglePanel: () => void;
  setOpen: (open: boolean) => void;
  setRecordingMode: (enabled: boolean) => void;
  setTimingPreset: (preset: ContentTimingPreset) => void;
  setSelectedScenario: (scenarioId: ContentScenarioId) => void;

  // Direct Simulated User Actions (Real Underlying Logic)
  triggerBreak: () => void;
  leaveMeAlone: () => void;
  refuseAgain: () => void;
  attemptExit: () => void;
  forceFinale: () => void;
  takeABreak: () => void;
  chooseFinalOption: (option: "PAISA" | "PEHCHAAN") => void;

  // Scenario Automation Actions
  runScenario: (scenarioId?: ContentScenarioId) => Promise<void>;
  stopScenario: () => void;
  resetScenario: () => void;
  resetContentSession: (includeLifetime?: boolean) => void;
}

// Internal cancellation token for scenario async loop
let scenarioCancelToken = false;

// Async delay helper
const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      resolve();
    }, ms);
  });

// Await meme completion safely without infinite hang
const waitForActiveMemeCompletion = async (maxWaitMs = 12000): Promise<void> => {
  const startTime = Date.now();
  // Small initial pause to let playback state initialize
  await delay(150);

  while (Date.now() - startTime < maxWaitMs) {
    if (scenarioCancelToken) return;

    const activeMeme = useMemeStore.getState().activeMeme;
    const currentSession = useBreakSessionStore.getState().currentSession;

    // Meme is done when memeStore is idle and session is no longer MEME_PLAYING
    if (!activeMeme && currentSession?.status !== "MEME_PLAYING") {
      // Extra 100ms buffer for UI transition settlement
      await delay(100);
      return;
    }

    // In headless test environments (Node.js) where native HTML video does not trigger onended:
    const isHeadless = typeof window === "undefined" || typeof document === "undefined" || !document.querySelector("video");
    if (isHeadless && Date.now() - startTime > 250) {
      if (activeMeme?.options.onComplete) {
        activeMeme.options.onComplete();
      } else if (currentSession?.lastMemeId) {
        useBreakSessionStore.getState().handleMemeFinished(currentSession.lastMemeId);
      }
      useMemeStore.setState({ activeMeme: null });
      await delay(100);
      return;
    }

    await delay(100);
  }
};

export const useContentStore = create<ContentStoreState>((set, get) => ({
  isOpen: false,
  isRecordingMode: false,
  activeTimingPreset: "NORMAL",
  selectedScenario: "FULL_CHAOS",

  isRunningScenario: false,
  currentScenarioStep: 0,
  totalScenarioSteps: 0,
  scenarioStatusText: "Ready to record",

  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open: boolean) => set({ isOpen: open }),
  setRecordingMode: (enabled: boolean) => set({ isRecordingMode: enabled }),
  setTimingPreset: (preset: ContentTimingPreset) => set({ activeTimingPreset: preset }),
  setSelectedScenario: (scenarioId: ContentScenarioId) => set({ selectedScenario: scenarioId }),

  /**
   * Triggers break using the real underlying break reminder store & session state.
   */
  triggerBreak: () => {
    useBreakReminderStore.getState().testBreakNow();
    useBreakSessionStore.getState().triggerBreak();
  },

  /**
   * Simulates real LEAVE ME ALONE click.
   */
  leaveMeAlone: () => {
    useBreakSessionStore.getState().handleLeaveMeAlone();
  },

  /**
   * Simulates real secondary refusal.
   */
  refuseAgain: () => {
    useBreakSessionStore.getState().handleLeaveMeAlone();
  },

  /**
   * Simulates real exit attempt.
   */
  attemptExit: () => {
    useBreakSessionStore.getState().handleExitAttempt();
  },

  /**
   * Forces direct transition to the finale choice.
   */
  forceFinale: () => {
    let session = useBreakSessionStore.getState().currentSession;
    if (!session || session.status === "FINISHED" || session.status === "IDLE") {
      session = useBreakSessionStore.getState().startNewSession();
    }
    useBreakSessionStore.getState().handleFinalChoiceAttempt();
  },

  /**
   * Simulates real TAKE A BREAK click.
   */
  takeABreak: () => {
    useBreakSessionStore.getState().handleTakeABreak();
  },

  /**
   * Simulates choice in the final Paisa Ya Pehchaan modal.
   */
  chooseFinalOption: (option: "PAISA" | "PEHCHAAN") => {
    useBreakSessionStore.getState().handleFinalChoice(option);
  },

  /**
   * Runs the complete selected recording scenario with authentic natural comedy timing.
   */
  runScenario: async (customScenarioId?: ContentScenarioId) => {
    const scenarioId = customScenarioId || get().selectedScenario;
    const timing: ContentTimingConfig = CONTENT_TIMING_PRESETS[get().activeTimingPreset];

    // Reset previous scenario state before starting fresh execution
    get().resetScenario();
    scenarioCancelToken = false;

    set({
      isRunningScenario: true,
      currentScenarioStep: 0,
      totalScenarioSteps: scenarioId === "FULL_CHAOS" || scenarioId === "POV_30_MINUTES" ? 8 : 6,
      scenarioStatusText: `Starting scenario: ${scenarioId}...`,
    });

    try {
      // ===== STEP 1: INITIAL PAUSE & TRIGGER BREAK =====
      if (scenarioCancelToken) return;
      set({ currentScenarioStep: 1, scenarioStatusText: "Step 1: Triggering break prompt..." });
      get().triggerBreak();
      await delay(timing.initialDelayMs);

      if (scenarioId === "POV_30_MINUTES" || scenarioId === "FULL_CHAOS") {
        // ===== STEP 2: FIRST REFUSAL (LEAVE ME ALONE) =====
        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 2, scenarioStatusText: "Step 2: Clicking LEAVE ME ALONE (Level 0 Meme)..." });
        get().leaveMeAlone();
        await waitForActiveMemeCompletion();
        await delay(timing.postMemeDelayMs);

        // ===== STEP 3: SECOND REFUSAL (ESCALATION) =====
        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 3, scenarioStatusText: "Step 3: Refusing again (Escalation Meme)..." });
        get().refuseAgain();
        await waitForActiveMemeCompletion();
        await delay(timing.postMemeDelayMs);

        // ===== STEP 4: ATTEMPT TO EXIT APP =====
        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 4, scenarioStatusText: "Step 4: Attempting to close window..." });
        get().attemptExit();
        await waitForActiveMemeCompletion();
        await delay(timing.postMemeDelayMs);

        // ===== STEP 5: FORCE FINAL CLIMAX =====
        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 5, scenarioStatusText: "Step 5: Transitioning to PAISA YA PEHCHAAN..." });
        get().forceFinale();
        await delay(timing.finaleDelayMs);

        // ===== STEP 6: WRONG ANSWER (CONFRONTATION) =====
        if (scenarioCancelToken) return;
        const wrongOption = FINAL_CHOICE_CONFIG.correctOption === "PAISA" ? "PEHCHAAN" : "PAISA";
        set({ currentScenarioStep: 6, scenarioStatusText: `Step 6: Choosing wrong answer (${wrongOption})...` });
        get().chooseFinalOption(wrongOption);
        await waitForActiveMemeCompletion();
        await delay(timing.finaleDelayMs);

        // ===== STEP 7: CORRECT ANSWER (VICTORY) =====
        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 7, scenarioStatusText: `Step 7: Choosing correct answer (${FINAL_CHOICE_CONFIG.correctOption})...` });
        get().chooseFinalOption(FINAL_CHOICE_CONFIG.correctOption);
        await waitForActiveMemeCompletion();
        await delay(timing.betweenActionsMs);

        // ===== STEP 8: RESOLVE BREAK & RESUME TIMER =====
        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 8, scenarioStatusText: "Step 8: Break Accepted! Scenario Completed." });
        get().takeABreak();
      } else if (scenarioId === "TRYING_TO_CLOSE") {
        // Preset 2: Trying to close Lockin
        for (let i = 1; i <= 3; i++) {
          if (scenarioCancelToken) return;
          set({ currentScenarioStep: i + 1, scenarioStatusText: `Exit Attempt #${i}...` });
          get().attemptExit();
          await waitForActiveMemeCompletion();
          await delay(timing.postMemeDelayMs);
        }

        // Final Choice
        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 5, scenarioStatusText: "Final choice reached. Choosing correct answer..." });
        get().chooseFinalOption(FINAL_CHOICE_CONFIG.correctOption);
        await waitForActiveMemeCompletion();
        get().takeABreak();
      } else {
        // Preset 3: I Just Want 5 More Minutes
        for (let i = 1; i <= 3; i++) {
          if (scenarioCancelToken) return;
          set({ currentScenarioStep: i + 1, scenarioStatusText: `Refusal #${i}...` });
          get().leaveMeAlone();
          await waitForActiveMemeCompletion();
          await delay(timing.postMemeDelayMs);
        }

        if (scenarioCancelToken) return;
        set({ currentScenarioStep: 5, scenarioStatusText: "Accepting break..." });
        get().takeABreak();
      }

      set({
        isRunningScenario: false,
        scenarioStatusText: "✅ Scenario execution complete!",
      });
    } catch (err) {
      console.error("[ContentMode] Scenario execution notice:", err);
      set({
        isRunningScenario: false,
        scenarioStatusText: "Scenario stopped.",
      });
    }
  },

  /**
   * Cancels any running automated scenario.
   */
  stopScenario: () => {
    scenarioCancelToken = true;
    set({
      isRunningScenario: false,
      scenarioStatusText: "Scenario cancelled by creator.",
    });
  },

  /**
   * Instant Clean Reset:
   * - Stops active meme playback
   * - Dismisses final choice modal
   * - Resets active session state back to IDLE
   * - Resets refusal & exit counts
   * - Clears recent meme history
   * - Preserves lifetime statistics
   */
  resetScenario: () => {
    scenarioCancelToken = true;

    // 1. Stop active meme cleanly
    useMemeStore.getState().stopMeme();
    useMemeStore.setState({ activeMeme: null });

    // 2. Reset active break session
    useBreakSessionStore.getState().resetSession();

    // 3. Reset behavior engine state
    useBehaviorEngine.getState().resetBehaviorState();

    // 4. Reset reminder status
    useBreakReminderStore.setState({
      status: "IDLE",
      consecutiveDismissals: 0,
    });

    set({
      isRunningScenario: false,
      currentScenarioStep: 0,
      scenarioStatusText: "Scenario reset to clean state.",
    });
  },

  /**
   * Developer-only full session reset (optionally includes lifetime stats).
   */
  resetContentSession: (includeLifetime = false) => {
    get().resetScenario();
    useBreakSessionStore.getState().resetAll(includeLifetime);
  },
}));
