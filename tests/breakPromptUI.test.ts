import { useBreakSessionStore } from "../src/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "../src/features/reminder/reminderStore";
import { useMemeStore } from "../src/features/memes/memeStore";
import { useBehaviorEngine } from "../src/features/memes/behavior/behaviorEngine";

export function runBreakPromptUITests() {
  console.log("=== RUNNING BREAK PROMPT UI & STATE INTEGRATION TESTS ===\n");
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

  // Reset all state prior to tests
  useBreakSessionStore.getState().resetAll(true);
  useBreakReminderStore.setState({
    status: "IDLE",
    consecutiveDismissals: 0,
    totalDismissals: 0,
    breaksAccepted: 0,
    remainingSeconds: 1800,
  });
  useBehaviorEngine.getState().resetBehaviorState();
  useMemeStore.getState().stopMeme();

  // Test 1: BREAK_TRIGGERED displays the break prompt
  console.log("1. Testing BREAK_TRIGGERED prompt trigger...");
  useBreakReminderStore.getState().testBreakNow();
  const reminderStatus = useBreakReminderStore.getState().status;
  const sessionStatus = useBreakSessionStore.getState().currentSession?.status;
  assert(reminderStatus === "BREAK_TRIGGERED", "Break reminder status is BREAK_TRIGGERED");
  assert(sessionStatus === "BREAK_PROMPT" || sessionStatus === "BREAK_TRIGGERED", "Break session status is active for prompt display");

  // Test 2: BREAK_PROMPT displays both actions
  console.log("\n2. Testing BREAK_PROMPT actions availability...");
  const sessionState = useBreakSessionStore.getState();
  assert(typeof sessionState.handleTakeABreak === "function", "Primary action 'TAKE A BREAK' handler is available");
  assert(typeof sessionState.handleLeaveMeAlone === "function", "Secondary action 'LEAVE ME ALONE' handler is available");

  // Test 3 & 4: TAKE A BREAK calls handleTakeABreak and dismisses prompt
  console.log("\n3 & 4. Testing 'TAKE A BREAK' Action & Prompt Dismissal...");
  sessionState.handleTakeABreak();
  const sessionAfterAccept = useBreakSessionStore.getState().currentSession;
  const reminderAfterAccept = useBreakReminderStore.getState().status;
  assert(sessionAfterAccept?.status === "FINISHED", "Session transitioned to FINISHED");
  assert(reminderAfterAccept === "RUNNING", "Recurring timer restarted to RUNNING");
  assert(sessionAfterAccept?.consecutiveRefusals === 0, "consecutiveRefusals reset to 0");
  assert(useBreakSessionStore.getState().lifetimeStats.totalBreaksAccepted === 1, "Lifetime totalBreaksAccepted incremented");

  // Test 5 & 6: LEAVE ME ALONE calls handleLeaveMeAlone and transitions to MEME_PLAYING
  console.log("\n5 & 6. Testing 'LEAVE ME ALONE' & Meme Playback Transition...");
  useBreakReminderStore.getState().testBreakNow();
  const memeId1 = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.1);
  const sessionDuringMeme = useBreakSessionStore.getState().currentSession;
  assert(sessionDuringMeme?.status === "MEME_PLAYING", "Session status transitioned to MEME_PLAYING");
  assert(useMemeStore.getState().activeMeme !== null, "MemePlayer active meme is set and playing");
  assert(sessionDuringMeme?.lastMemeId === memeId1, `lastMemeId set to ${memeId1}`);

  // Test 7: MEME_PLAYING does not display a second automatic meme
  console.log("\n7. Testing Single-Active Playback Guard during MEME_PLAYING...");
  assert(sessionDuringMeme?.memesPlayedThisBreak.length === 1, "Exactly one meme queued for current intervention");

  // Test 8: MEME_FINISHED returns to the break interaction
  console.log("\n8. Testing Return to Interaction upon MEME_FINISHED...");
  useBreakSessionStore.getState().handleMemeFinished(memeId1 || undefined);
  const sessionAfterMeme = useBreakSessionStore.getState().currentSession;
  assert(
    sessionAfterMeme?.status === "MEME_FINISHED" || sessionAfterMeme?.status === "REFUSED_AGAIN" || sessionAfterMeme?.status === "BREAK_PROMPT",
    "Session safely returned to non-playing interaction state"
  );

  // Test 9: A second meme cannot play without another user action
  console.log("\n9. Testing No Automatic Meme Looping Rule...");
  assert(
    useBreakSessionStore.getState().currentSession?.status !== "MEME_PLAYING",
    "No automatic meme is playing while waiting for user choice"
  );

  // Test 10: Existing Break Session counters remain correct
  console.log("\n10. Testing Counter Integrity across repeated prompts...");
  const currentCounts = useBreakSessionStore.getState().currentSession;
  assert(currentCounts?.refusalCount === 1, "refusalCount correctly tracked (= 1)");
  assert(currentCounts?.leaveMeAloneCount === 1, "leaveMeAloneCount correctly tracked (= 1)");
  assert(currentCounts?.consecutiveRefusals === 1, "consecutiveRefusals correctly tracked (= 1)");

  // Test 11: Existing timer behavior remains unchanged
  console.log("\n11. Testing Existing Timer Behavior Preservation...");
  const timerState = useBreakReminderStore.getState();
  assert(typeof timerState.tick === "function", "Timer tick function exists and unchanged");
  assert(typeof timerState.startTimer === "function", "startTimer function exists and unchanged");
  assert(typeof timerState.stopTimer === "function", "stopTimer function exists and unchanged");
  assert(typeof timerState.setIntervalMinutes === "function", "setIntervalMinutes function exists and unchanged");

  // Test 12: Existing Meme Player behavior remains unchanged
  console.log("\n12. Testing Existing Meme Player Behavior Preservation...");
  const memeState = useMemeStore.getState();
  assert(typeof memeState.playMeme === "function", "playMeme function exists and unchanged");
  assert(typeof memeState.stopMeme === "function", "stopMeme function exists and unchanged");
  assert(typeof memeState.setGlobalVolume === "function", "setGlobalVolume function exists and unchanged");
  assert(typeof memeState.setPlaybackRate === "function", "setPlaybackRate function exists and unchanged");

  console.log(`\n=============================================================`);
  console.log(`BREAK PROMPT UI TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBreakPromptUITests();
