import { MEME_REGISTRY, getAllMemes, getMeme } from "../src/features/memes/registry";
import {
  calculateMovementMotionVariants,
  getContinuousCrossScreenKeyframes,
} from "../src/features/memes/movement/movementProfiles";
import { calculateBoundingBoxCoordinates } from "../src/features/memes/positions";
import { selectInterventionMeme } from "../src/features/memes/behavior/memeSelector";
import { DEFAULT_BEHAVIOR_CONFIG } from "../src/features/memes/behavior/behaviorConfig";
import type { MemeId, MovementProfileType } from "../src/features/memes/types";

export function runMovementProfileTests() {
  console.log("=== RUNNING STRATEGIC MOVEMENT PROFILE TESTS ===\n");
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

  const allMemes = getAllMemes();

  // 1. Every Meme Has a Valid Movement Profile
  console.log("1. Testing Meme Movement Profiles Validity...");
  const validProfiles: MovementProfileType[] = [
    "crossScreen",
    "enterAndStop",
    "popAndReact",
    "edgePeek",
    "dropFromTop",
    "riseFromBottom",
  ];

  for (const meme of allMemes) {
    assert(!!meme.movement, `Meme '${meme.id}' defines a movement configuration`);
    assert(
      validProfiles.includes(meme.movement.profile),
      `Meme '${meme.id}' has valid movement profile: '${meme.movement.profile}'`
    );
    assert(!!meme.movement.targetPosition, `Meme '${meme.id}' specifies target position: '${meme.movement.targetPosition}'`);
  }

  // 2. Exact Meme-Specific Mapping Verification
  console.log("\n2. Testing Exact Meme-Specific Movement Mappings...");

  // gucci_dance: crossScreen, rightToLeft, center
  const gucci = getMeme("gucci_dance");
  assert(gucci?.movement.profile === "crossScreen", "gucci_dance uses 'crossScreen' movement profile");
  assert(gucci?.movement.direction === "rightToLeft", "gucci_dance moves RIGHT → CENTER → LEFT (rightToLeft)");
  assert(gucci?.movement.targetPosition === "center", "gucci_dance is vertically centered");

  // weird_dance_nakhre: crossScreen, leftToRight, center
  const weirdDance = getMeme("weird_dance_nakhre");
  assert(weirdDance?.movement.profile === "crossScreen", "weird_dance_nakhre uses 'crossScreen' movement profile");
  assert(weirdDance?.movement.direction === "leftToRight", "weird_dance_nakhre moves LEFT → CENTER → RIGHT (leftToRight)");
  assert(weirdDance?.movement.targetPosition === "center", "weird_dance_nakhre is vertically centered");

  // thinking_ravi: popAndReact, topRight, pop, shrink
  const thinking = getMeme("thinking_ravi");
  assert(thinking?.movement.profile === "popAndReact", "thinking_ravi uses 'popAndReact' profile");
  assert(thinking?.movement.targetPosition === "topRight", "thinking_ravi target position is 'topRight'");
  assert(thinking?.movement.exitOverride === "shrink", "thinking_ravi exits via 'shrink'");

  // flex_look: enterAndStop, leftToRight, center, slideToRight
  const flex = getMeme("flex_look");
  assert(flex?.movement.profile === "enterAndStop", "flex_look uses 'enterAndStop' profile");
  assert(flex?.movement.direction === "leftToRight", "flex_look enters LEFT → CENTER");
  assert(flex?.movement.exitOverride === "slideToRight", "flex_look exits toward right");

  // money_follows_my_brother: popAndReact, bottomRight, shrink
  const money = getMeme("money_follows_my_brother");
  assert(money?.movement.profile === "popAndReact", "money_follows_my_brother uses 'popAndReact' profile");
  assert(money?.movement.targetPosition === "bottomRight", "money_follows_my_brother target position is 'bottomRight'");
  assert(money?.movement.exitOverride === "shrink", "money_follows_my_brother exits via 'shrink'");

  // koteshwariya_shiv_song: riseFromBottom, bottomToTop, center, slideToTop
  const shiv = getMeme("koteshwariya_shiv_song");
  assert(shiv?.movement.profile === "riseFromBottom", "koteshwariya_shiv_song uses 'riseFromBottom' profile");
  assert(shiv?.movement.direction === "bottomToTop", "koteshwariya_shiv_song rises BOTTOM → CENTER");
  assert(shiv?.movement.exitOverride === "slideToTop", "koteshwariya_shiv_song exits upward (slideToTop)");

  // you_have_to_do_it: dropFromTop, topToBottom, center, slideToBottom
  const youHaveTo = getMeme("you_have_to_do_it");
  assert(youHaveTo?.movement.profile === "dropFromTop", "you_have_to_do_it uses 'dropFromTop' profile");
  assert(youHaveTo?.movement.direction === "topToBottom", "you_have_to_do_it drops TOP → CENTER");

  // imaandari: enterAndStop, leftToRight, center, slideToLeft
  const imaandari = getMeme("imaandari");
  assert(imaandari?.movement.profile === "enterAndStop", "imaandari uses 'enterAndStop' profile");
  assert(imaandari?.movement.direction === "leftToRight", "imaandari enters LEFT → CENTER");
  assert(imaandari?.movement.exitOverride === "slideToLeft", "imaandari exits left");

  // dcp_ravi_kishan: enterAndStop, rightToLeft, center, fade
  const dcp = getMeme("dcp_ravi_kishan");
  assert(dcp?.movement.profile === "enterAndStop", "dcp_ravi_kishan uses 'enterAndStop' profile");
  assert(dcp?.movement.direction === "rightToLeft", "dcp_ravi_kishan enters RIGHT → CENTER");
  assert(dcp?.movement.exitOverride === "fade", "dcp_ravi_kishan exits via fade");

  // whats_wrong_with_you: popAndReact, center, fade
  const whatsWrong = getMeme("whats_wrong_with_you");
  assert(whatsWrong?.movement.profile === "popAndReact", "whats_wrong_with_you uses 'popAndReact' profile");
  assert(whatsWrong?.movement.targetPosition === "center", "whats_wrong_with_you target is EXACT CENTER");
  assert(whatsWrong?.movement.exitOverride === "fade", "whats_wrong_with_you exits via fade");

  // shutup_manoj_tiwari: popAndReact, center, fade (Special Final Meme)
  const manoj = getMeme("shutup_manoj_tiwari");
  assert(manoj?.movement.profile === "popAndReact", "shutup_manoj_tiwari uses 'popAndReact' profile");
  assert(manoj?.movement.targetPosition === "center", "shutup_manoj_tiwari target is EXACT CENTER");

  // 3. Continuous Cross-Screen Trajectory Mechanics & Viewport Overscan
  console.log("\n3. Testing Continuous crossScreen Trajectory Mechanics...");
  const rightToLeftKeyframes = getContinuousCrossScreenKeyframes("rightToLeft", "115vw");
  assert(
    rightToLeftKeyframes.initialX === "115vw" && rightToLeftKeyframes.animateValues[1] === "-115vw",
    "rightToLeft crossScreen keyframes travel from +115vw to -115vw (full viewport traversal)"
  );

  const leftToRightKeyframes = getContinuousCrossScreenKeyframes("leftToRight", "115vw");
  assert(
    leftToRightKeyframes.initialX === "-115vw" && leftToRightKeyframes.animateValues[1] === "115vw",
    "leftToRight crossScreen keyframes travel from -115vw to +115vw (full viewport traversal)"
  );

  // Test motion variant generator for crossScreen
  const gucciVariants = calculateMovementMotionVariants(gucci!.movement, 5.0);
  assert(gucciVariants.isContinuousTrajectory === true, "crossScreen flags isContinuousTrajectory as true");
  assert(gucciVariants.initial.x === "115vw", "gucci initial.x starts outside right (+115vw)");
  assert(gucciVariants.animate.x === "-115vw", "gucci animate.x finishes outside left (-115vw)");
  assert((gucciVariants.transition as { duration?: number }).duration === 5.0, "crossScreen transition synchronizes with duration (5.0s)");

  // 4. Mathematical Centering and Multi-Resolution Invariance
  console.log("\n4. Testing Viewport Center Invariance Across Resolutions...");
  const testResolutions = [
    { width: 1280, height: 720, name: "1280x720 HD" },
    { width: 1366, height: 768, name: "1366x768 Standard" },
    { width: 1920, height: 1080, name: "1920x1080 Full HD" },
    { width: 2560, height: 1440, name: "2560x1440 QHD" },
  ];

  const elementSize = { width: 500, height: 380 };

  for (const res of testResolutions) {
    const coords = calculateBoundingBoxCoordinates("center", res, elementSize);
    assert(
      coords.centerX === res.width / 2 && coords.centerY === res.height / 2,
      `Exact center alignment verified on ${res.name} (centerX: ${coords.centerX}, centerY: ${coords.centerY})`
    );
  }

  // 5. Normal Selection Exclusion of Special Manoj Meme
  console.log("\n5. Testing shutup_manoj_tiwari Strict Normal Selection Exclusion...");
  for (let lvl = 0; lvl <= 2; lvl++) {
    for (let i = 0; i < 20; i++) {
      const selected = selectInterventionMeme(lvl as 0 | 1 | 2, [], null, DEFAULT_BEHAVIOR_CONFIG, () => i / 20);
      assert(
        selected?.memeId !== "shutup_manoj_tiwari",
        `Level ${lvl} selection never returns shutup_manoj_tiwari (selected: '${selected?.memeId}')`
      );
    }
  }

  // 6. Movement Motion Variants for All Profiles
  console.log("\n6. Testing Motion Definitions for All Movement Profiles...");
  for (const p of validProfiles) {
    const motion = calculateMovementMotionVariants(
      {
        profile: p,
        direction: "rightToLeft",
        targetPosition: "center",
      },
      4.0
    );
    assert(
      !!motion.initial && !!motion.animate && !!motion.exit && !!motion.transition,
      `Profile '${p}' produces complete and valid motion definition`
    );
  }

  console.log(`\n========================================`);
  console.log(`MOVEMENT PROFILES TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runMovementProfileTests();
