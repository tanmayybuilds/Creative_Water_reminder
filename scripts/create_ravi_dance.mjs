#!/usr/bin/env node
/**
 * LOCKIN - Create Dedicated Looping Transparent Ravi Dance Asset
 * =================================================================
 * Generates `public/memes/processed/ravi_dance.webm` optimized for seamless looping.
 *
 * Rules:
 * - Keep Ravi only (alpha transparency preserved).
 * - Remove all background.
 * - Do NOT bake any screen movement into the video (character centered in place).
 * - Synchronized Gucci dance audio.
 * - Output: VP9 + yuva420p alpha.
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;
const rawInput = path.resolve(process.cwd(), "public/memes/raw/gucci_dance.mp4");
const processedOutput = path.resolve(process.cwd(), "public/memes/processed/ravi_dance.webm");

console.log("=== CREATING DEDICATED LOOPING RAVI_DANCE.WEBM ===");
console.log(`Input:  ${rawInput}`);
console.log(`Output: ${processedOutput}`);
console.log(`FFmpeg: ${ffmpegPath}`);

if (!fs.existsSync(rawInput)) {
  console.error(`[!] Raw source missing: ${rawInput}`);
  process.exit(1);
}

// Filter chain:
// 1. Scale video to 720p height
// 2. Colorkey background removal to transparent alpha (yuva420p)
// 3. Despill green/dark fringes to keep Ravi crisp
// 4. Crop to Ravi's bounding box so he dances in place without baked screen panning
const filter = [
  "scale=-2:720",
  "format=yuva420p",
  "colorkey=0x0a0a0e:0.20:0.12",
  "despill=type=green:mix=0.5",
  "crop=w=min(iw\\,720):h=720:x=(iw-ow)/2:y=0",
  "format=yuva420p"
].join(",");

const encodeArgs = [
  "-y",
  "-threads", "4",
  "-ss", "0",
  "-t", "5.8", // Tight loop duration matching Ravi's dance step cycle
  "-i", rawInput,
  "-vf", filter,
  "-c:v", "libvpx-vp9",
  "-pix_fmt", "yuva420p",
  "-auto-alt-ref", "0",
  "-deadline", "realtime",
  "-cpu-used", "8",
  "-row-mt", "1",
  "-b:v", "2000k",
  "-c:a", "libopus",
  "-b:a", "128k",
  processedOutput,
];

console.log("\n[*] Encoding ravi_dance.webm (VP9 with alpha channel)...");
const result = spawnSync(ffmpegPath, encodeArgs, { stdio: "inherit" });

if (result.status !== 0) {
  console.error("[!] Encoding failed.");
  process.exit(1);
}

const stats = fs.statSync(processedOutput);
console.log(`\n[✓] Successfully generated: ${processedOutput}`);
console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
