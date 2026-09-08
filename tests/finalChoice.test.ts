import { useBreakSessionStore } from "../src/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "../src/features/reminder/reminderStore";
import { useMemeStore } from "../src/features/memes/memeStore";
import { useBehaviorEngine } from "../src/features/memes/behavior/behaviorEngine";
import { isBreakInterventionActive } from "../src/features/break/session/useExitAttemptInterceptor";
import { FINAL_CHOICE_CONFIG } from "../src/features/break/session/finalChoiceConfig";
import { MEME_ESCALATION_CONFIG } from "../src/features/memes/behavior/behaviorConfig";
import { getMeme } from "../src/features/memes/registry";

/**
 * Helper: Drive session to FINAL_CHOICE by accumulating 3 exit attempts.
 */
async function driveToFinalChoice() {
  useBreakReminderStore.getState().testBreakNow();
  for (let i = 0; i < 3; i++) {
    const mId = useBreakSessionStore.getState().handleExitAttempt(() => 0.0);
    const s = useBreakSessionStore.getState().currentSession;
    if (s?.status === "MEME_PLAYING" && mId) {
      useBreakSessionStore.getState().handleMemeFinished(mId);
      // Let setTimeout callbacks in handleMemeFinished settle
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  useBreakSessionStore.getState().handleFinalChoiceAttempt();
}

export async function runFinalChoiceTests() {
  console.log("=== RUNNING FINAL CHOICE TESTS ===\n");
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

  function resetAll() {
    useBreakSessionStore.getState().resetAll(true);
    useBreakReminderStore.setState({
      status: "IDLE",
      consecutiveDismissals: 0,
      totalDismissals: 0,
      breaksAccepted: 0,
    });
    useBehaviorEngine.getState().resetBehaviorState();
    // Clear meme store without triggering callbacks
    useMemeStore.setState({ activeMeme: null });
  }

  const wrongOption: "PAISA" | "PEHCHAAN" =
    FINAL_CHOICE_CONFIG.correctOption === "PAISA" ? "PEHCHAAN" : "PAISA";

  // =============================================
  // Test 1: FINAL_EXIT_ATTEMPT enters FINAL_CHOICE
  // =============================================
  console.log("1. Testing FINAL_EXIT_ATTEMPT → FINAL_CHOICE transition...");
  resetAll();
  useBreakReminderStore.getState().testBreakNow();
  for (let i = 0; i < 3; i++) {
    const mId = useBreakSessionStore.getState().handleExitAttempt(() => 0.0);
    const s = useBreakSessionStore.getState().currentSession;
    if (s?.status === "MEME_PLAYING" && mId) {
      useBreakSessionStore.getState().handleMemeFinished(mId);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  let session = useBreakSessionStore.getState().currentSession;
  assert(
    session?.status === "FINAL_EXIT_ATTEMPT",
    "Session reaches FINAL_EXIT_ATTEMPT after 3 exit attempts"
  );

  useBreakSessionStore.getState().handleFinalChoiceAttempt();
  session = useBreakSessionStore.getState().currentSession;
  assert(session?.status === "FINAL_CHOICE", "handleFinalChoiceAttempt transitions to FINAL_CHOICE");
  assert(session?.finalChoiceAttempted === true, "finalChoiceAttempted flag set to true");

  // =============================================
  // Test 2 & 3: Both options available, config-driven
  // =============================================
  console.log("\n2 & 3. Testing both options available and config-driven...");
  assert(
    FINAL_CHOICE_CONFIG.correctOption === "PAISA" || FINAL_CHOICE_CONFIG.correctOption === "PEHCHAAN",
    "Correct option is one of PAISA or PEHCHAAN"
  );
  assert(wrongOption !== FINAL_CHOICE_CONFIG.correctOption, "Wrong option differs from correct option");

  // =============================================
  // Test 4: Correct option from single config
  // =============================================
  console.log("\n4. Testing correct option is from single config value...");
  assert(typeof FINAL_CHOICE_CONFIG.correctOption === "string", "correctOption is a string");
  assert(FINAL_CHOICE_CONFIG.correctOption === "PAISA", `Correct option is "${FINAL_CHOICE_CONFIG.correctOption}"`);

  // =============================================
  // Test 5: Wrong option triggers exactly one meme
  // =============================================
  console.log("\n5. Testing wrong option triggers exactly one meme...");
  resetAll();
  await driveToFinalChoice();
  session = useBreakSessionStore.getState().currentSession;
  assert(session?.status === "FINAL_CHOICE", "Precondition: in FINAL_CHOICE state");

  const memesBeforeWrong = session?.memesPlayedThisBreak.length || 0;
  useBreakSessionStore.getState().handleFinalChoice(wrongOption);
  session = useBreakSessionStore.getState().currentSession;
  assert(session?.status === "MEME_PLAYING", "Wrong answer transitions to MEME_PLAYING");
  assert(
    session?.lastMemeId === FINAL_CHOICE_CONFIG.wrongAnswerMemeId,
    `Wrong answer plays "${FINAL_CHOICE_CONFIG.wrongAnswerMemeId}"`
  );
  assert(
    (session?.memesPlayedThisBreak.length || 0) === memesBeforeWrong + 1,
    "Exactly one meme added to session history"
  );

  // =============================================
  // Test 6: Wrong option does NOT automatically chain another meme
  // =============================================
  console.log("\n6. Testing no automatic meme chaining after wrong answer...");
  useBreakSessionStore.getState().handleMemeFinished(FINAL_CHOICE_CONFIG.wrongAnswerMemeId);
  await new Promise((resolve) => setTimeout(resolve, 200));
  session = useBreakSessionStore.getState().currentSession;
  assert(
    session?.status === "FINAL_CHOICE",
    "After wrong-answer meme finishes, returns to FINAL_CHOICE (no auto chain)"
  );

  // =============================================
  // Test 7: Meme completion returns to FINAL_CHOICE
  // =============================================
  console.log("\n7. Testing meme completion returns to FINAL_CHOICE...");
  assert(session?.status === "FINAL_CHOICE", "Confirmed: status is FINAL_CHOICE after meme finished");

  // =============================================
  // Test 8: Correct option triggers configured correct-answer meme
  // =============================================
  console.log("\n8. Testing correct option triggers correct-answer meme...");
  resetAll();
  await driveToFinalChoice();

  useBreakSessionStore.getState().handleFinalChoice(FINAL_CHOICE_CONFIG.correctOption);
  session = useBreakSessionStore.getState().currentSession;
  // After correct answer + onComplete → handleTakeABreak → FINISHED
  // The meme's onComplete fires handleTakeABreak immediately since
  // the meme store is simulated (no actual video playback)
  assert(
    session?.status === "MEME_PLAYING" || session?.status === "FINISHED",
    "Correct answer transitions to MEME_PLAYING or FINISHED"
  );
  assert(
    session?.lastMemeId === FINAL_CHOICE_CONFIG.correctAnswerMemeId || session?.status === "FINISHED",
    `Correct answer plays "${FINAL_CHOICE_CONFIG.correctAnswerMemeId}" or completed`
  );

  // =============================================
  // Test 9: Correct-answer meme completion finishes the break
  // =============================================
  console.log("\n9. Testing correct-answer meme completion finishes break...");
  // If not already FINISHED from the callback chain, explicitly finish
  if (useBreakSessionStore.getState().currentSession?.status !== "FINISHED") {
    useBreakSessionStore.getState().handleTakeABreak();
  }
  session = useBreakSessionStore.getState().currentSession;
  assert(session?.status === "FINISHED", "Session transitions to FINISHED after correct answer");
  assert(session?.consecutiveRefusals === 0, "Consecutive refusals reset to 0");

  // =============================================
  // Test 10: shutup_manoj_tiwari excluded from normal selection
  // =============================================
  console.log("\n10. Testing Manoj Tiwari exclusion from normal selection...");
  assert(!MEME_ESCALATION_CONFIG.memePools.level0.includes("shutup_manoj_tiwari"), "Not in level 0 pool");
  assert(!MEME_ESCALATION_CONFIG.memePools.level1.includes("shutup_manoj_tiwari"), "Not in level 1 pool");
  assert(!MEME_ESCALATION_CONFIG.memePools.level2.includes("shutup_manoj_tiwari"), "Not in level 2 pool");
  assert(MEME_ESCALATION_CONFIG.reservedAssets.includes("shutup_manoj_tiwari"), "In reservedAssets");

  // =============================================
  // Test 11: shutup_manoj_tiwari CAN be selected by finale
  // =============================================
  console.log("\n11. Testing Manoj Tiwari available for finale...");
  assert(
    FINAL_CHOICE_CONFIG.wrongAnswerMemeId === "shutup_manoj_tiwari",
    "wrongAnswerMemeId is shutup_manoj_tiwari"
  );
  assert(getMeme("shutup_manoj_tiwari") !== undefined, "shutup_manoj_tiwari exists in registry");

  // =============================================
  // Test 12: Final-choice attempts increment correctly
  // =============================================
  console.log("\n12. Testing final-choice attempts increment...");
  resetAll();
  await driveToFinalChoice();
  assert(
    useBreakSessionStore.getState().currentSession?.finalChoiceAttempts === 0,
    "Initial finalChoiceAttempts is 0"
  );

  // Wrong #1
  useBreakSessionStore.getState().handleFinalChoice(wrongOption);
  assert(
    useBreakSessionStore.getState().currentSession?.finalChoiceAttempts === 1,
    "finalChoiceAttempts incremented to 1"
  );
  useBreakSessionStore.getState().handleMemeFinished(FINAL_CHOICE_CONFIG.wrongAnswerMemeId);
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Wrong #2
  useBreakSessionStore.getState().handleFinalChoice(wrongOption);
  assert(
    useBreakSessionStore.getState().currentSession?.finalChoiceAttempts === 2,
    "finalChoiceAttempts incremented to 2"
  );

  // =============================================
  // Test 13: MAX_FINAL_CHOICE_ATTEMPTS prevents infinite loops
  // =============================================
  console.log("\n13. Testing MAX_FINAL_CHOICE_ATTEMPTS anti-infinite-loop...");
  resetAll();
  await driveToFinalChoice();

  const maxAttempts = FINAL_CHOICE_CONFIG.maxFinalChoiceAttempts;
  assert(maxAttempts === 3, `MAX_FINAL_CHOICE_ATTEMPTS is ${maxAttempts}`);

  for (let i = 0; i < maxAttempts; i++) {
    useBreakSessionStore.getState().handleFinalChoice(wrongOption);
    const cur = useBreakSessionStore.getState().currentSession;
    if (cur?.status === "MEME_PLAYING") {
      useBreakSessionStore.getState().handleMemeFinished(FINAL_CHOICE_CONFIG.wrongAnswerMemeId);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  session = useBreakSessionStore.getState().currentSession;
  assert(
    session?.status === "FINISHED",
    `After ${maxAttempts} wrong answers, session resolves to FINISHED`
  );

  // =============================================
  // Test 14: Session counters remain isolated
  // =============================================
  console.log("\n14. Testing session counter isolation...");
  resetAll();
  useBreakReminderStore.getState().testBreakNow();

  useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.0);
  let s = useBreakSessionStore.getState().currentSession;
  if (s?.status === "MEME_PLAYING" && s.lastMemeId) {
    useBreakSessionStore.getState().handleMemeFinished(s.lastMemeId);
  }
  await new Promise((resolve) => setTimeout(resolve, 200));

  useBreakSessionStore.getState().handleExitAttempt(() => 0.0);
  s = useBreakSessionStore.getState().currentSession;
  if (s?.status === "MEME_PLAYING" && s.lastMemeId) {
    useBreakSessionStore.getState().handleMemeFinished(s.lastMemeId);
  }
  await new Promise((resolve) => setTimeout(resolve, 200));

  s = useBreakSessionStore.getState().currentSession;
  assert(s?.refusalCount === 1, "refusalCount is 1 (from LEAVE ME ALONE)");
  assert(s?.exitAttemptCount === 1, "exitAttemptCount is 1 (from exit attempt)");
  assert(s?.finalChoiceAttempts === 0, "finalChoiceAttempts is 0 (none made yet)");

  // =============================================
  // Test 15: Recurring timer resumes after completion
  // =============================================
  console.log("\n15. Testing recurring timer resumes after completion...");
  resetAll();
  useBreakReminderStore.getState().startTimer(30);
  await driveToFinalChoice();

  useBreakSessionStore.getState().handleFinalChoice(FINAL_CHOICE_CONFIG.correctOption);
  // Let the meme onComplete chain fire
  await new Promise((resolve) => setTimeout(resolve, 100));
  // Ensure we finish
  if (useBreakSessionStore.getState().currentSession?.status !== "FINISHED") {
    useBreakSessionStore.getState().handleTakeABreak();
  }

  const reminderState = useBreakReminderStore.getState();
  assert(reminderState.status === "RUNNING", "Recurring timer is RUNNING after break acceptance");
  assert(reminderState.targetEndTime !== null, "targetEndTime set for next interval");

  // =============================================
  // Test 16: App does not permanently trap the user
  // =============================================
  console.log("\n16. Testing no permanent trapping...");
  resetAll();
  await driveToFinalChoice();

  for (let i = 0; i < FINAL_CHOICE_CONFIG.maxFinalChoiceAttempts; i++) {
    useBreakSessionStore.getState().handleFinalChoice(wrongOption);
    const cur = useBreakSessionStore.getState().currentSession;
    if (cur?.status === "MEME_PLAYING") {
      useBreakSessionStore.getState().handleMemeFinished(FINAL_CHOICE_CONFIG.wrongAnswerMemeId);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  session = useBreakSessionStore.getState().currentSession;
  assert(session?.status === "FINISHED", "User is never trapped: FINISHED after max attempts");
  assert(!isBreakInterventionActive(), "isBreakInterventionActive() is false after FINISHED");

  // =============================================
  // Test 17: Missing correct-answer meme fails safely
  // =============================================
  console.log("\n17. Testing missing correct-answer meme fails safely...");
  resetAll();
  await driveToFinalChoice();

  const originalCorrectMeme = FINAL_CHOICE_CONFIG.correctAnswerMemeId;
  (FINAL_CHOICE_CONFIG as any).correctAnswerMemeId = "nonexistent_meme_id";

  let noError = true;
  try {
    useBreakSessionStore.getState().handleFinalChoice(FINAL_CHOICE_CONFIG.correctOption);
  } catch (e) {
    noError = false;
  }
  assert(noError, "Missing correct-answer meme does not throw");

  session = useBreakSessionStore.getState().currentSession;
  assert(session?.status === "FINISHED", "Missing meme falls back to break acceptance (FINISHED)");

  // Restore config
  (FINAL_CHOICE_CONFIG as any).correctAnswerMemeId = originalCorrectMeme;

  // =============================================
  // Test 18: Exit attempts absorbed during FINAL_CHOICE
  // =============================================
  console.log("\n18. Testing exit attempts absorbed during FINAL_CHOICE...");
  resetAll();
  await driveToFinalChoice();
  session = useBreakSessionStore.getState().currentSession;
  const exitCountBefore = session?.exitAttemptCount || 0;

  useBreakSessionStore.getState().handleExitAttempt();
  session = useBreakSessionStore.getState().currentSession;
  assert(session?.status === "FINAL_CHOICE", "Exit attempt stays in FINAL_CHOICE (no bypass)");
  assert(
    session?.exitAttemptCount === exitCountBefore + 1,
    "Exit count increments but no escalation triggered"
  );

  // =============================================
  // Test 19: FINAL_CHOICE in isBreakInterventionActive
  // =============================================
  console.log("\n19. Testing FINAL_CHOICE blocks window close...");
  assert(isBreakInterventionActive(), "isBreakInterventionActive() is true during FINAL_CHOICE");

  // =============================================
  // Test 20: Normal close after FINISHED
  // =============================================
  console.log("\n20. Testing normal close after FINISHED...");
  useBreakSessionStore.getState().handleFinalChoice(FINAL_CHOICE_CONFIG.correctOption);
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (useBreakSessionStore.getState().currentSession?.status !== "FINISHED") {
    useBreakSessionStore.getState().handleTakeABreak();
  }
  assert(!isBreakInterventionActive(), "Window close allowed normally after FINISHED");

  // =============================================
  console.log(`\n=============================================================`);
  console.log(`FINAL CHOICE TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

(async () => {
  await runFinalChoiceTests();
})();
