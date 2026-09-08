import { useRaviPrototypeStore } from "../src/features/prototype/raviPrototypeStore";
import { calculateCharacterCenter } from "../src/features/water/waterCenterCalibration";
import * as fs from "fs";
import * as path from "path";

export function runRaviPrototypeTests() {
  console.log("=== RUNNING RAVI TRANSPARENT MOVEMENT PROTOTYPE TESTS ===\n");
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
    useRaviPrototypeStore.setState({
      phase: "IDLE",
      speedPreset: "NORMAL",
      entranceDuration: 2.5,
      pauseDuration: 4.0,
      exitDuration: 2.5,
      scale: 1.0,
      volume: 0.8,
      isMuted: false,
      showCenterCrosshair: false,
      showNotification: true,
      notificationText: "💧 DRINK WATER",
      playCount: 0,
    });
  }

  // =============================================
  // Test 1: Initial Prototype State
  // =============================================
  console.log("1. Testing Initial Prototype State...");
  resetState();
  assert(useRaviPrototypeStore.getState().phase === "IDLE", "Initial phase is IDLE");
  assert(useRaviPrototypeStore.getState().speedPreset === "NORMAL", "Default speed preset is NORMAL");
  assert(useRaviPrototypeStore.getState().entranceDuration === 2.5, "Default entrance duration is 2.5s");
  assert(useRaviPrototypeStore.getState().pauseDuration === 4.0, "Default center pause duration is 4.0s");
  assert(useRaviPrototypeStore.getState().exitDuration === 2.5, "Default exit duration is 2.5s");

  // =============================================
  // Test 2: Play Trigger & Sequence Transitions
  // =============================================
  console.log("\n2. Testing Movement Sequence Phases (Right ➔ Center ➔ Left)...");
  useRaviPrototypeStore.getState().play();
  assert(useRaviPrototypeStore.getState().phase === "ENTERING", "play() transitions to ENTERING phase");
  assert(useRaviPrototypeStore.getState().playCount === 1, "playCount incremented to 1");

  useRaviPrototypeStore.getState().setPhase("PAUSED_AT_CENTER");
  assert(useRaviPrototypeStore.getState().phase === "PAUSED_AT_CENTER", "Transitions to PAUSED_AT_CENTER at true visual center");

  useRaviPrototypeStore.getState().setPhase("EXITING");
  assert(useRaviPrototypeStore.getState().phase === "EXITING", "Transitions to EXITING across to left edge");

  useRaviPrototypeStore.getState().setPhase("COMPLETED");
  assert(useRaviPrototypeStore.getState().phase === "COMPLETED", "Transitions to COMPLETED after crossing screen");

  useRaviPrototypeStore.getState().setPhase("IDLE");
  assert(useRaviPrototypeStore.getState().phase === "IDLE", "Returns to clean IDLE state");

  // =============================================
  // Test 3: Dedicated ravi_dance.webm Asset Integrity
  // =============================================
  console.log("\n3. Testing ravi_dance.webm Asset Availability...");
  const assetPath = path.resolve(process.cwd(), "public/memes/processed/ravi_dance.webm");
  assert(fs.existsSync(assetPath), "ravi_dance.webm exists in public/memes/processed/");
  const stat = fs.statSync(assetPath);
  assert(stat.size > 500 * 1024, `ravi_dance.webm has valid size (${(stat.size / 1024).toFixed(1)} KB)`);

  // =============================================
  // Test 4: True Visual Center Calculation
  // =============================================
  console.log("\n4. Testing True Visual Center Mathematical Calibration...");
  const viewport = { width: 1920, height: 1080 };
  const calc = calculateCharacterCenter("ravi_dance", viewport, { width: 720, height: 720 });
  assert(calc.screenCenterX === 960, "Screen center X is exactly 960px");
  assert(calc.screenCenterY === 540, "Screen center Y is exactly 540px");
  assert(calc.visualCenterErrorPixels < 0.01, "Zero visual center error (Ravi torso = Screen center)");

  // =============================================
  // Test 5: Speed Presets
  // =============================================
  console.log("\n5. Testing Speed Presets (Fast, Normal, Cinematic)...");
  useRaviPrototypeStore.getState().setSpeedPreset("FAST");
  assert(useRaviPrototypeStore.getState().speedPreset === "FAST", "Speed preset updated to FAST");
  assert(useRaviPrototypeStore.getState().entranceDuration === 1.5, "FAST entrance is 1.5s");
  assert(useRaviPrototypeStore.getState().pauseDuration === 2.5, "FAST center pause is 2.5s");
  assert(useRaviPrototypeStore.getState().exitDuration === 1.5, "FAST exit is 1.5s");

  useRaviPrototypeStore.getState().setSpeedPreset("CINEMATIC");
  assert(useRaviPrototypeStore.getState().speedPreset === "CINEMATIC", "Speed preset updated to CINEMATIC");
  assert(useRaviPrototypeStore.getState().entranceDuration === 4.0, "CINEMATIC entrance is 4.0s");
  assert(useRaviPrototypeStore.getState().pauseDuration === 6.0, "CINEMATIC center pause is 6.0s");
  assert(useRaviPrototypeStore.getState().exitDuration === 4.0, "CINEMATIC exit is 4.0s");

  useRaviPrototypeStore.getState().setSpeedPreset("NORMAL");
  assert(useRaviPrototypeStore.getState().speedPreset === "NORMAL", "Speed preset reset to NORMAL");

  // =============================================
  // Test 6: Pause Duration & HUD Controls
  // =============================================
  console.log("\n6. Testing Pause Duration & Controls...");
  useRaviPrototypeStore.getState().setPauseDuration(5.0);
  assert(useRaviPrototypeStore.getState().pauseDuration === 5.0, "Pause duration adjusted to 5.0s");

  assert(useRaviPrototypeStore.getState().showCenterCrosshair === false, "Crosshair initially false");
  useRaviPrototypeStore.getState().toggleCrosshair();
  assert(useRaviPrototypeStore.getState().showCenterCrosshair === true, "toggleCrosshair() enables HUD crosshair");

  assert(useRaviPrototypeStore.getState().isMuted === false, "Audio initially unmuted");
  useRaviPrototypeStore.getState().toggleMute();
  assert(useRaviPrototypeStore.getState().isMuted === true, "toggleMute() mutes audio");

  // =============================================
  // Test 7: Stop & Replay Actions
  // =============================================
  console.log("\n7. Testing Stop & Replay Actions...");
  useRaviPrototypeStore.getState().play();
  assert(useRaviPrototypeStore.getState().phase === "ENTERING", "play() is active");
  useRaviPrototypeStore.getState().stop();
  assert(useRaviPrototypeStore.getState().phase === "IDLE", "stop() resets phase to IDLE immediately");

  console.log(`\n=============================================================`);
  console.log(`RAVI PROTOTYPE TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRaviPrototypeTests();
