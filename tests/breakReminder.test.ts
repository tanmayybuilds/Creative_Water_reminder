import { useBreakReminderStore } from "../src/features/reminder/reminderStore";
import { subscribeToBreakEvents } from "../src/features/reminder/reminderEvents";
import { SUPPORTED_INTERVALS } from "../src/features/reminder/types";
import type { BreakEvent, BreakEventType } from "../src/features/reminder/types";

export function runBreakReminderTests() {
  console.log("=== RUNNING RECURRING BREAK REMINDER TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Track emitted events
  const recordedEvents: BreakEvent[] = [];
  const unsubscribe = subscribeToBreakEvents((event) => {
    recordedEvents.push(event);
  });

  // 1. Initial State Test
  console.log("1. Testing Initial Timer State...");
  const initialState = useBreakReminderStore.getState();
  assert(initialState.status === "IDLE", "Initial status is 'IDLE'");
  assert(initialState.intervalMinutes === 30, "Default interval is 30 minutes");
  assert(initialState.remainingSeconds === 30 * 60, "Initial remaining seconds is 1800s (30m)");
  assert(initialState.consecutiveDismissals === 0, "Initial consecutiveDismissals is 0");
  assert(initialState.totalDismissals === 0, "Initial totalDismissals is 0");
  assert(initialState.breaksAccepted === 0, "Initial breaksAccepted is 0");

  // 2. Interval Selector Test
  console.log("\n2. Testing Supported Intervals...");
  assert(SUPPORTED_INTERVALS.length >= 6, "Supports at least 6 interval presets (10, 15, 20, 30, 45, 60)");
  useBreakReminderStore.getState().setIntervalMinutes(45);
  assert(useBreakReminderStore.getState().intervalMinutes === 45, "Interval updated to 45 minutes");
  assert(useBreakReminderStore.getState().remainingSeconds === 45 * 60, "Remaining seconds updated to 2700s (45m)");

  // 3. Start Timer Test
  console.log("\n3. Testing Starting the Timer...");
  recordedEvents.length = 0;
  useBreakReminderStore.getState().startTimer(20);
  const runningState = useBreakReminderStore.getState();
  assert(runningState.status === "RUNNING", "Status is 'RUNNING'");
  assert(runningState.intervalMinutes === 20, "Interval is 20 minutes");
  assert(runningState.startedAt !== null, "startedAt timestamp is recorded");
  assert(runningState.targetEndTime !== null, "targetEndTime timestamp is computed");
  assert(
    Math.abs((runningState.targetEndTime! - runningState.startedAt!) - 20 * 60 * 1000) < 50,
    "targetEndTime is exactly startedAt + 20 minutes"
  );
  assert(recordedEvents.some((e) => e.type === "BREAK_STARTED"), "BREAK_STARTED event emitted");

  // 4. Timestamp-based Countdown Calculation Test
  console.log("\n4. Testing Countdown Calculation From Timestamps...");
  // Simulate 5 seconds elapsed
  const originalTarget = runningState.targetEndTime!;
  useBreakReminderStore.getState().tick();
  const tickRemaining = useBreakReminderStore.getState().remainingSeconds;
  assert(tickRemaining <= 20 * 60 && tickRemaining > 0, "tick() calculates remaining time from targetEndTime");

  // 5. Sleep & Wake / Resync Test (Simulate 15 minutes elapsed)
  console.log("\n5. Testing Sleep / Wake Resync...");
  // Manually move targetEndTime to 5 seconds in future to simulate passage of time
  useBreakReminderStore.setState({
    targetEndTime: Date.now() + 5000,
  });
  useBreakReminderStore.getState().resyncFromSleep();
  const sleepRemaining = useBreakReminderStore.getState().remainingSeconds;
  assert(sleepRemaining <= 5 && sleepRemaining > 0, "resyncFromSleep() recalculates accurately from timestamps");

  // 6. Expiration & Break Trigger Test
  console.log("\n6. Testing Timer Expiration & Break Trigger...");
  recordedEvents.length = 0;
  // Move targetEndTime to past
  useBreakReminderStore.setState({
    targetEndTime: Date.now() - 1000,
  });
  useBreakReminderStore.getState().tick();
  const triggeredState = useBreakReminderStore.getState();
  assert(triggeredState.status === "BREAK_TRIGGERED", "Timer expiration sets status to 'BREAK_TRIGGERED'");
  assert(triggeredState.remainingSeconds === 0, "Remaining seconds clamped to 0");
  assert(recordedEvents.some((e) => e.type === "BREAK_TRIGGERED"), "BREAK_TRIGGERED event emitted");

  // 7. No Duplicate Break Event Guard Test
  console.log("\n7. Testing Single-Fire Guard (No Duplicate Break Trigger)...");
  const eventCountBefore = recordedEvents.filter((e) => e.type === "BREAK_TRIGGERED").length;
  useBreakReminderStore.getState().triggerBreak(); // Attempt second trigger while already triggered
  const eventCountAfter = recordedEvents.filter((e) => e.type === "BREAK_TRIGGERED").length;
  assert(eventCountBefore === eventCountAfter, "Single-fire guard prevents duplicate break triggers");

  // 8. TAKE A BREAK Action Test
  console.log("\n8. Testing 'TAKE A BREAK' Action...");
  recordedEvents.length = 0;
  useBreakReminderStore.setState({
    consecutiveDismissals: 2, // Simulate prior dismissals
  });
  useBreakReminderStore.getState().acceptBreak();
  const acceptedState = useBreakReminderStore.getState();
  assert(acceptedState.breaksAccepted === 1, "breaksAccepted incremented to 1");
  assert(acceptedState.consecutiveDismissals === 0, "consecutiveDismissals reset to 0");
  assert(acceptedState.status === "RUNNING", "Timer resets and automatically starts next recurring interval");
  assert(acceptedState.targetEndTime! > Date.now(), "New targetEndTime computed for next interval");
  assert(recordedEvents.some((e) => e.type === "BREAK_ACCEPTED"), "BREAK_ACCEPTED event emitted");

  // 9. LEAVE ME ALONE Action Test
  console.log("\n9. Testing 'LEAVE ME ALONE' Action...");
  recordedEvents.length = 0;
  useBreakReminderStore.getState().triggerBreak(); // Trigger break again
  useBreakReminderStore.getState().dismissBreak();
  const dismissedState = useBreakReminderStore.getState();
  assert(dismissedState.totalDismissals === 1, "totalDismissals incremented to 1");
  assert(dismissedState.consecutiveDismissals === 1, "consecutiveDismissals incremented to 1");
  assert(dismissedState.status === "RUNNING", "Timer resets and automatically starts next recurring interval");
  assert(recordedEvents.some((e) => e.type === "BREAK_DISMISSED"), "BREAK_DISMISSED event emitted");

  // Test Second Consecutive Dismissal
  useBreakReminderStore.getState().triggerBreak();
  useBreakReminderStore.getState().dismissBreak();
  const secondDismissed = useBreakReminderStore.getState();
  assert(secondDismissed.totalDismissals === 2, "totalDismissals incremented to 2");
  assert(secondDismissed.consecutiveDismissals === 2, "consecutiveDismissals incremented to 2");

  // 10. Reset Timer Action Test
  console.log("\n10. Testing 'RESET' Action...");
  recordedEvents.length = 0;
  useBreakReminderStore.getState().resetTimer();
  const resetState = useBreakReminderStore.getState();
  assert(resetState.status === "RUNNING", "Reset keeps timer in 'RUNNING' state");
  assert(resetState.remainingSeconds === resetState.intervalMinutes * 60, "Remaining seconds reset to full interval");
  assert(recordedEvents.some((e) => e.type === "BREAK_TIMER_RESET"), "BREAK_TIMER_RESET event emitted");

  // 11. Stop Timer Action Test
  console.log("\n11. Testing 'STOP' Action...");
  recordedEvents.length = 0;
  useBreakReminderStore.getState().stopTimer();
  const stoppedState = useBreakReminderStore.getState();
  assert(stoppedState.status === "STOPPED", "Status transitioned to 'STOPPED'");
  assert(stoppedState.startedAt === null, "startedAt cleared");
  assert(stoppedState.targetEndTime === null, "targetEndTime cleared");
  assert(recordedEvents.some((e) => e.type === "BREAK_TIMER_STOPPED"), "BREAK_TIMER_STOPPED event emitted");

  // 12. Developer Test Break Trigger
  console.log("\n12. Testing Developer Instant Test Break Trigger...");
  recordedEvents.length = 0;
  useBreakReminderStore.getState().testBreakNow();
  assert(useBreakReminderStore.getState().status === "BREAK_TRIGGERED", "testBreakNow() sets status to 'BREAK_TRIGGERED'");
  assert(recordedEvents.some((e) => e.type === "BREAK_TRIGGERED"), "testBreakNow() emits BREAK_TRIGGERED event");

  // Cleanup
  useBreakReminderStore.getState().stopTimer();
  unsubscribe();

  console.log(`\n========================================`);
  console.log(`BREAK REMINDER TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBreakReminderTests();
