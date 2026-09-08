import { useBreakSessionStore } from "../src/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "../src/features/reminder/reminderStore";
import { useMemeStore } from "../src/features/memes/memeStore";
import { useBehaviorEngine } from "../src/features/memes/behavior/behaviorEngine";
import { MEME_REGISTRY } from "../src/features/memes/registry";

export function runBreakSessionTests() {
  console.log("=== RUNNING BREAK SESSION STATE MACHINE TESTS ===\n");
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

  // Reset all state prior to testing
  useBreakSessionStore.getState().resetAll(true);
  useBreakReminderStore.setState({
    status: "IDLE",
    consecutiveDismissals: 0,
    totalDismissals: 0,
    breaksAccepted: 0,
  });
  useBehaviorEngine.getState().resetBehaviorState();
  useMemeStore.getState().stopMeme();

  // Test 1: New break session starts correctly
  console.log("1. Testing New Break Session Initialization...");
  const session1 = useBreakSessionStore.getState().startNewSession();
  assert(!!session1.sessionId, "Session ID generated and non-empty");
  assert(session1.sessionStartTime > 0, "sessionStartTime recorded accurately");
  assert(session1.refusalCount === 0, "refusalCount initialized to 0");
  assert(session1.leaveMeAloneCount === 0, "leaveMeAloneCount initialized to 0");
  assert(session1.exitAttemptCount === 0, "exitAttemptCount initialized to 0");
  assert(session1.consecutiveRefusals === 0, "consecutiveRefusals initialized to 0");
  assert(session1.memesPlayedThisBreak.length === 0, "memesPlayedThisBreak initialized empty");
  assert(session1.lastMemeId === null, "lastMemeId initialized to null");
  assert(session1.finalChoiceAttempted === false, "finalChoiceAttempted initialized to false");
  assert(session1.status === "BREAK_PROMPT", "Session state initialized to BREAK_PROMPT");
  assert(
    useBreakSessionStore.getState().lifetimeStats.totalBreaksTriggered === 1,
    "Lifetime totalBreaksTriggered incremented to 1"
  );

  // Test 2: Accepting a break completes the session
  console.log("\n2. Testing Break Acceptance...");
  useBreakSessionStore.getState().handleTakeABreak();
  const acceptedSession = useBreakSessionStore.getState().currentSession;
  assert(acceptedSession?.status === "FINISHED", "Session status transitioned to FINISHED");
  assert(acceptedSession?.consecutiveRefusals === 0, "Consecutive refusals reset to 0 upon break acceptance");
  assert(
    useBreakSessionStore.getState().lifetimeStats.totalBreaksAccepted === 1,
    "Lifetime totalBreaksAccepted incremented to 1"
  );

  // Test 3 & 4: Leave Me Alone increments refusalCount and leaveMeAloneCount
  console.log("\n3 & 4. Testing 'Leave Me Alone' Refusal Counters...");
  useBreakSessionStore.getState().startNewSession();
  const meme1 = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.1);
  const sessionRefused1 = useBreakSessionStore.getState().currentSession;
  assert(sessionRefused1?.refusalCount === 1, "refusalCount incremented to 1");
  assert(sessionRefused1?.leaveMeAloneCount === 1, "leaveMeAloneCount incremented to 1");
  assert(sessionRefused1?.consecutiveRefusals === 1, "consecutiveRefusals incremented to 1");
  assert(
    useBreakSessionStore.getState().lifetimeStats.totalBreaksRefused === 1,
    "Lifetime totalBreaksRefused incremented to 1"
  );

  // Test 5: Consecutive refusals increment correctly
  console.log("\n5. Testing Repeated Consecutive Refusals...");
  // Simulate meme finished
  useBreakSessionStore.getState().handleMemeFinished();
  assert(
    useBreakSessionStore.getState().currentSession?.status === "MEME_FINISHED" ||
      useBreakSessionStore.getState().currentSession?.status === "BREAK_PROMPT",
    "Meme completion transitioned state safely"
  );

  // Second refusal in same session
  const meme2 = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.2);
  const sessionRefused2 = useBreakSessionStore.getState().currentSession;
  assert(sessionRefused2?.refusalCount === 2, "refusalCount incremented to 2 on second refusal");
  assert(sessionRefused2?.leaveMeAloneCount === 2, "leaveMeAloneCount incremented to 2 on second refusal");
  assert(sessionRefused2?.consecutiveRefusals === 2, "consecutiveRefusals incremented to 2");
  assert(
    useBreakSessionStore.getState().lifetimeStats.totalBreaksRefused === 2,
    "Lifetime totalBreaksRefused incremented to 2"
  );

  // Test 7: Meme playback state transitions correctly (checked right after meme trigger)
  console.log("\n7. Testing Meme Playback State Transitions...");
  assert(
    sessionRefused2?.status === "MEME_PLAYING",
    "Status is MEME_PLAYING when meme is triggered"
  );
  assert(useMemeStore.getState().activeMeme !== null, "MemePlayer actively playing selected meme");

  // Test 6: Exit attempts are tracked separately
  console.log("\n6. Testing Exit Attempt Isolation...");
  useBreakSessionStore.getState().handleExitAttempt();
  const sessionAfterExit = useBreakSessionStore.getState().currentSession;
  assert(sessionAfterExit?.exitAttemptCount === 1, "exitAttemptCount incremented to 1");
  assert(sessionAfterExit?.refusalCount === 2, "refusalCount remained 2 (NOT merged with exitAttemptCount)");
  assert(sessionAfterExit?.leaveMeAloneCount === 2, "leaveMeAloneCount remained 2 (NOT merged with exitAttemptCount)");
  assert(
    useBreakSessionStore.getState().lifetimeStats.totalExitAttempts === 1,
    "Lifetime totalExitAttempts incremented to 1"
  );

  // Test 8: Meme completion returns to the correct interaction state
  console.log("\n8. Testing Meme Completion Transition...");
  useBreakSessionStore.getState().handleMemeFinished();
  const sessionAfterMemeDone = useBreakSessionStore.getState().currentSession;
  assert(
    sessionAfterMemeDone?.status === "MEME_FINISHED" ||
      sessionAfterMemeDone?.status === "REFUSED_AGAIN" ||
      sessionAfterMemeDone?.status === "BREAK_PROMPT",
    "Meme finished returns to non-playing interaction state"
  );

  // Test 9: New session resets session counters
  console.log("\n9. Testing New Session Counter Reset...");
  const sessionNew = useBreakSessionStore.getState().startNewSession();
  assert(sessionNew.refusalCount === 0, "New session refusalCount reset to 0");
  assert(sessionNew.leaveMeAloneCount === 0, "New session leaveMeAloneCount reset to 0");
  assert(sessionNew.exitAttemptCount === 0, "New session exitAttemptCount reset to 0");
  assert(sessionNew.memesPlayedThisBreak.length === 0, "New session memesPlayedThisBreak reset to empty");
  assert(sessionNew.lastMemeId === null, "New session lastMemeId reset to null");

  // Test 10: Lifetime counters are not incorrectly reset
  console.log("\n10. Testing Lifetime Statistics Persistence Across Session Resets...");
  const lifetime = useBreakSessionStore.getState().lifetimeStats;
  assert(lifetime.totalBreaksTriggered >= 2, "totalBreaksTriggered preserved (>= 2)");
  assert(lifetime.totalBreaksAccepted === 1, "totalBreaksAccepted preserved (= 1)");
  assert(lifetime.totalBreaksRefused === 2, "totalBreaksRefused preserved (= 2)");
  assert(lifetime.totalMemesPlayed >= 1, "totalMemesPlayed preserved (>= 1)");
  assert(lifetime.totalExitAttempts === 1, "totalExitAttempts preserved (= 1)");

  // Test 11: Last meme ID is tracked
  console.log("\n11. Testing Last Meme ID Tracking...");
  const selectedMeme = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.5);
  const sessionWithMeme = useBreakSessionStore.getState().currentSession;
  assert(!!sessionWithMeme?.lastMemeId, `lastMemeId tracked (${sessionWithMeme?.lastMemeId})`);
  assert(
    sessionWithMeme?.memesPlayedThisBreak.includes(sessionWithMeme.lastMemeId!),
    "memesPlayedThisBreak contains lastMemeId"
  );

  // Test 12: Multiple refusals do not automatically create an endless meme loop
  console.log("\n12. Testing UX Rule (No Automatic Infinite Meme Loops)...");
  useBreakSessionStore.getState().handleMemeFinished();
  const currentAfterDone = useBreakSessionStore.getState().currentSession;
  assert(
    currentAfterDone?.status !== "MEME_PLAYING",
    "Status is NOT MEME_PLAYING after meme completion (waits for user)"
  );

  // Test 13: Existing Meme Behavior Engine remains functional
  console.log("\n13. Testing Existing Behavior Engine Integration...");
  const behaviorState = useBehaviorEngine.getState();
  assert(typeof behaviorState.handleLeaveMeAlone === "function", "Behavior engine handleLeaveMeAlone exists");
  assert(typeof behaviorState.handleTakeABreak === "function", "Behavior engine handleTakeABreak exists");
  assert(typeof behaviorState.handleExitAttempt === "function", "Behavior engine handleExitAttempt exists");

  // Test 14: Existing anti-repetition behavior remains functional
  console.log("\n14. Testing Anti-Repetition Guarantee...");
  const memeA = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.0);
  useBreakSessionStore.getState().handleMemeFinished();
  const memeB = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.0);
  assert(memeA !== memeB || memeA === null, "Anti-repetition prevented immediate duplicate meme (A !== B)");

  console.log(`\n=========================================================`);
  console.log(`BREAK SESSION TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=========================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBreakSessionTests();
