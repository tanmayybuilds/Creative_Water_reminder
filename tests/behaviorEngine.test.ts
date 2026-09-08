import { useBehaviorEngine } from "../src/features/memes/behavior/behaviorEngine";
import { DEFAULT_BEHAVIOR_CONFIG } from "../src/features/memes/behavior/behaviorConfig";
import {
  calculateEscalationLevel,
  selectInterventionMeme,
} from "../src/features/memes/behavior/memeSelector";
import { BEHAVIOR_FIXTURES } from "../src/features/memes/fixtures";
import { useMemeStore } from "../src/features/memes/memeStore";
import type { MemeId } from "../src/features/memes/types";

export function runBehaviorEngineTests() {
  console.log("=== RUNNING MEME BEHAVIOR ENGINE TESTS ===\n");
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

  const engine = useBehaviorEngine.getState();
  engine.resetBehaviorState();

  // 1. Initial State
  console.log("1. Testing Fresh User Initial State...");
  const initialState = useBehaviorEngine.getState();
  assert(initialState.consecutiveDismissals === 0, "Initial consecutiveDismissals is 0");
  assert(initialState.totalDismissals === 0, "Initial totalDismissals is 0");
  assert(initialState.breaksAccepted === 0, "Initial breaksAccepted is 0");
  assert(initialState.exitAttempts === 0, "Initial exitAttempts is 0");
  assert(initialState.currentEscalationLevel === 0, "Initial escalation level is Level 0");
  assert(initialState.recentMemes.length === 0, "Initial recent history is empty");
  assert(initialState.paisaYaPehchaanShown === false, "paisaYaPehchaanShown is false");

  // 2. First Dismissal
  console.log("\n2. Testing First Dismissal (Level 0)...");
  // Inject deterministic random source (returns index 0)
  const deterministicZero = () => 0;
  const firstIntervention = useBehaviorEngine.getState().handleLeaveMeAlone(deterministicZero);
  const state1 = useBehaviorEngine.getState();
  assert(state1.consecutiveDismissals === 1, "consecutiveDismissals incremented to 1");
  assert(state1.totalDismissals === 1, "totalDismissals incremented to 1");
  assert(state1.currentEscalationLevel === 0, "Escalation level is Level 0");
  assert(firstIntervention !== null, "First intervention returned a meme");
  assert(
    DEFAULT_BEHAVIOR_CONFIG.memePools.level0.includes(firstIntervention!.memeId),
    `Meme '${firstIntervention?.memeId}' was selected from Level 0 pool`
  );
  assert(state1.recentMemes.includes(firstIntervention!.memeId), "Selected meme recorded in recent history");
  assert(useMemeStore.getState().activeMeme?.meme.id === firstIntervention!.memeId, "Meme Player triggered via abstraction");

  // 3. Repeated Dismissals Escalation (Level 0 -> Level 1 -> Level 2 -> Level 3)
  console.log("\n3. Testing Escalation Thresholds...");
  // Dismissal 2 -> Level 1
  const int2 = useBehaviorEngine.getState().handleLeaveMeAlone(deterministicZero);
  assert(useBehaviorEngine.getState().consecutiveDismissals === 2, "consecutiveDismissals is 2");
  assert(useBehaviorEngine.getState().currentEscalationLevel === 1, "Escalation moved to Level 1");
  assert(
    DEFAULT_BEHAVIOR_CONFIG.memePools.level1.includes(int2!.memeId),
    `Meme '${int2?.memeId}' was selected from Level 1 pool`
  );

  // Dismissal 3 -> Level 1
  useBehaviorEngine.getState().handleLeaveMeAlone(deterministicZero);
  assert(useBehaviorEngine.getState().currentEscalationLevel === 1, "Dismissal 3 stays in Level 1");

  // Dismissal 4 -> Level 2
  const int4 = useBehaviorEngine.getState().handleLeaveMeAlone(deterministicZero);
  assert(useBehaviorEngine.getState().consecutiveDismissals === 4, "consecutiveDismissals is 4");
  assert(useBehaviorEngine.getState().currentEscalationLevel === 2, "Dismissal 4 escalates to Level 2");
  assert(
    DEFAULT_BEHAVIOR_CONFIG.memePools.level2.includes(int4!.memeId),
    `Meme '${int4?.memeId}' was selected from Level 2 pool`
  );

  // Dismissal 5 & 6 -> Level 2
  useBehaviorEngine.getState().handleLeaveMeAlone(deterministicZero);
  useBehaviorEngine.getState().handleLeaveMeAlone(deterministicZero);
  assert(useBehaviorEngine.getState().consecutiveDismissals === 6, "consecutiveDismissals is 6");
  assert(useBehaviorEngine.getState().currentEscalationLevel === 2, "Dismissal 6 stays in Level 2");

  // Dismissal 7 -> Level 3 (Paisa Ya Pehchaan)
  const int7 = useBehaviorEngine.getState().handleLeaveMeAlone(deterministicZero);
  assert(useBehaviorEngine.getState().consecutiveDismissals === 7, "consecutiveDismissals is 7");
  assert(useBehaviorEngine.getState().currentEscalationLevel === 3, "Dismissal 7 escalates to Level 3");
  assert(int7 === null, "Level 3 returns null (transitions to Paisa Ya Pehchaan instead of random meme)");
  assert(useBehaviorEngine.getState().paisaYaPehchaanShown === true, "paisaYaPehchaanShown set to true");

  // 4. Break Acceptance Reset Test
  console.log("\n4. Testing Break Acceptance Reset...");
  useBehaviorEngine.getState().handleTakeABreak();
  const acceptedState = useBehaviorEngine.getState();
  assert(acceptedState.consecutiveDismissals === 0, "consecutiveDismissals reset to 0 upon accepting break");
  assert(acceptedState.breaksAccepted === 1, "breaksAccepted incremented to 1");
  assert(acceptedState.totalDismissals === 7, "totalDismissals preserved across breaks (total: 7)");
  assert(acceptedState.currentEscalationLevel === 0, "Escalation level reset to Level 0");
  assert(acceptedState.paisaYaPehchaanShown === false, "paisaYaPehchaanShown reset to false");
  assert(useMemeStore.getState().activeMeme === null || useMemeStore.getState().activeMeme?.stage === "exiting", "Active meme stopped upon break accept");

  // 5. Anti-Repetition & Controlled Random Selection
  console.log("\n5. Testing Controlled Randomness & Anti-Repetition...");
  const pool0 = DEFAULT_BEHAVIOR_CONFIG.memePools.level0;
  // Test that lastMemePlayed is never chosen if other candidates exist
  const lastMeme: MemeId = "thinking_ravi";
  const selected1 = selectInterventionMeme(0, [], lastMeme, DEFAULT_BEHAVIOR_CONFIG, deterministicZero);
  assert(selected1 !== null && selected1.memeId !== lastMeme, `Meme selection excluded last meme '${lastMeme}' (selected '${selected1?.memeId}')`);

  // Test recent history exclusion
  const history: MemeId[] = ["thinking_ravi", "flex_look"];
  const selected2 = selectInterventionMeme(0, history, "flex_look", DEFAULT_BEHAVIOR_CONFIG, deterministicZero);
  assert(
    selected2?.memeId === "money_follows_my_brother",
    `Meme selection excluded recent history [${history.join(", ")}] and picked remaining 'money_follows_my_brother'`
  );

  // Test history relaxation when pool is exhausted
  const fullHistory: MemeId[] = ["thinking_ravi", "flex_look", "money_follows_my_brother"];
  const selectedRelaxed = selectInterventionMeme(0, fullHistory, "money_follows_my_brother", DEFAULT_BEHAVIOR_CONFIG, deterministicZero);
  assert(
    selectedRelaxed !== null && selectedRelaxed.memeId !== "money_follows_my_brother",
    `History relaxed when exhausted, picking a non-consecutive candidate '${selectedRelaxed?.memeId}'`
  );

  // 6. Manoj Tiwari Special Finalization Rule
  console.log("\n6. Testing shutup_manoj_tiwari Exclusion & Dedicated Trigger...");
  for (let lvl = 0; lvl <= 2; lvl++) {
    for (let r = 0; r < 10; r++) {
      const meme = selectInterventionMeme(lvl as 0 | 1 | 2, [], null, DEFAULT_BEHAVIOR_CONFIG, () => r / 10);
      assert(
        meme?.memeId !== "shutup_manoj_tiwari",
        `shutup_manoj_tiwari never selected in Level ${lvl} normal selection`
      );
    }
  }

  // Test dedicated trigger
  useBehaviorEngine.getState().triggerManojFinale();
  assert(useBehaviorEngine.getState().finalExitStage === 1, "triggerManojFinale sets finalExitStage = 1");
  assert(useMemeStore.getState().activeMeme?.meme.id === "shutup_manoj_tiwari", "triggerManojFinale plays shutup_manoj_tiwari");

  // 7. Exit Attempts Tracking & Acceleration
  console.log("\n7. Testing Exit Attempts Tracking...");
  useBehaviorEngine.getState().resetBehaviorState();
  useBehaviorEngine.getState().handleExitAttempt();
  assert(useBehaviorEngine.getState().exitAttempts === 1, "exitAttempts incremented to 1");
  assert(useBehaviorEngine.getState().currentEscalationLevel === 0, "1 exit attempt with 0 dismissals is Level 0");

  useBehaviorEngine.getState().handleExitAttempt();
  useBehaviorEngine.getState().handleExitAttempt(); // 3rd exit attempt
  assert(useBehaviorEngine.getState().exitAttempts === 3, "exitAttempts is 3");
  assert(useBehaviorEngine.getState().currentEscalationLevel === 3, "3 exit attempts accelerates to Level 3");
  assert(useBehaviorEngine.getState().paisaYaPehchaanShown === true, "paisaYaPehchaanShown is true on 3rd exit attempt");

  // 8. Testing All 8 Test Fixtures
  console.log("\n8. Testing Behavior Test Fixtures Compatibility...");
  const fixtures = [
    { key: "fresh_user", expectedLevel: 0 },
    { key: "first_dismissal", expectedLevel: 0 },
    { key: "light_repeated_dismissal", expectedLevel: 1 },
    { key: "medium_repeated_dismissal", expectedLevel: 2 },
    { key: "heavy_repeated_dismissal", expectedLevel: 2 },
    { key: "accepted_break_after_dismissals", expectedLevel: 0 },
    { key: "repeated_exit_attempts", expectedLevel: 3 },
    { key: "final_exit_attempt", expectedLevel: 3 },
  ];

  for (const item of fixtures) {
    const f = BEHAVIOR_FIXTURES[item.key];
    useBehaviorEngine.getState().loadFixture(f);
    const lvl = useBehaviorEngine.getState().currentEscalationLevel;
    assert(lvl === item.expectedLevel, `Fixture '${f.name}' loaded with expected Level ${item.expectedLevel} (actual: Level ${lvl})`);
  }

  // Cleanup
  useBehaviorEngine.getState().resetBehaviorState();

  console.log(`\n========================================`);
  console.log(`BEHAVIOR ENGINE TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBehaviorEngineTests();
