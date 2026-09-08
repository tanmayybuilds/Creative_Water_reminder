#!/usr/bin/env node
/**
 * LOCKIN - Parallel Batch Transparent Meme Video Processing Tool
 * =================================================================
 * Converts all 11 raw MP4 meme assets into transparent-background WebM (VP9 + alpha)
 * with synchronized audio using bundled ffmpeg, per-clip tuned alpha matting,
 * and concurrent asynchronous multi-process encoding.
 * 
 * 100% offline. Zero cloud API calls.
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;
const rawDir = path.resolve(process.cwd(), "public/memes/raw");
const processedDir = path.resolve(process.cwd(), "public/memes/processed");

fs.mkdirSync(processedDir, { recursive: true });

// All 11 registered meme assets with per-clip custom filter settings
const MEME_CONFIGS = [
  {
    id: "gucci_dance",
    filename: "gucci_dance.mp4",
    maxDuration: 8.0,
    filter: "colorkey=0x0a0a0e:0.20:0.12,despill=type=green:mix=0.5",
  },
  {
    id: "dcp_ravi_kishan",
    filename: "dcp_ravi_kishan.mp4",
    maxDuration: 6.0,
    filter: "colorkey=0x08080c:0.22:0.12,despill=type=green:mix=0.4",
  },
  {
    id: "thinking_ravi",
    filename: "thinking_ravi.mp4",
    maxDuration: 6.38,
    filter: "colorkey=0x0a0a0f:0.22:0.12,despill=type=green:mix=0.4",
  },
  {
    id: "you_have_to_do_it",
    filename: "you_have_to_do_it.mp4",
    maxDuration: 6.0,
    filter: "colorkey=0x0c0c10:0.20:0.12,despill=type=green:mix=0.4",
  },
  {
    id: "weird_dance_nakhre",
    filename: "weird_dance_nakhre.mp4",
    maxDuration: 6.0,
    filter: "colorkey=0x08080c:0.22:0.12,despill=type=green:mix=0.5",
  },
  {
    id: "flex_look",
    filename: "flex_look.mp4",
    maxDuration: 6.0,
    filter: "colorkey=0x08080c:0.20:0.12,despill=type=green:mix=0.4",
  },
  {
    id: "koteshwariya_shiv_song",
    filename: "koteshwariya_shiv_song.mp4",
    maxDuration: 6.0,
    filter: "colorkey=0x0a0a0f:0.20:0.12,despill=type=green:mix=0.4",
  },
  {
    id: "money_follows_my_brother",
    filename: "money_follows_my_brother.mp4",
    maxDuration: 6.0,
    filter: "colorkey=0x0a0a10:0.20:0.12,despill=type=green:mix=0.4",
  },
  {
    id: "imaandari",
    filename: "imaandari.mp4",
    maxDuration: 5.04,
    filter: "colorkey=0x0c0c12:0.18:0.10,despill=type=green:mix=0.3",
  },
  {
    id: "whats_wrong_with_you",
    filename: "whats_wrong_with_you.mp4",
    maxDuration: 5.96,
    filter: "colorkey=0x0c0c12:0.18:0.10,despill=type=green:mix=0.3",
  },
  {
    id: "shutup_manoj_tiwari",
    filename: "shutup_manoj_tiwari.mp4",
    maxDuration: 2.40,
    filter: "colorkey=0x0e0e14:0.18:0.10,despill=type=green:mix=0.3",
  },
];

console.log("=== LOCKIN PARALLEL BATCH TRANSPARENT MEME PIPELINE ===");
console.log(`Total Memes to Process: ${MEME_CONFIGS.length}`);
console.log(`FFmpeg: ${ffmpegPath}\n`);

function processMeme(config) {
  return new Promise((resolve) => {
    const inputPath = path.join(rawDir, config.filename);
    const outputPath = path.join(processedDir, `${config.id}.webm`);

    if (!fs.existsSync(inputPath)) {
      console.error(`  [!] Source file missing: ${inputPath}`);
      return resolve({ id: config.id, success: false, error: "File not found" });
    }

    const vf = `scale=-2:720,format=yuva420p,${config.filter}`;

    const args = [
      "-y",
      "-threads", "4",
      "-ss", "0",
      "-t", String(config.maxDuration),
      "-i", inputPath,
      "-vf", vf,
      "-c:v", "libvpx-vp9",
      "-pix_fmt", "yuva420p",
      "-auto-alt-ref", "0",
      "-deadline", "realtime",
      "-cpu-used", "8",
      "-row-mt", "1",
      "-b:v", "1500k",
      "-c:a", "libopus",
      "-b:a", "128k",
      outputPath,
    ];

    console.log(`[*] Started processing: ${config.id} (${config.filename})`);
    const proc = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });

    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`[✓] Completed: ${config.id}.webm (${(stats.size / 1024).toFixed(1)} KB)`);
        resolve({ id: config.id, success: true, size: stats.size });
      } else {
        console.error(`[✗] Failed: ${config.id} with exit code ${code}`);
        resolve({ id: config.id, success: false, error: stderr });
      }
    });
  });
}

// Worker Pool: run up to 3 memes concurrently
async function runWorkerPool(items, concurrency = 3) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = processMeme(item).then((res) => {
      executing.delete(p);
      return res;
    });
    executing.add(p);
    results.push(p);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

async function main() {
  const startTime = Date.now();
  const results = await runWorkerPool(MEME_CONFIGS, 3);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n=========================================");
  console.log(`BATCH PROCESSING COMPLETE in ${elapsed}s: ${results.filter((r) => r.success).length}/${MEME_CONFIGS.length} succeeded.`);
  console.log("=========================================\n");

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.error("Failed items:", failed);
    process.exit(1);
  }
}

main();
