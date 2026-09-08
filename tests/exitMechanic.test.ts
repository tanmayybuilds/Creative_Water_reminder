import { useBreakSessionStore } from "../src/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "../src/features/reminder/reminderStore";
import { useMemeStore } from "../src/features/memes/memeStore";
import { useBehaviorEngine } from "../src/features/memes/behavior/behaviorEngine";
import { isBreakInterventionActive } from "../src/features/break/session/useExitAttemptInterceptor";
import { MEME_ESCALATION_CONFIG } from "../src/features/memes/behavior/behaviorConfig";
import { selectInterventionMeme } from "../src/features/memes/behavior/memeSelector";

export function runExitMechanicTests() {
  console.log("=== RUNNING EXIT ATTEMPT MECHANIC TESTS ===\n");
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

  // Reset all states prior to testing
  useBreakSessionStore.getState().resetAll(true);
  useBreakReminderStore.setState({
    status: "IDLE",
    consecutiveDismissals: 0,
    totalDismissals: 0,
    breaksAccepted: 0,
  });
  useBehaviorEngine.getState().resetBehaviorState();
  useMemeStore.getState().stopMeme();

  // Test 14: Normal application closing remains unchanged when no break is active
  console.log("14. Testing Inactive Break Safe Exit Detection...");
  assert(!isBreakInterventionActive(), "isBreakInterventionActive() is false when status is IDLE");

  // Test 1: Exit request is detected during active break session
  console.log("\n1. Testing Active Break Exit Interception Flag...");
  useBreakReminderStore.getState().testBreakNow();
  assert(isBreakInterventionActive(), "isBreakInterventionActive() is true when break is triggered");

  // Test 2 & 3: Exit request increments exitAttemptCount exactly once and leaves refusalCount unchanged
  console.log("\n2 & 3. Testing Exit Count Increment & Refusal Isolation...");
  const exitMeme1 = useBreakSessionStore.getState().handleExitAttempt(() => 0.0);
  const sessionAfterExit1 = useBreakSessionStore.getState().currentSession;
  assert(sessionAfterExit1?.exitAttemptCount === 1, "exitAttemptCount incremented to exactly 1");
  assert(sessionAfterExit1?.refusalCount === 0, "refusalCount remained 0 (not modified by exit attempt)");
  assert(sessionAfterExit1?.leaveMeAloneCount === 0, "leaveMeAloneCount remained 0 (not modified by exit attempt)");
  assert(
    useBreakSessionStore.getState().lifetimeStats.totalExitAttempts === 1,
    "Lifetime totalExitAttempts incremented to 1"
  );

  // Test 4: Exit attempt count is unchanged by LEAVE ME ALONE
  console.log("\n4. Testing Refusal Does Not Alter Exit Count...");
  useBreakSessionStore.getState().handleMemeFinished(exitMeme1 || undefined);
  const refusalMeme1 = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.1);
  const sessionAfterRefusal = useBreakSessionStore.getState().currentSession;
  assert(sessionAfterRefusal?.refusalCount === 1, "refusalCount incremented to 1 on LEAVE ME ALONE");
  assert(sessionAfterRefusal?.exitAttemptCount === 1, "exitAttemptCount remained 1 (unchanged by refusal)");

  // Test 5: First exit attempt triggers at most one intervention
  console.log("\n5. Testing Single Intervention per Exit Attempt...");
  assert(
    sessionAfterExit1?.status === "MEME_PLAYING" || useMemeStore.getState().activeMeme !== null,
    "Exit attempt initiated meme intervention"
  );
  assert(
    sessionAfterExit1?.memesPlayedThisBreak.length === 1,
    "Exactly 1 meme queued for the exit intervention"
  );

  // Test 6: Second exit attempt can escalate
  console.log("\n6. Testing Second Exit Attempt Escalation...");
  useBreakSessionStore.getState().handleMemeFinished(refusalMeme1 || undefined);
  const exitMeme2 = useBreakSessionStore.getState().handleExitAttempt(() => 0.5);
  const sessionAfterExit2 = useBreakSessionStore.getState().currentSession;
  assert(sessionAfterExit2?.exitAttemptCount === 2, "exitAttemptCount is now 2");
  assert(exitMeme2 !== null, `Second exit attempt triggered meme: ${exitMeme2}`);

  // Test 7 & 11: Third/further exit attempts reach FINAL_EXIT_ATTEMPT
  console.log("\n7 & 11. Testing FINAL_EXIT_ATTEMPT State Reachability...");
  useBreakSessionStore.getState().handleMemeFinished(exitMeme2 || undefined);
  const exitMeme3 = useBreakSessionStore.getState().handleExitAttempt();
  const sessionAfterExit3 = useBreakSessionStore.getState().currentSession;
  assert(sessionAfterExit3?.exitAttemptCount === 3, "exitAttemptCount reached 3");
  assert(
    sessionAfterExit3?.status === "FINAL_EXIT_ATTEMPT",
    "Session status transitioned to FINAL_EXIT_ATTEMPT"
  );

  // Test 12: FINAL_EXIT_ATTEMPT does not yet display the final choice
  console.log("\n12. Testing FINAL_EXIT_ATTEMPT Final Choice Protection...");
  assert(
    sessionAfterExit3?.finalChoiceAttempted === false,
    "finalChoiceAttempted is false (final modal not yet triggered in 7D)"
  );

  // Test 8: Anti-repetition remains active during exit interventions
  console.log("\n8. Testing Anti-Repetition during Exit Interventions...");
  const memeA = selectInterventionMeme(1, [], null, MEME_ESCALATION_CONFIG, () => 0.0);
  const memeB = selectInterventionMeme(1, [], memeA?.memeId || null, MEME_ESCALATION_CONFIG, () => 0.0);
  assert(memeA?.memeId !== memeB?.memeId, "Anti-repetition ensures consecutive exit memes differ");

  // Test 9: No automatic meme chaining occurs
  console.log("\n9. Testing No Automatic Meme Chaining...");
  useBreakSessionStore.getState().handleMemeFinished();
  const sessionWaiting = useBreakSessionStore.getState().currentSession;
  assert(
    sessionWaiting?.status !== "MEME_PLAYING",
    "No automatic meme is playing after meme finished (waits for user)"
  );

  // Test 10: Meme completion returns control to break interaction
  console.log("\n10. Testing Control Return upon Meme Completion...");
  assert(
    sessionWaiting?.status === "MEME_FINISHED" ||
      sessionWaiting?.status === "REFUSED_AGAIN" ||
      sessionWaiting?.status === "BREAK_PROMPT" ||
      sessionWaiting?.status === "FINAL_EXIT_ATTEMPT",
    "Session safely returned to break interaction state"
  );

  // Test 13: shutup_manoj_tiwari is never selected
  console.log("\n13. Testing Manoj Tiwari Exclusion...");
  assert(
    !MEME_ESCALATION_CONFIG.memePools.level0.includes("shutup_manoj_tiwari"),
    "Manoj Tiwari not in level 0"
  );
  assert(
    !MEME_ESCALATION_CONFIG.memePools.level1.includes("shutup_manoj_tiwari"),
    "Manoj Tiwari not in level 1"
  );
  assert(
    !MEME_ESCALATION_CONFIG.memePools.level2.includes("shutup_manoj_tiwari"),
    "Manoj Tiwari not in level 2"
  );
  assert(
    MEME_ESCALATION_CONFIG.reservedAssets.includes("shutup_manoj_tiwari"),
    "Manoj Tiwari is in reservedAssets list"
  );

  // Test 15: Existing refusal escalation continues to work
  console.log("\n15. Testing Refusal Escalation Coexistence...");
  useBreakSessionStore.getState().startNewSession();
  const r1 = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.0);
  useBreakSessionStore.getState().handleMemeFinished(r1 || undefined);
  const r2 = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.0);
  const sessionR = useBreakSessionStore.getState().currentSession;
  assert(sessionR?.refusalCount === 2, "2 refusals tracked correctly");
  assert(sessionR?.consecutiveRefusals === 2, "2 consecutive refusals tracked correctly");
  assert(sessionR?.exitAttemptCount === 0, "exitAttemptCount is 0 during pure refusal flow");

  console.log(`\n=============================================================`);
  console.log(`EXIT ATTEMPT MECHANIC TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runExitMechanicTests();
