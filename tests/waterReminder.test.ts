import { useWaterStore } from "../src/features/water/waterStore";
import { calculateCharacterCenter, CHARACTER_CENTER_CALIBRATIONS } from "../src/features/water/waterCenterCalibration";
import { getMeme } from "../src/features/memes/registry";

export function runWaterReminderTests() {
  console.log("=== RUNNING WATER REMINDER MODE AUTOMATED TESTS ===\n");
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
    useWaterStore.setState({
      status: "WAITING",
      intervalMinutes: 30,
      startedAt: Date.now(),
      targetEndTime: Date.now() + 30 * 60 * 1000,
      remainingSeconds: 30 * 60,
      interactionCount: 0,
      activeMemeId: null,
      isNotificationVisible: false,
      notificationMessage: "💧 DRINK WATER",
      totalRemindersTriggered: 0,
      totalRemindersCompleted: 0,
      totalWaterDrunk: 0,
      totalInteractions: 0,
    });
  }

  // =============================================
  // Test 1: Timer triggers reminder
  // =============================================
  console.log("1. Testing Timer Triggers Reminder...");
  resetState();
  assert(useWaterStore.getState().status === "WAITING", "Initial status is WAITING");
  assert(useWaterStore.getState().intervalMinutes === 30, "Default interval is 30 minutes");

  useWaterStore.getState().triggerReminder();
  let state = useWaterStore.getState();
  assert(state.status === "REMINDER_ACTIVE", "triggerReminder() sets status to REMINDER_ACTIVE");
  assert(state.activeMemeId === "ravi_dance", "Ravi dance asset is activated");
  assert(state.totalRemindersTriggered === 1, "totalRemindersTriggered incremented to 1");

  // =============================================
  // Test 2: Recurring timer restarts upon completion
  // =============================================
  console.log("\n2. Testing Recurring Timer Restarts Upon Completion...");
  useWaterStore.getState().handleRaviSequenceCompleted();
  state = useWaterStore.getState();
  assert(state.status === "WAITING", "After completion, status returns to WAITING");
  assert(state.remainingSeconds === 30 * 60, "Timer resets to full 30-minute interval (1800s)");
  assert(state.totalRemindersCompleted === 1, "totalRemindersCompleted incremented to 1");
  assert(state.activeMemeId === null, "activeMemeId is cleared on completion");

  // =============================================
  // Test 3: Mathematical Visual Center Mapping Across Viewports
  // =============================================
  console.log("\n3. Testing Mathematical Visual Center Mapping...");
  const viewports = [
    { name: "1080p Desktop", width: 1920, height: 1080 },
    { name: "1440p Monitor", width: 2560, height: 1440 },
    { name: "4K Display", width: 3840, height: 2160 },
    { name: "Laptop Display", width: 1366, height: 768 },
  ];

  viewports.forEach((vp) => {
    const calc = calculateCharacterCenter(
      "gucci_dance",
      vp,
      { width: vp.width * 0.4, height: vp.height * 0.7 }
    );
    assert(
      calc.screenCenterX === vp.width / 2,
      `[${vp.name}] screenCenterX calculated exactly: ${calc.screenCenterX}px`
    );
    assert(
      calc.screenCenterY === vp.height / 2,
      `[${vp.name}] screenCenterY calculated exactly: ${calc.screenCenterY}px`
    );
    assert(
      calc.visualCenterErrorPixels < 0.01,
      `[${vp.name}] Zero visual center error (character visual center = screen center)`
    );
  });

  // =============================================
  // Test 4: Notification appears and disappears
  // =============================================
  console.log("\n4. Testing Drink Water Notification Bubble...");
  resetState();
  useWaterStore.getState().triggerReminder();
  assert(useWaterStore.getState().isNotificationVisible === false, "Notification initially hidden while entering");

  useWaterStore.getState().showNotification();
  assert(useWaterStore.getState().isNotificationVisible === true, "showNotification() makes bubble visible");
  assert(useWaterStore.getState().notificationMessage === "💧 DRINK WATER", "Notification message is '💧 DRINK WATER'");

  useWaterStore.getState().hideNotification();
  assert(useWaterStore.getState().isNotificationVisible === false, "hideNotification() hides bubble smoothly");

  // =============================================
  // Test 5: 1st User Interaction triggers "You Have To Do It"
  // =============================================
  console.log("\n5. Testing 1st Interaction (You Have To Do It)...");
  resetState();
  useWaterStore.getState().triggerReminder();
  assert(useWaterStore.getState().interactionCount === 0, "Initial interactionCount is 0");

  useWaterStore.getState().handleUserInteraction();
  state = useWaterStore.getState();
  assert(state.interactionCount === 1, "interactionCount incremented to 1");
  assert(state.status === "MEME_PLAYING", "status transitions to MEME_PLAYING");
  assert(state.activeMemeId === "you_have_to_do_it", "Active meme is 'you_have_to_do_it'");
  assert(state.totalInteractions === 1, "totalInteractions incremented to 1");

  // =============================================
  // Test 6: 1st Meme completion returns to reminder without auto-chaining
  // =============================================
  console.log("\n6. Testing No Automatic Meme Chaining After 1st Meme...");
  useWaterStore.getState().handleMemeFinished();
  state = useWaterStore.getState();
  assert(state.status === "REMINDER_ACTIVE", "After 1st meme, returns to REMINDER_ACTIVE");
  assert(state.activeMemeId === "ravi_dance", "Returns to Ravi dance reminder");
  assert(state.interactionCount === 1, "interactionCount remains 1 (waiting for next user action)");

  // =============================================
  // Test 7: 2nd User Interaction triggers "What's Wrong With You"
  // =============================================
  console.log("\n7. Testing 2nd Interaction (What's Wrong With You)...");
  useWaterStore.getState().handleUserInteraction();
  state = useWaterStore.getState();
  assert(state.interactionCount === 2, "interactionCount incremented to 2");
  assert(state.status === "MEME_PLAYING", "status transitions to MEME_PLAYING");
  assert(state.activeMemeId === "whats_wrong_with_you", "Active meme is 'whats_wrong_with_you'");
  assert(state.totalInteractions === 2, "totalInteractions incremented to 2");

  // =============================================
  // Test 8: 2nd Meme completion finishes the reminder sequence
  // =============================================
  console.log("\n8. Testing 2nd Meme Completion Finishes Reminder...");
  useWaterStore.getState().handleMemeFinished();
  state = useWaterStore.getState();
  assert(state.status === "WAITING", "After 2nd meme, sequence concludes and timer restarts (WAITING)");
  assert(state.totalRemindersCompleted === 1, "totalRemindersCompleted incremented to 1");

  // =============================================
  // Test 9: 3rd+ interaction absorbed safely (No infinite loop)
  // =============================================
  console.log("\n9. Testing Interaction Safety & No Infinite Loop...");
  resetState();
  useWaterStore.getState().triggerReminder();
  useWaterStore.getState().handleUserInteraction(); // 1st click
  assert(useWaterStore.getState().interactionCount === 1, "1st interaction count is 1");
  useWaterStore.getState().handleMemeFinished(); // returns to REMINDER_ACTIVE

  useWaterStore.getState().handleUserInteraction(); // 2nd click
  assert(useWaterStore.getState().interactionCount === 2, "2nd interaction count is 2");
  useWaterStore.getState().handleMemeFinished(); // completes sequence, restarts timer

  useWaterStore.getState().handleUserInteraction(); // click while WAITING (absorbed)
  assert(useWaterStore.getState().status === "WAITING", "Click while WAITING absorbed without spawning memes");

  // =============================================
  // Test 10: No user interaction completes reminder naturally
  // =============================================
  console.log("\n10. Testing Pure Ravi Reminder Without Interaction...");
  resetState();
  useWaterStore.getState().triggerReminder();
  assert(useWaterStore.getState().activeMemeId === "ravi_dance", "Ravi dances across desktop");
  assert(useWaterStore.getState().interactionCount === 0, "No memes triggered");

  useWaterStore.getState().handleRaviSequenceCompleted();
  assert(useWaterStore.getState().status === "WAITING", "Naturally restarts timer after passing through");

  // =============================================
  // Test 11: Developer Testing Controls
  // =============================================
  console.log("\n11. Testing Developer Controls...");
  resetState();
  useWaterStore.getState().testReminderNow();
  assert(useWaterStore.getState().status === "REMINDER_ACTIVE", "testReminderNow() triggers reminder immediately");

  useWaterStore.getState().playMeme1();
  assert(useWaterStore.getState().activeMemeId === "you_have_to_do_it", "playMeme1() plays You Have To Do It");

  useWaterStore.getState().playMeme2();
  assert(useWaterStore.getState().activeMemeId === "whats_wrong_with_you", "playMeme2() plays What's Wrong With You");

  useWaterStore.getState().resetWaterTimer();
  assert(useWaterStore.getState().status === "WAITING", "resetWaterTimer() resets to clean WAITING state");

  // =============================================
  // Test 12: Interval Customization (15m, 20m, 30m, 45m, 60m)
  // =============================================
  console.log("\n12. Testing Configurable Intervals...");
  useWaterStore.getState().setIntervalMinutes(45);
  assert(useWaterStore.getState().intervalMinutes === 45, "Interval updated to 45 minutes");
  assert(useWaterStore.getState().remainingSeconds === 45 * 60, "Remaining seconds updated to 2700s");

  useWaterStore.getState().setIntervalMinutes(15);
  assert(useWaterStore.getState().intervalMinutes === 15, "Interval updated to 15 minutes");

  // =============================================
  // Test 13: Water Intake Tracker
  // =============================================
  console.log("\n13. Testing Water Intake Tracker...");
  resetState();
  assert(useWaterStore.getState().totalWaterDrunk === 0, "Initial water drunk is 0 ml");
  useWaterStore.getState().recordWaterDrunk(250);
  assert(useWaterStore.getState().totalWaterDrunk === 250, "recordWaterDrunk(250) records 250 ml");
  useWaterStore.getState().recordWaterDrunk(250);
  assert(useWaterStore.getState().totalWaterDrunk === 500, "2nd drink records 500 ml total");

  // =============================================
  // Test 14: Indefinite Recurring Repetition
  // =============================================
  console.log("\n14. Testing Indefinite Continuous Cycles...");
  resetState();
  for (let cycle = 1; cycle <= 5; cycle++) {
    useWaterStore.getState().triggerReminder();
    useWaterStore.getState().showNotification();
    useWaterStore.getState().hideNotification();
    useWaterStore.getState().handleRaviSequenceCompleted();
    assert(
      useWaterStore.getState().totalRemindersCompleted === cycle,
      `Cycle ${cycle} completed and timer seamlessly restarted`
    );
    assert(useWaterStore.getState().status === "WAITING", `Cycle ${cycle} is in WAITING state for next interval`);
  }

  // =============================================
  // Test 15: Character Calibrations & Dedicated Looping Asset Verification
  // =============================================
  console.log("\n15. Testing Character Asset Registry & Dedicated ravi_dance.webm Asset...");
  assert(getMeme("ravi_dance") !== undefined, "ravi_dance exists in registry");
  assert(getMeme("gucci_dance") !== undefined, "gucci_dance exists in registry");
  assert(getMeme("you_have_to_do_it") !== undefined, "you_have_to_do_it exists in registry");
  assert(getMeme("whats_wrong_with_you") !== undefined, "whats_wrong_with_you exists in registry");
  assert(CHARACTER_CENTER_CALIBRATIONS.ravi_dance !== undefined, "ravi_dance calibration exists");
  assert(CHARACTER_CENTER_CALIBRATIONS.gucci_dance !== undefined, "gucci_dance calibration exists");

  console.log(`\n=============================================================`);
  console.log(`WATER REMINDER TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runWaterReminderTests();
