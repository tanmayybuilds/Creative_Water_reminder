import { create } from "zustand";
import type { MemeId } from "../types";
import type {
  BehaviorState,
  BehaviorConfig,
  EscalationLevel,
  SelectedMemeIntervention,
  RandomSource,
} from "./behaviorTypes";
import { DEFAULT_BEHAVIOR_CONFIG } from "./behaviorConfig";
import { calculateEscalationLevel, selectInterventionMeme } from "./memeSelector";
import { useMemeStore } from "../memeStore";
import { useBreakReminderStore } from "../../reminder/reminderStore";
import type { UserBehaviorStateFixture } from "../fixtures";

interface BehaviorStoreState extends BehaviorState {
  config: BehaviorConfig;
  handleLeaveMeAlone: (randomSource?: RandomSource) => SelectedMemeIntervention | null;
  handleTakeABreak: () => void;
  handleExitAttempt: () => void;
  triggerManojFinale: () => void;
  loadFixture: (fixture: UserBehaviorStateFixture) => void;
  resetBehaviorState: () => void;
  setConfig: (config: Partial<BehaviorConfig>) => void;
}

const createInitialState = (): BehaviorState => ({
  breakSessionId: `session_${Date.now()}`,
  consecutiveDismissals: 0,
  totalDismissals: 0,
  breaksAccepted: 0,
  exitAttempts: 0,
  lastMemePlayed: null,
  recentMemes: [],
  currentEscalationLevel: 0,
  paisaYaPehchaanShown: false,
  finalExitStage: 0,
});

export const useBehaviorEngine = create<BehaviorStoreState>((set, get) => ({
  ...createInitialState(),
  config: DEFAULT_BEHAVIOR_CONFIG,

  handleLeaveMeAlone: (randomSource: RandomSource = Math.random) => {
    const {
      consecutiveDismissals,
      totalDismissals,
      exitAttempts,
      recentMemes,
      lastMemePlayed,
      config,
    } = get();

    const updatedConsecutive = consecutiveDismissals + 1;
    const updatedTotal = totalDismissals + 1;

    const level = calculateEscalationLevel(updatedConsecutive, exitAttempts, config);

    // Sync to Break Reminder Store so UI and timers are 100% in sync
    useBreakReminderStore.setState({
      consecutiveDismissals: updatedConsecutive,
      totalDismissals: updatedTotal,
    });

    // If reached Level 3, transition to Paisa Ya Pehchaan interaction
    if (level === 3) {
      set({
        consecutiveDismissals: updatedConsecutive,
        totalDismissals: updatedTotal,
        currentEscalationLevel: 3,
        paisaYaPehchaanShown: true,
      });
      return null;
    }

    // Select meme from appropriate escalation pool
    const selected = selectInterventionMeme(
      level,
      recentMemes,
      lastMemePlayed,
      config,
      randomSource
    );

    if (selected) {
      // Update recent history queue (fixed max length)
      const updatedHistory = [...recentMemes, selected.memeId].slice(
        -config.historyLength
      );

      set({
        consecutiveDismissals: updatedConsecutive,
        totalDismissals: updatedTotal,
        currentEscalationLevel: level,
        lastMemePlayed: selected.memeId,
        recentMemes: updatedHistory,
      });

      // Trigger playback cleanly through existing Meme Player abstraction
      useMemeStore.getState().playMeme(selected.memeId, {
        position: selected.position,
        entrance: selected.entrance,
        exit: selected.exit,
        scale: selected.scale,
      });
    } else {
      set({
        consecutiveDismissals: updatedConsecutive,
        totalDismissals: updatedTotal,
        currentEscalationLevel: level,
      });
    }

    return selected;
  },

  handleTakeABreak: () => {
    const { breaksAccepted } = get();
    const updatedBreaksAccepted = breaksAccepted + 1;

    // Stop any active meme playback
    useMemeStore.getState().stopMeme();

    // Sync to Break Reminder Store
    useBreakReminderStore.setState({
      consecutiveDismissals: 0,
      breaksAccepted: updatedBreaksAccepted,
    });

    set({
      consecutiveDismissals: 0,
      breaksAccepted: updatedBreaksAccepted,
      currentEscalationLevel: 0,
      paisaYaPehchaanShown: false,
      finalExitStage: 0,
    });
  },

  handleExitAttempt: () => {
    const { consecutiveDismissals, exitAttempts, config } = get();
    const updatedExitAttempts = exitAttempts + 1;
    const level = calculateEscalationLevel(consecutiveDismissals, updatedExitAttempts, config);

    set({
      exitAttempts: updatedExitAttempts,
      currentEscalationLevel: level,
      paisaYaPehchaanShown: level === 3,
    });
  },

  triggerManojFinale: () => {
    // Dedicated trigger for shutup_manoj_tiwari during final exit flow
    set({
      finalExitStage: 1,
      paisaYaPehchaanShown: false,
    });

    useMemeStore.getState().playMeme("shutup_manoj_tiwari", {
      position: "center",
      entrance: "slideFromBottom",
      exit: "slideToBottom",
      scale: 1.0,
    });
  },

  loadFixture: (fixture: UserBehaviorStateFixture) => {
    const { config } = get();
    const level = calculateEscalationLevel(
      fixture.consecutiveDismissals,
      fixture.exitAttempts,
      config
    );

    // Atomically sync to Break Reminder Store
    useBreakReminderStore.setState({
      consecutiveDismissals: fixture.consecutiveDismissals,
      totalDismissals: fixture.totalDismissals,
      breaksAccepted: fixture.breaksAccepted,
    });

    set({
      consecutiveDismissals: fixture.consecutiveDismissals,
      totalDismissals: fixture.totalDismissals,
      breaksAccepted: fixture.breaksAccepted,
      exitAttempts: fixture.exitAttempts,
      currentEscalationLevel: level,
      paisaYaPehchaanShown: level === 3,
      lastMemePlayed: null,
      recentMemes: [],
    });
  },

  resetBehaviorState: () => {
    // Sync to Break Reminder Store
    useBreakReminderStore.setState({
      consecutiveDismissals: 0,
      totalDismissals: 0,
      breaksAccepted: 0,
    });

    set({
      ...createInitialState(),
    });
    useMemeStore.getState().stopMeme();
  },

  setConfig: (customConfig: Partial<BehaviorConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        ...customConfig,
      },
    }));
  },
}));
