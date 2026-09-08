import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;
const processedDir = path.resolve(process.cwd(), "public/memes/processed");

const files = fs.readdirSync(processedDir).filter((f) => f.endsWith(".webm"));

console.log("=== PROBING ALL 11 PROCESSED WEBM ASSETS ===");

const summary = [];

for (const file of files) {
  const filePath = path.join(processedDir, file);
  const stat = fs.statSync(filePath);
  const result = spawnSync(ffmpegPath, ["-i", filePath], { encoding: "utf8" });
  const output = result.stderr || "";

  let fps = "30";
  let duration = "0";
  let resolution = "unknown";
  let audio = "none";
  let hasAlpha = false;

  const fpsMatch = output.match(/(\d+(?:\.\d+)?)\s*fps/);
  if (fpsMatch) fps = fpsMatch[1];

  const durMatch = output.match(/Duration:\s*(\d+:\d+:\d+\.\d+)/);
  if (durMatch) duration = durMatch[1];

  const resMatch = output.match(/Stream #0:0.*?Video:.*?(\d{3,4}x\d{3,4})/);
  if (resMatch) resolution = resMatch[1];

  const audioMatch = output.match(/Stream #0:1.*?Audio:\s*([^,]+),\s*(\d+\s*Hz)/);
  if (audioMatch) audio = `${audioMatch[1]}, ${audioMatch[2]}`;

  hasAlpha = output.includes("alpha_mode") || output.includes("yuva420p");

  summary.push({
    file,
    sizeKB: (stat.size / 1024).toFixed(1),
    sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
    resolution,
    fps,
    duration,
    audio,
    hasAlpha,
  });
}

console.table(summary);
