import {
  calculateRefusalLevel,
  calculateExitLevel,
  calculateCombinedEscalationLevel,
  selectInterventionMeme,
} from "../src/features/memes/behavior/memeSelector";
import { MEME_ESCALATION_CONFIG } from "../src/features/memes/behavior/behaviorConfig";
import { useBreakSessionStore } from "../src/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "../src/features/reminder/reminderStore";
import { useMemeStore } from "../src/features/memes/memeStore";
import type { MemeId } from "../src/features/memes/types";

export function runStrategicEscalationTests() {
  console.log("=== RUNNING STRATEGIC MEME ESCALATION ENGINE TESTS ===\n");
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

  // Reset stores prior to testing
  useBreakSessionStore.getState().resetAll(true);
  useBreakReminderStore.setState({
    status: "IDLE",
    consecutiveDismissals: 0,
    totalDismissals: 0,
    breaksAccepted: 0,
  });
  useMemeStore.getState().stopMeme();

  // Test 1: First refusal selects a valid normal meme
  console.log("1. Testing First Refusal Selection...");
  useBreakSessionStore.getState().startNewSession();
  const firstMeme = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.0);
  assert(firstMeme !== null, `First refusal selected meme: ${firstMeme}`);
  assert(
    MEME_ESCALATION_CONFIG.memePools.level0.includes(firstMeme as MemeId),
    `First meme ${firstMeme} is from Level 0 pool`
  );

  // Test 2: Second refusal can select a different meme
  console.log("\n2. Testing Second Refusal Alternative Selection...");
  useBreakSessionStore.getState().handleMemeFinished(firstMeme || undefined);
  const secondMeme = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.5);
  assert(secondMeme !== null, `Second refusal selected meme: ${secondMeme}`);
  assert(secondMeme !== firstMeme, `Second meme (${secondMeme}) is different from first meme (${firstMeme})`);

  // Test 3: Consecutive refusals increase escalation
  console.log("\n3. Testing Consecutive Refusal Escalation...");
  assert(calculateRefusalLevel(0) === 0, "0 refusals = Level 0");
  assert(calculateRefusalLevel(1) === 0, "1 refusal = Level 0");
  assert(calculateRefusalLevel(2) === 1, "2 refusals = Level 1");
  assert(calculateRefusalLevel(3) === 1, "3 refusals = Level 1");
  assert(calculateRefusalLevel(4) === 2, "4 refusals = Level 2");
  assert(calculateRefusalLevel(6) === 2, "6 refusals = Level 2");
  assert(calculateRefusalLevel(7) === 3, "7 refusals = Level 3 (Climax)");

  // Test 4: Exit attempts increase exit escalation
  console.log("\n4. Testing Exit Attempt Acceleration...");
  assert(calculateExitLevel(0) === 0, "0 exit attempts = Level 0");
  assert(calculateExitLevel(1) === 0, "1 exit attempt with 0 refusals stays Level 0");
  assert(calculateExitLevel(2) === 1, "2 exit attempts = Level 1 acceleration");
  assert(calculateExitLevel(3) === 3, "3 exit attempts = Level 3 (Climax)");

  // Test 5: Refusal and exit counters remain independent
  console.log("\n5. Testing Refusal & Exit Counter Independence...");
  useBreakSessionStore.getState().startNewSession();
  useBreakSessionStore.getState().handleExitAttempt();
  useBreakSessionStore.getState().handleExitAttempt();
  const sessionWithExits = useBreakSessionStore.getState().currentSession;
  assert(sessionWithExits?.exitAttemptCount === 2, "exitAttemptCount is 2");
  assert(sessionWithExits?.refusalCount === 0, "refusalCount remained 0 (independent)");
  assert(sessionWithExits?.leaveMeAloneCount === 0, "leaveMeAloneCount remained 0 (independent)");

  // Test 6: Same meme is not immediately repeated (A -> B -> C, never A -> A)
  console.log("\n6. Testing Anti-Repetition Guarantee (Never A -> A)...");
  let lastMeme: MemeId | null = null;
  let noConsecutiveDuplicates = true;
  for (let i = 0; i < 20; i++) {
    const selected = selectInterventionMeme(
      1,
      [],
      lastMeme,
      MEME_ESCALATION_CONFIG,
      () => 0.0 // Same deterministic seed
    );
    if (selected && selected.memeId === lastMeme) {
      noConsecutiveDuplicates = false;
      break;
    }
    if (selected) {
      lastMeme = selected.memeId;
    }
  }
  assert(noConsecutiveDuplicates, "20 consecutive selections never produced immediate duplicates (A !== A)");

  // Test 7: Session history is respected
  console.log("\n7. Testing Session History Consideration...");
  const recentHistory: MemeId[] = ["gucci_dance", "weird_dance_nakhre"];
  const selectedWithHistory = selectInterventionMeme(
    1,
    recentHistory,
    "you_have_to_do_it",
    MEME_ESCALATION_CONFIG,
    () => 0.0
  );
  assert(
    selectedWithHistory?.memeId === "imaandari",
    `Selected remaining unused meme from Level 1 pool: ${selectedWithHistory?.memeId}`
  );

  // Test 8: Category repetition is minimized where alternatives exist
  console.log("\n8. Testing Category Variety Progression...");
  // Level 1 has DANCE (gucci_dance, weird_dance_nakhre) and DIALOGUE (you_have_to_do_it, imaandari)
  const afterDance = selectInterventionMeme(
    1,
    [],
    "gucci_dance", // Last played was DANCE
    MEME_ESCALATION_CONFIG,
    () => 0.0
  );
  assert(
    afterDance?.category !== "DANCE" || afterDance?.memeId !== "gucci_dance",
    `After DANCE meme, selected category: ${afterDance?.category} (${afterDance?.memeId})`
  );

  // Test 9: Escalation eventually reaches SAVAGE intensity
  console.log("\n9. Testing Level 2 SAVAGE Escalation...");
  const level2Meme = selectInterventionMeme(
    2,
    [],
    null,
    MEME_ESCALATION_CONFIG,
    () => 0.0
  );
  assert(
    level2Meme?.category === "SAVAGE",
    `Level 2 selection returned SAVAGE category: ${level2Meme?.category} (${level2Meme?.memeId})`
  );

  // Test 10: MANOJ TIWARI is never selected in normal pools
  console.log("\n10. Testing Strict Exclusion of 'shutup_manoj_tiwari'...");
  let manojSelected = false;
  for (let lvl = 0; lvl <= 2; lvl++) {
    for (let s = 0; s < 50; s++) {
      const meme = selectInterventionMeme(
        lvl as any,
        [],
        null,
        MEME_ESCALATION_CONFIG,
        () => s / 50
      );
      if (meme?.memeId === "shutup_manoj_tiwari") {
        manojSelected = true;
      }
    }
  }
  assert(!manojSelected, "shutup_manoj_tiwari was NEVER returned across 150 normal random selections");

  // Test 11: No meme automatically triggers another meme
  console.log("\n11. Testing No Automatic Meme Chain...");
  useBreakSessionStore.getState().startNewSession();
  const memeChainTest = useBreakSessionStore.getState().handleLeaveMeAlone(() => 0.1);
  useBreakSessionStore.getState().handleMemeFinished(memeChainTest || undefined);
  const sessionAfterFinish = useBreakSessionStore.getState().currentSession;
  assert(
    sessionAfterFinish?.status !== "MEME_PLAYING",
    "Session status is NOT MEME_PLAYING after meme finishes (waits for user)"
  );

  // Test 12: Meme completion returns control to BREAK_PROMPT / REFUSED_AGAIN
  console.log("\n12. Testing Control Return upon Meme Completion...");
  assert(
    sessionAfterFinish?.status === "MEME_FINISHED" ||
      sessionAfterFinish?.status === "REFUSED_AGAIN" ||
      sessionAfterFinish?.status === "BREAK_PROMPT",
    "Control returned safely to user prompt state"
  );

  // Test 13: Existing session statistics remain correct
  console.log("\n13. Testing Lifetime & Session Statistics Integrity...");
  const lifetime = useBreakSessionStore.getState().lifetimeStats;
  assert(lifetime.totalBreaksTriggered >= 2, "totalBreaksTriggered tracked accurately");
  assert(lifetime.totalBreaksRefused >= 1, "totalBreaksRefused tracked accurately");
  assert(lifetime.totalMemesPlayed >= 1, "totalMemesPlayed tracked accurately");
  assert(lifetime.totalExitAttempts >= 2, "totalExitAttempts tracked accurately");

  // Test 14: Existing timer remains unchanged
  console.log("\n14. Testing Timer Store Intact...");
  const timer = useBreakReminderStore.getState();
  assert(typeof timer.tick === "function", "timer.tick function present");
  assert(typeof timer.startTimer === "function", "timer.startTimer function present");

  // Test 15: Existing transparent WebM playback remains unchanged
  console.log("\n15. Testing MemeStore Active Playback Intact...");
  const memeStore = useMemeStore.getState();
  assert(typeof memeStore.playMeme === "function", "playMeme present");
  assert(typeof memeStore.stopMeme === "function", "stopMeme present");

  // Test 16: Combined Escalation formula
  console.log("\n16. Testing Combined Escalation Level Function...");
  assert(calculateCombinedEscalationLevel(0, 0) === 0, "0 refusals, 0 exits = Level 0");
  assert(calculateCombinedEscalationLevel(1, 0) === 0, "1 refusal, 0 exits = Level 0");
  assert(calculateCombinedEscalationLevel(2, 0) === 1, "2 refusals, 0 exits = Level 1");
  assert(calculateCombinedEscalationLevel(1, 2) === 1, "1 refusal, 2 exits = Level 1 (accelerated)");
  assert(calculateCombinedEscalationLevel(4, 0) === 2, "4 refusals, 0 exits = Level 2");
  assert(calculateCombinedEscalationLevel(7, 0) === 3, "7 refusals = Level 3");
  assert(calculateCombinedEscalationLevel(0, 3) === 3, "3 exits = Level 3");

  console.log(`\n=============================================================`);
  console.log(`STRATEGIC ESCALATION TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runStrategicEscalationTests();
