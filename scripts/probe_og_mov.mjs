import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;
const movPath = path.resolve(process.cwd(), "public/memes/raw/gucci dance transparent og.mov");

console.log("=== PROBING USER OG MOV ASSET ===");
console.log(`Path: ${movPath}`);
console.log(`Exists: ${fs.existsSync(movPath)}`);
if (fs.existsSync(movPath)) {
  const stat = fs.statSync(movPath);
  console.log(`Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  const result = spawnSync(ffmpegPath, ["-i", movPath], { encoding: "utf8" });
  console.log("\n--- FFmpeg Probe Output ---");
  console.log(result.stderr);
}
