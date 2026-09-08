/**
 * LOCKIN - Meme Behavior Test Fixtures
 * 
 * Typed test fixtures representing deterministic user behavior states for testing
 * future Meme Behavior Engine and intervention rules.
 */

export interface UserBehaviorStateFixture {
  id: string;
  name: string;
  description: string;
  consecutiveDismissals: number;
  totalDismissals: number;
  breaksAccepted: number;
  exitAttempts: number;
}

export const BEHAVIOR_FIXTURES: Record<string, UserBehaviorStateFixture> = {
  fresh_user: {
    id: "fresh_user",
    name: "Fresh User",
    description: "New user who has neither dismissed breaks nor attempted to exit.",
    consecutiveDismissals: 0,
    totalDismissals: 0,
    breaksAccepted: 0,
    exitAttempts: 0,
  },
  first_dismissal: {
    id: "first_dismissal",
    name: "First Dismissal",
    description: "User dismissed their first break reminder (Leave Me Alone once).",
    consecutiveDismissals: 1,
    totalDismissals: 1,
    breaksAccepted: 0,
    exitAttempts: 0,
  },
  light_repeated_dismissal: {
    id: "light_repeated_dismissal",
    name: "Light Repeated Dismissal",
    description: "User dismissed 2 break reminders consecutively.",
    consecutiveDismissals: 2,
    totalDismissals: 2,
    breaksAccepted: 0,
    exitAttempts: 0,
  },
  medium_repeated_dismissal: {
    id: "medium_repeated_dismissal",
    name: "Medium Repeated Dismissal",
    description: "User dismissed 4 break reminders consecutively.",
    consecutiveDismissals: 4,
    totalDismissals: 4,
    breaksAccepted: 0,
    exitAttempts: 0,
  },
  heavy_repeated_dismissal: {
    id: "heavy_repeated_dismissal",
    name: "Heavy Repeated Dismissal",
    description: "User dismissed 6 break reminders consecutively without taking breaks.",
    consecutiveDismissals: 6,
    totalDismissals: 6,
    breaksAccepted: 0,
    exitAttempts: 0,
  },
  accepted_break_after_dismissals: {
    id: "accepted_break_after_dismissals",
    name: "Accepted Break After Dismissals",
    description: "User dismissed 4 breaks previously, but then accepted a break, resetting consecutive dismissals to 0.",
    consecutiveDismissals: 0,
    totalDismissals: 4,
    breaksAccepted: 1,
    exitAttempts: 0,
  },
  repeated_exit_attempts: {
    id: "repeated_exit_attempts",
    name: "Repeated Exit Attempts",
    description: "User has 6 dismissals and attempted to exit the application 3 times.",
    consecutiveDismissals: 6,
    totalDismissals: 6,
    breaksAccepted: 0,
    exitAttempts: 3,
  },
  final_exit_attempt: {
    id: "final_exit_attempt",
    name: "Final Exit Attempt",
    description: "User has 8 dismissals and attempted to exit 4 times (climax threshold).",
    consecutiveDismissals: 8,
    totalDismissals: 8,
    breaksAccepted: 0,
    exitAttempts: 4,
  },
};

/**
 * Returns a typed fixture by ID safely.
 */
export function getBehaviorFixture(id: string): UserBehaviorStateFixture | undefined {
  return BEHAVIOR_FIXTURES[id];
}

/**
 * Returns all available behavior fixtures as an array.
 */
export function getAllBehaviorFixtures(): UserBehaviorStateFixture[] {
  return Object.values(BEHAVIOR_FIXTURES);
}
