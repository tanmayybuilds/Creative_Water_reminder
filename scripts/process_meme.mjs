#!/usr/bin/env node
/**
 * LOCKIN - Offline Transparent Meme Video Processing Tool (High Performance)
 * ===========================================================================
 * Converts raw MP4 meme videos into transparent-background WebM (VP9 + alpha)
 * with synchronized audio using bundled ffmpeg and alpha-channel compositing.
 * 
 * 100% offline. Zero cloud API calls.
 * 
 * Usage:
 *   node scripts/process_meme.mjs <input_path.mp4> <output_path.webm>
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;

const inputArg = process.argv[2] || "public/memes/raw/gucci_dance.mp4";
const outputArg = process.argv[3] || "public/memes/processed/gucci_dance.webm";

const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = path.resolve(process.cwd(), outputArg);

if (!fs.existsSync(inputPath)) {
  console.error(`[!] Input file does not exist: ${inputPath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

console.log("=== LOCKIN OFFLINE TRANSPARENT MEME PIPELINE ===");
console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log(`FFmpeg: ${ffmpegPath}`);

// 1. Probe input video metadata
console.log("\n[1/3] Probing input video metadata...");
const probeResult = spawnSync(ffmpegPath, ["-i", inputPath], { encoding: "utf8" });
const probeOutput = probeResult.stderr || "";

let fps = 30;
let duration = 30;
const fpsMatch = probeOutput.match(/(\d+(?:\.\d+)?)\s*fps/);
if (fpsMatch) fps = parseFloat(fpsMatch[1]);
const durMatch = probeOutput.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
if (durMatch) {
  duration = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseFloat(durMatch[3]);
}
const hasAudio = probeOutput.includes("Audio:");

console.log(`  FPS: ${fps}, Duration: ${duration.toFixed(2)}s, Audio: ${hasAudio ? "Present" : "None"}`);

// 2. High-Fidelity Alpha Matting & Fast Multi-Threaded VP9 WebM Encoding
console.log("\n[2/3] Generating Alpha Matte & Compositing Transparent Foreground...");

// Optimized high-speed multi-threaded VP9 encode with alpha channel:
// - format=yuva420p
// - colorkey with fine-tuned similarity & blend threshold to preserve Ravi while removing backdrop
// - despill filter to eliminate color fringe
// - libvpx-vp9 with realtime deadline + multi-threading for maximum speed
const encodeArgs = [
  "-y",
  "-threads", "8",
  "-i", inputPath,
  "-filter_complex",
  "[0:v]format=yuva420p,colorkey=0x0a0a0e:0.20:0.12,despill=type=green:mix=0.5,format=yuva420p[outv]",
  "-map", "[outv]",
];

if (hasAudio) {
  encodeArgs.push("-map", "0:a", "-c:a", "libopus", "-b:a", "128k");
}

encodeArgs.push(
  "-c:v", "libvpx-vp9",
  "-pix_fmt", "yuva420p",
  "-auto-alt-ref", "0",
  "-deadline", "realtime",
  "-cpu-used", "8",
  "-row-mt", "1",
  "-b:v", "2000k",
  outputPath
);

console.log("\n[3/3] Encoding transparent VP9 WebM...");

const encodeProcess = spawnSync(ffmpegPath, encodeArgs, { stdio: "inherit" });

if (encodeProcess.status !== 0) {
  console.error("[!] Encoding failed.");
  process.exit(1);
}

const stats = fs.statSync(outputPath);
console.log(`\n[✓] Successfully generated transparent WebM: ${outputPath}`);
console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
