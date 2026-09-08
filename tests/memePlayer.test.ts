import { MEME_REGISTRY, getAllMemes, getMeme } from "../src/features/memes/registry";
import { MemeAssetProvider } from "../src/features/memes/assetProvider";
import {
  POSITION_CONFIGS,
  getPositionStyles,
  calculateBoundingBoxCoordinates,
} from "../src/features/memes/positions";
import { getAnimationVariants } from "../src/features/memes/animations";
import { useMemeStore } from "../src/features/memes/memeStore";
import {
  BEHAVIOR_FIXTURES,
  getAllBehaviorFixtures,
  getBehaviorFixture,
} from "../src/features/memes/fixtures";
import type {
  MemeId,
  MemePosition,
  EntranceAnimationType,
  ExitAnimationType,
} from "../src/features/memes/types";
import * as fs from "fs";
import * as path from "path";

export function runMemePlayerTests() {
  console.log("=== RUNNING HARDENED MEME PLAYER & FIXTURE TESTS ===\n");
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

  // 1. Registry Validation (Exactly 11 Assets)
  console.log("1. Testing Meme Registry & Asset Strictness...");
  const memes = getAllMemes();
  assert(memes.length >= 11, "Registry contains at least 11 registered memes");

  const expectedIds: MemeId[] = [
    "gucci_dance",
    "dcp_ravi_kishan",
    "thinking_ravi",
    "you_have_to_do_it",
    "weird_dance_nakhre",
    "flex_look",
    "koteshwariya_shiv_song",
    "money_follows_my_brother",
    "imaandari",
    "whats_wrong_with_you",
    "shutup_manoj_tiwari",
  ];

  for (const id of expectedIds) {
    const meme = getMeme(id);
    assert(!!meme, `Meme '${id}' is defined in registry`);
    assert(meme?.filename.endsWith(".mp4") === true, `Meme '${id}' has valid .mp4 filename`);
    assert(!!meme?.title && !!meme?.character, `Meme '${id}' has title and character`);
  }

  // Verify forbidden names do not exist
  assert(
    (MEME_REGISTRY as Record<string, unknown>)["naame_ya_daam"] === undefined,
    "Forbidden asset 'naame_ya_daam' does NOT exist in registry"
  );

  // 2. Physical File Verification
  console.log("\n2. Testing Physical Video Files (Raw MP4 or Processed WebM)...");
  const rawDir = path.resolve(process.cwd(), "public/memes/raw");
  const processedDir = path.resolve(process.cwd(), "public/memes/processed");
  const hasRaw = fs.existsSync(rawDir);
  for (const meme of memes) {
    const rawPath = path.join(rawDir, meme.filename);
    const webmPath = path.join(processedDir, `${meme.id}.webm`);
    if (hasRaw && fs.existsSync(rawPath)) {
      const size = fs.statSync(rawPath).size;
      assert(
        size > 100000,
        `File '${meme.filename}' exists on disk and is non-empty (${Math.round(size / 1024)} KB)`
      );
    } else {
      const exists = fs.existsSync(webmPath);
      const size = exists ? fs.statSync(webmPath).size : 0;
      assert(
        exists && size > 50000,
        `Processed asset '${meme.id}.webm' exists on disk and is non-empty (${Math.round(size / 1024)} KB)`
      );
    }
  }

  // 3. Asset Provider Abstraction Test
  console.log("\n3. Testing Asset Provider Abstraction...");
  MemeAssetProvider.setMode("raw");
  const rawUrl = MemeAssetProvider.resolveUrl(MEME_REGISTRY.gucci_dance);
  assert(rawUrl === "/memes/raw/gucci_dance.mp4", "Raw asset URL resolves to /memes/raw/gucci_dance.mp4");

  MemeAssetProvider.setMode("processed");
  const processedUrl = MemeAssetProvider.resolveUrl(MEME_REGISTRY.gucci_dance);
  assert(
    processedUrl === "/memes/processed/gucci_dance.webm",
    "Processed asset URL resolves to /memes/processed/gucci_dance.webm"
  );
  MemeAssetProvider.setMode("raw");

  // 4. Viewport Positioning & Exact Mathematical Centering Tests
  console.log("\n4. Testing Viewport Positioning & Visual Center Coincidence...");
  const testResolutions = [
    { width: 1280, height: 720, name: "720p HD" },
    { width: 1366, height: 768, name: "1366x768 Standard Laptop" },
    { width: 1920, height: 1080, name: "1080p Full HD" },
    { width: 2560, height: 1440, name: "1440p QHD" },
  ];

  const elementSize = { width: 480, height: 360 };

  for (const res of testResolutions) {
    const centerCoords = calculateBoundingBoxCoordinates("center", res, elementSize);
    assert(
      centerCoords.centerX === res.width / 2,
      `Center position X coincides with viewport center on ${res.name} (${centerCoords.centerX} === ${res.width / 2})`
    );
    assert(
      centerCoords.centerY === res.height / 2,
      `Center position Y coincides with viewport center on ${res.name} (${centerCoords.centerY} === ${res.height / 2})`
    );
  }

  // Test all 9 positions structure and styling
  const positions: MemePosition[] = [
    "center",
    "top",
    "topLeft",
    "topRight",
    "centerLeft",
    "centerRight",
    "bottom",
    "bottomLeft",
    "bottomRight",
  ];

  for (const pos of positions) {
    const config = getPositionStyles(pos);
    assert(
      config.containerClassName.includes("fixed") && config.containerClassName.includes("pointer-events-none"),
      `Position '${pos}' uses full-viewport fixed layout with pointer-events-none`
    );
    assert(!!config.transformOrigin, `Position '${pos}' has valid transformOrigin ('${config.transformOrigin}')`);

    // Verify coordinate calculation
    const coords = calculateBoundingBoxCoordinates(pos, { width: 1920, height: 1080 }, elementSize, 24);
    assert(
      coords.left >= 0 && coords.top >= 0,
      `Position '${pos}' coordinates remain within viewport bounds (left: ${coords.left}, top: ${coords.top})`
    );
  }

  // 5. Animation System Test (8 Entrances x 6 Exits)
  console.log("\n5. Testing Animation System (8 Entrances x 6 Exits)...");
  const entrances: EntranceAnimationType[] = [
    "slideFromLeft",
    "slideFromRight",
    "slideFromTop",
    "slideFromBottom",
    "pop",
    "fade",
    "peekFromLeft",
    "peekFromRight",
  ];
  const exits: ExitAnimationType[] = [
    "slideToLeft",
    "slideToRight",
    "slideToTop",
    "slideToBottom",
    "fade",
    "shrink",
  ];

  for (const ent of entrances) {
    for (const ex of exits) {
      const variants = getAnimationVariants(ent, ex);
      assert(
        !!variants.initial && !!variants.animate && !!variants.exit && !!variants.transition,
        `Animation pair '${ent}' -> '${ex}' generates valid motion variants`
      );
    }
  }

  // 6. Test Fixtures Validation (Part 2)
  console.log("\n6. Testing Meme Behavior Test Fixtures...");
  const fixtures = getAllBehaviorFixtures();
  assert(fixtures.length === 8, "Exactly 8 required test fixtures are defined");

  const expectedFixtures = [
    { id: "fresh_user", cd: 0, td: 0, ba: 0, ea: 0 },
    { id: "first_dismissal", cd: 1, td: 1, ba: 0, ea: 0 },
    { id: "light_repeated_dismissal", cd: 2, td: 2, ba: 0, ea: 0 },
    { id: "medium_repeated_dismissal", cd: 4, td: 4, ba: 0, ea: 0 },
    { id: "heavy_repeated_dismissal", cd: 6, td: 6, ba: 0, ea: 0 },
    { id: "accepted_break_after_dismissals", cd: 0, td: 4, ba: 1, ea: 0 },
    { id: "repeated_exit_attempts", cd: 6, td: 6, ba: 0, ea: 3 },
    { id: "final_exit_attempt", cd: 8, td: 8, ba: 0, ea: 4 },
  ];

  for (const expected of expectedFixtures) {
    const f = getBehaviorFixture(expected.id);
    assert(!!f, `Fixture '${expected.id}' exists`);
    assert(
      f?.consecutiveDismissals === expected.cd &&
        f?.totalDismissals === expected.td &&
        f?.breaksAccepted === expected.ba &&
        f?.exitAttempts === expected.ea,
      `Fixture '${expected.id}' values match expected: [cd:${expected.cd}, td:${expected.td}, ba:${expected.ba}, ea:${expected.ea}]`
    );
  }

  // 7. Playback Controller & Concurrency Test
  console.log("\n7. Testing Meme Playback Controller & Single-Active Concurrency...");
  const store = useMemeStore.getState();

  // Test playing a meme with various scale factors
  const testScales = [0.5, 1.0, 1.5, 1.8];
  for (const scale of testScales) {
    store.playMeme("gucci_dance", { position: "center", scale });
    const active = useMemeStore.getState().activeMeme;
    assert(active?.options.scale === scale, `Meme plays correctly at scale ${scale}x`);
  }

  // Test pause and resume
  useMemeStore.getState().togglePause();
  assert(useMemeStore.getState().activeMeme?.isPaused === true, "togglePause() pauses active meme");
  useMemeStore.getState().togglePause();
  assert(useMemeStore.getState().activeMeme?.isPaused === false, "togglePause() resumes active meme");

  // Test playback rate
  useMemeStore.getState().setPlaybackRate(1.5);
  assert(useMemeStore.getState().playbackRate === 1.5, "setPlaybackRate(1.5) updates playbackRate in store");
  assert(useMemeStore.getState().activeMeme?.options.playbackRate === 1.5, "Active meme receives updated playback rate");

  // Test mute
  useMemeStore.getState().setMuted(true);
  assert(useMemeStore.getState().isMuted === true, "setMuted(true) updates isMuted in store");
  assert(useMemeStore.getState().activeMeme?.options.muted === true, "Active meme receives muted state");

  // Test looping
  useMemeStore.getState().setLooping(true);
  assert(useMemeStore.getState().isLooping === true, "setLooping(true) updates isLooping in store");
  assert(useMemeStore.getState().activeMeme?.options.loop === true, "Active meme receives loop option");

  // Test stage progression
  useMemeStore.getState().setStage("playing");
  assert(useMemeStore.getState().activeMeme?.stage === "playing", "Stage transitions to 'playing'");

  // Test video end (when looping is false)
  useMemeStore.getState().setLooping(false);
  useMemeStore.getState().handleVideoEnded();
  assert(useMemeStore.getState().activeMeme?.stage === "exiting", "Video end transitions stage to 'exiting'");

  // Test exit completion (unmount)
  useMemeStore.getState().setStage("idle");
  assert(useMemeStore.getState().activeMeme === null, "Exiting completion cleans active state to null (idle)");

  // Test Concurrency: triggering another meme while one is playing replaces it cleanly
  store.playMeme("whats_wrong_with_you");
  assert(useMemeStore.getState().activeMeme?.meme.id === "whats_wrong_with_you", "Meme 1 started");

  store.playMeme("thinking_ravi");
  const active2 = useMemeStore.getState().activeMeme;
  assert(active2?.meme.id === "thinking_ravi", "Meme 2 safely replaces Meme 1 (no two memes play simultaneously)");

  // Test stop
  store.stopMeme();
  assert(useMemeStore.getState().activeMeme?.stage === "exiting", "Stop action smoothly triggers exiting stage");
  useMemeStore.getState().setStage("idle");
  assert(useMemeStore.getState().activeMeme === null, "Idle clears state cleanly");

  // Test graceful error recovery
  store.playMeme("imaandari");
  store.handleVideoError(new Error("Simulated load error"));
  assert(useMemeStore.getState().activeMeme === null, "Video error resets active meme gracefully without crash");

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runMemePlayerTests();
