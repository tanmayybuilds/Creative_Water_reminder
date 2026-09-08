import { useWaterReminderStore } from "../src/features/waterReminder/waterReminderStore";
import {
  getScreenGeometry,
  calculateTrajectoryPositions,
  computePositionAtTimeline,
  easeInOutCubic,
} from "../src/features/waterReminder/waterReminderPosition";
import { WATER_REMINDER_TIMING } from "../src/features/waterReminder/waterReminderTypes";
import { getMeme } from "../src/features/memes/registry";
import * as fs from "fs";
import * as path from "path";

export function runDesktopWaterReminderTests() {
  console.log("=== RUNNING FINAL DESKTOP WATER REMINDER OVERLAY TESTS ===\n");
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

  function resetState() {
    useWaterReminderStore.setState({
      intervalMinutes: 30,
      isTimerRunning: true,
      startedAt: Date.now(),
      targetEndTime: Date.now() + 30 * 60 * 1000,
      remainingSeconds: 30 * 60,
      phase: "IDLE",
      timelineMs: 0,
      activeMemeId: null,
      interruptionCount: 0,
      isNotificationVisible: false,
      notificationMessage: "💧 DRINK WATER",
      showDebugHUD: false,
      showCenterCrosshair: false,
      totalRemindersTriggered: 0,
      totalRemindersCompleted: 0,
      totalWaterDrunkMl: 0,
    });
  }

  // =============================================
  // Test 1: Timer Starts Correctly
  // =============================================
  console.log("1. Testing Timer Starts Correctly...");
  resetState();
  assert(useWaterReminderStore.getState().isTimerRunning === true, "Timer is running by default");
  assert(useWaterReminderStore.getState().intervalMinutes === 30, "Default interval is 30 minutes");
  assert(useWaterReminderStore.getState().remainingSeconds === 1800, "Initial remaining time is 1800s (30m)");

  // =============================================
  // Test 2: Timer Stops Correctly
  // =============================================
  console.log("\n2. Testing Timer Stops Correctly...");
  useWaterReminderStore.getState().stopTimer();
  assert(useWaterReminderStore.getState().isTimerRunning === false, "stopTimer() sets isTimerRunning to false");
  assert(useWaterReminderStore.getState().targetEndTime === null, "stopTimer() clears targetEndTime");

  useWaterReminderStore.getState().startTimer();
  assert(useWaterReminderStore.getState().isTimerRunning === true, "startTimer() resumes timer");

  // =============================================
  // Test 3: Timer Does Not Duplicate
  // =============================================
  console.log("\n3. Testing Single-Fire Timer Guard...");
  useWaterReminderStore.getState().triggerReminder();
  const firstTriggerCount = useWaterReminderStore.getState().totalRemindersTriggered;
  assert(firstTriggerCount === 1, "First trigger increments totalRemindersTriggered to 1");
  assert(useWaterReminderStore.getState().phase === "ENTERING", "Phase is ENTERING");

  // Concurrent trigger should be ignored
  useWaterReminderStore.getState().triggerReminder();
  assert(
    useWaterReminderStore.getState().totalRemindersTriggered === 1,
    "Duplicate trigger during active reminder is blocked by single-fire guard"
  );

  // =============================================
  // Test 4: Timing Constants Configuration
  // =============================================
  console.log("\n4. Testing Timeline Constants Configuration...");
  assert(WATER_REMINDER_TIMING.TOTAL_DURATION === 15000, "TOTAL_DURATION is exactly 15000ms (15s)");
  assert(WATER_REMINDER_TIMING.ENTRY_DURATION === 7500, "ENTRY_DURATION midpoint is 7500ms (7.5s)");
  assert(WATER_REMINDER_TIMING.EXIT_DURATION === 7500, "EXIT_DURATION is 7500ms (7.5s)");

  // =============================================
  // Test 5: True Physical Screen Center & Traversal Mathematics
  // =============================================
  console.log("\n5. Testing True Physical Screen Center & Continuous Traversal Mathematics...");
  const displays = [
    { name: "1080p Desktop", width: 1920, height: 1080, dpr: 1 },
    { name: "1440p High-DPI", width: 2560, height: 1440, dpr: 1.25 },
    { name: "4K UHD Display", width: 3840, height: 2160, dpr: 2 },
    { name: "Laptop Display", width: 1366, height: 768, dpr: 1 },
  ];

  displays.forEach((d) => {
    const video = { width: 720, height: 720, aspectRatio: 1.0 };
    const screen = { width: d.width, height: d.height, centerX: d.width / 2, centerY: d.height / 2, devicePixelRatio: d.dpr };
    const pos = calculateTrajectoryPositions(screen, video);

    assert(pos.centerX === d.width / 2, `[${d.name}] Center X is exactly ${d.width / 2}px`);
    assert(pos.centerY === d.height / 2, `[${d.name}] Center Y is exactly ${d.height / 2}px`);
    assert(pos.startX > d.width, `[${d.name}] Start X (${pos.startX}px) is fully offscreen past right edge`);
    assert(pos.endX < 0, `[${d.name}] End X (${pos.endX}px) is fully offscreen past left edge`);

    // Verify 0s start at startX
    const at0s = computePositionAtTimeline(0, screen, video);
    assert(at0s.currentX === pos.startX, `[${d.name}] At 0ms, starts at startX (${pos.startX}px)`);

    // Verify 6s to 9s STOP at center of screen
    const at6s = computePositionAtTimeline(6000, screen, video);
    assert(at6s.currentX === pos.centerX, `[${d.name}] At 6000ms, X reaches screen center (${at6s.currentX}px)`);
    assert(at6s.visualCenterErrorPixels === 0, `[${d.name}] At 6000ms, visual center error is 0.00px`);

    const at7s = computePositionAtTimeline(7500, screen, video);
    assert(at7s.currentX === pos.centerX, `[${d.name}] At 7500ms (during center stop), X remains at screen center`);
    assert(at7s.visualCenterErrorPixels === 0, `[${d.name}] At 7500ms, visual center error is 0.00px`);

    const at9s = computePositionAtTimeline(9000, screen, video);
    assert(at9s.currentX === pos.centerX, `[${d.name}] At 9000ms (end of center stop), X remains at screen center`);
    assert(at9s.visualCenterErrorPixels === 0, `[${d.name}] At 9000ms, visual center error is 0.00px`);

    // Verify 15s completion at endX
    const at15s = computePositionAtTimeline(15000, screen, video);
    assert(at15s.currentX === pos.endX, `[${d.name}] At 15000ms, X reaches endX (${at15s.currentX}px)`);
  });

  // =============================================
  // Test 6: First Interruption Triggers ONLY 'you_have_to_do_it'
  // =============================================
  console.log("\n6. Testing 1st Interruption (You Have To Do It)...");
  resetState();
  useWaterReminderStore.getState().triggerReminder();
  assert(useWaterReminderStore.getState().interruptionCount === 0, "Initial interruptionCount is 0");

  useWaterReminderStore.getState().handleUserInterruption();
  let state = useWaterReminderStore.getState();
  assert(state.interruptionCount === 1, "interruptionCount incremented to 1");
  assert(state.phase === "MEME_PLAYING", "Phase transitions to MEME_PLAYING");
  assert(state.activeMemeId === "you_have_to_do_it", "Active meme is STRICTLY 'you_have_to_do_it'");

  // First meme finishes -> returns to reminder sequence
  useWaterReminderStore.getState().handleMemeFinished();
  state = useWaterReminderStore.getState();
  assert(state.phase === "CENTER_HOLD", "After 1st meme finishes, returns cleanly to CENTER_HOLD");
  assert(state.activeMemeId === null, "activeMemeId cleared");
  assert(state.interruptionCount === 1, "interruptionCount remains 1");

  // =============================================
  // Test 7: Second Interruption Triggers ONLY 'whats_wrong_with_you'
  // =============================================
  console.log("\n7. Testing 2nd Interruption (What's Wrong With You)...");
  useWaterReminderStore.getState().handleUserInterruption();
  state = useWaterReminderStore.getState();
  assert(state.interruptionCount === 2, "interruptionCount incremented to 2");
  assert(state.phase === "MEME_PLAYING", "Phase transitions to MEME_PLAYING");
  assert(state.activeMemeId === "whats_wrong_with_you", "Active meme is STRICTLY 'whats_wrong_with_you'");

  // Second meme finishes -> completes reminder sequence
  useWaterReminderStore.getState().handleMemeFinished();
  state = useWaterReminderStore.getState();
  assert(state.phase === "COMPLETED", "After 2nd meme finishes, sequence concludes with COMPLETED");
  assert(state.totalRemindersCompleted === 1, "totalRemindersCompleted incremented to 1");
  assert(state.isTimerRunning === true, "Timer automatically restarts for next 30-min cycle");

  // =============================================
  // Test 8: 3rd+ Clicks Absorbed Safely (No Infinite Loop)
  // =============================================
  console.log("\n8. Testing Interruption Safety (No Infinite Loop)...");
  resetState();
  useWaterReminderStore.getState().triggerReminder();
  useWaterReminderStore.getState().handleUserInterruption(); // 1st
  useWaterReminderStore.getState().handleMemeFinished();
  useWaterReminderStore.getState().handleUserInterruption(); // 2nd
  useWaterReminderStore.getState().handleMemeFinished();
  assert(useWaterReminderStore.getState().totalRemindersCompleted === 1, "Completed 1 reminder");

  // Click after completion while IDLE is absorbed safely
  useWaterReminderStore.getState().handleUserInterruption();
  assert(useWaterReminderStore.getState().activeMemeId === null, "Click while IDLE is absorbed with zero side effects");

  // =============================================
  // Test 9: Zero Interruption Natural Completion
  // =============================================
  console.log("\n9. Testing Natural 15-Second Traversal (Zero Clicks)...");
  resetState();
  useWaterReminderStore.getState().triggerReminder();
  assert(useWaterReminderStore.getState().interruptionCount === 0, "No interruptions");
  useWaterReminderStore.getState().handleSequenceCompleted();
  assert(useWaterReminderStore.getState().totalRemindersCompleted === 1, "Sequence completed naturally");
  assert(useWaterReminderStore.getState().remainingSeconds === 1800, "Timer cleanly reset to 1800s");

  // =============================================
  // Test 10: Repeating Indefinitely
  // =============================================
  console.log("\n10. Testing Continuous Indefinite Cycles...");
  resetState();
  for (let cycle = 1; cycle <= 10; cycle++) {
    useWaterReminderStore.getState().triggerReminder();
    useWaterReminderStore.getState().handleSequenceCompleted();
    assert(
      useWaterReminderStore.getState().totalRemindersCompleted === cycle,
      `Cycle ${cycle} successfully completed and restarted`
    );
    assert(
      useWaterReminderStore.getState().isTimerRunning === true,
      `Cycle ${cycle} timer is running for next reminder`
    );
  }

  // =============================================
  // Test 11: Developer / Content Creation Controls
  // =============================================
  console.log("\n11. Testing Content Creation & Debug Controls...");
  resetState();
  useWaterReminderStore.getState().triggerTestReminder();
  assert(useWaterReminderStore.getState().totalRemindersTriggered >= 1, "triggerTestReminder() triggers immediately");

  useWaterReminderStore.getState().testCenterPosition();
  assert(useWaterReminderStore.getState().phase === "CENTER_HOLD", "testCenterPosition() sets phase to CENTER_HOLD");
  assert(useWaterReminderStore.getState().isNotificationVisible === true, "Notification is visible during center test");

  useWaterReminderStore.getState().toggleCenterCrosshair();
  assert(useWaterReminderStore.getState().showCenterCrosshair === true, "toggleCenterCrosshair() enables HUD crosshair");

  useWaterReminderStore.getState().toggleDebugHUD();
  assert(useWaterReminderStore.getState().showDebugHUD === true, "toggleDebugHUD() enables debug telemetry HUD");

  // =============================================
  // Test 12: Transparent Asset Verification
  // =============================================
  console.log("\n12. Testing Transparent Meme Assets in Registry...");
  assert(getMeme("you_have_to_do_it") !== undefined, "you_have_to_do_it exists in registry");
  assert(getMeme("whats_wrong_with_you") !== undefined, "whats_wrong_with_you exists in registry");
  assert(getMeme("ravi_dance") !== undefined, "ravi_dance exists in registry");

  const danceAsset = path.resolve(process.cwd(), "public/memes/processed/ravi_dance.webm");
  assert(fs.existsSync(danceAsset), "ravi_dance.webm transparent asset exists on disk");

  console.log(`\n=============================================================`);
  console.log(`DESKTOP WATER REMINDER TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runDesktopWaterReminderTests();
