import { useContentStore, CONTENT_SCENARIOS } from "../src/features/content/contentStore";
import { CONTENT_TIMING_PRESETS } from "../src/features/content/contentTimingConfig";
import { useBreakSessionStore } from "../src/features/break/session/breakSessionStore";
import { useBreakReminderStore } from "../src/features/reminder/reminderStore";
import { useBehaviorEngine } from "../src/features/memes/behavior/behaviorEngine";
import { useMemeStore } from "../src/features/memes/memeStore";
import { MEME_ESCALATION_CONFIG } from "../src/features/memes/behavior/behaviorConfig";
import { FINAL_CHOICE_CONFIG } from "../src/features/break/session/finalChoiceConfig";

export async function runContentModeTests() {
  console.log("=== RUNNING CONTENT MODE AUTOMATED TESTS ===\n");
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
    useContentStore.getState().resetScenario();
    useBreakSessionStore.getState().resetAll(true);
    useBreakReminderStore.setState({
      status: "IDLE",
      consecutiveDismissals: 0,
      totalDismissals: 0,
      breaksAccepted: 0,
    });
    useBehaviorEngine.getState().resetBehaviorState();
    useMemeStore.setState({ activeMeme: null });
  }

  resetAll();

  // Test 1: Content Mode can trigger a break
  console.log("1. Testing Content Mode Trigger Break...");
  useContentStore.getState().triggerBreak();
  assert(
    useBreakReminderStore.getState().status === "BREAK_TRIGGERED",
    "useContentStore.triggerBreak() sets reminder status to BREAK_TRIGGERED"
  );
  assert(
    useBreakSessionStore.getState().currentSession?.status === "BREAK_PROMPT",
    "useContentStore.triggerBreak() transitions BreakSession to BREAK_PROMPT"
  );

  // Test 2: Content Mode uses real break session actions
  console.log("\n2. Testing Real Break Session Action Integration...");
  const initialBreaksTriggered = useBreakSessionStore.getState().lifetimeStats.totalBreaksTriggered;
  assert(initialBreaksTriggered >= 1, "Break Session records real lifetime metrics from Content Mode actions");

  // Test 3: Content Mode can trigger refusal (LEAVE ME ALONE)
  console.log("\n3. Testing Content Mode Refusal Trigger...");
  useContentStore.getState().leaveMeAlone();
  const sessionAfterRefusal = useBreakSessionStore.getState().currentSession;
  assert(sessionAfterRefusal?.refusalCount === 1, "Refusal count incremented to 1 using real handleLeaveMeAlone");
  assert(
    sessionAfterRefusal?.status === "MEME_PLAYING" || sessionAfterRefusal?.status === "REFUSED",
    "Session status updated using real state machine"
  );

  // Clean active meme
  useBreakSessionStore.getState().handleMemeFinished(sessionAfterRefusal?.lastMemeId || undefined);
  await new Promise((r) => setTimeout(r, 150));

  // Test 4: Content Mode can trigger exit attempt
  console.log("\n4. Testing Content Mode Exit Attempt Trigger...");
  useContentStore.getState().attemptExit();
  const sessionAfterExit = useBreakSessionStore.getState().currentSession;
  assert(sessionAfterExit?.exitAttemptCount === 1, "Exit count incremented to 1 using real handleExitAttempt");

  useBreakSessionStore.getState().handleMemeFinished(sessionAfterExit?.lastMemeId || undefined);
  await new Promise((r) => setTimeout(r, 150));

  // Test 5: Content Mode can reach finale
  console.log("\n5. Testing Content Mode Force Finale...");
  useContentStore.getState().forceFinale();
  const sessionFinale = useBreakSessionStore.getState().currentSession;
  assert(
    sessionFinale?.status === "FINAL_CHOICE",
    "forceFinale transitions session directly to FINAL_CHOICE"
  );
  assert(
    sessionFinale?.finalChoiceAttempted === true,
    "finalChoiceAttempted set to true"
  );

  // Test 6, 7 & 8: Full Demo Scenario Execution
  console.log("\n6, 7 & 8. Testing Scenario Automation & Concurrency Isolation...");
  resetAll();
  useContentStore.getState().setTimingPreset("FAST");

  // Run FAST scenario test asynchronously
  const scenarioPromise = useContentStore.getState().runScenario("POV_30_MINUTES");
  assert(useContentStore.getState().isRunningScenario === true, "Scenario marked as running");

  // Await completion
  await scenarioPromise;
  assert(useContentStore.getState().isRunningScenario === false, "Scenario successfully completes");
  assert(
    useBreakSessionStore.getState().currentSession?.status === "FINISHED",
    "Scenario cleanly concludes with session in FINISHED state"
  );

  // Test 9 & 10: Reset Scenario behavior
  console.log("\n9 & 10. Testing Scenario Reset & Clean State...");
  useContentStore.getState().triggerBreak();
  useContentStore.getState().leaveMeAlone();
  assert(useMemeStore.getState().activeMeme !== null || useBreakSessionStore.getState().currentSession?.status === "MEME_PLAYING", "Meme is active before reset");

  useContentStore.getState().resetScenario();
  assert(useMemeStore.getState().activeMeme === null, "resetScenario() stops active meme");
  assert(useBreakSessionStore.getState().currentSession === null, "resetScenario() clears current session to null");
  assert(useBreakReminderStore.getState().status === "IDLE", "resetScenario() sets reminder status to IDLE");

  // Test 11: Lifetime Statistics Preservation
  console.log("\n11. Testing Lifetime Statistics Non-Destructive Reset...");
  // Simulate accepted break
  useBreakSessionStore.getState().handleTakeABreak();
  const statsBefore = { ...useBreakSessionStore.getState().lifetimeStats };
  assert(statsBefore.totalBreaksAccepted >= 1, "Lifetime stats record accepted break");

  useContentStore.getState().resetScenario();
  const statsAfter = { ...useBreakSessionStore.getState().lifetimeStats };
  assert(
    statsAfter.totalBreaksAccepted === statsBefore.totalBreaksAccepted,
    "resetScenario() does NOT wipe lifetime statistics"
  );

  // Test 12: Recording Mode Toggle
  console.log("\n12. Testing Recording Mode Toggle...");
  useContentStore.getState().setRecordingMode(true);
  assert(useContentStore.getState().isRecordingMode === true, "Recording Mode can be enabled");
  useContentStore.getState().setRecordingMode(false);
  assert(useContentStore.getState().isRecordingMode === false, "Recording Mode can be disabled");

  // Test 13: Content Mode Timing Presets Exist & Are Configured
  console.log("\n13. Testing Content Timing Presets...");
  assert(CONTENT_TIMING_PRESETS.FAST.betweenActionsMs === 500, "FAST timing preset configured");
  assert(CONTENT_TIMING_PRESETS.NORMAL.betweenActionsMs === 1000, "NORMAL timing preset configured");
  assert(CONTENT_TIMING_PRESETS.CINEMATIC.betweenActionsMs === 1800, "CINEMATIC timing preset configured");

  // Test 14: All 4 Required Content Scenarios Exist
  console.log("\n14. Testing Required Content Scenarios...");
  assert(CONTENT_SCENARIOS.POV_30_MINUTES !== undefined, "POV: 30 minutes of work scenario exists");
  assert(CONTENT_SCENARIOS.TRYING_TO_CLOSE !== undefined, "TRYING TO CLOSE LOCKIN scenario exists");
  assert(CONTENT_SCENARIOS.FIVE_MORE_MINUTES !== undefined, "I JUST WANT 5 MORE MINUTES scenario exists");
  assert(CONTENT_SCENARIOS.FULL_CHAOS !== undefined, "FULL CHAOS scenario exists");

  // Test 15: Reserved Manoj Tiwari Asset Protection
  console.log("\n15. Testing Reserved Asset Restrictions...");
  assert(MEME_ESCALATION_CONFIG.reservedAssets.includes("shutup_manoj_tiwari"), "shutup_manoj_tiwari is reserved");
  assert(FINAL_CHOICE_CONFIG.wrongAnswerMemeId === "shutup_manoj_tiwari", "shutup_manoj_tiwari used only in finale");

  // Test 16: Non-trapping safety
  console.log("\n16. Testing Clean Finale Resolution...");
  resetAll();
  useContentStore.getState().triggerBreak();
  useContentStore.getState().forceFinale();
  useContentStore.getState().chooseFinalOption(FINAL_CHOICE_CONFIG.correctOption);
  useBreakSessionStore.getState().handleTakeABreak();
  assert(
    useBreakSessionStore.getState().currentSession?.status === "FINISHED",
    "Final choice resolves to FINISHED without infinite loops"
  );

  console.log(`\n=============================================================`);
  console.log(`CONTENT MODE TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

(async () => {
  await runContentModeTests();
})();
