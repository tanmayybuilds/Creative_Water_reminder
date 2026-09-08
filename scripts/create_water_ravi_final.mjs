import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;
const rawInput = path.resolve(process.cwd(), "public/memes/raw/gucci_dance.mp4");
const processedOutput = path.resolve(process.cwd(), "public/memes/processed/water_ravi_final.webm");

console.log("=== CREATING FINALIZED 15-SECOND TRANSPARENT WATER_RAVI_FINAL.WEBM ===");
console.log(`Input:  ${rawInput}`);
console.log(`Output: ${processedOutput}`);
console.log(`FFmpeg: ${ffmpegPath}`);

if (!fs.existsSync(rawInput)) {
  console.error(`[!] Raw source missing: ${rawInput}`);
  process.exit(1);
}

// 1. Loop raw input seamlessly to reach exactly 15.0 seconds
// 2. Colorkey background removal to transparent yuva420p VP9
// 3. Despill green/dark fringes to keep Ravi crisp
// 4. Crop to Ravi's bounding box (square 720x720) so the character dances in place
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
  "-stream_loop", "3", // Loop the clip to cover the full 15s timeline
  "-i", rawInput,
  "-t", "15.0", // Exactly 15.00 seconds
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

console.log("\n[*] Encoding 15-second transparent WebM...");
const result = spawnSync(ffmpegPath, encodeArgs, { stdio: "inherit" });

if (result.status !== 0) {
  console.error("[!] Encoding failed.");
  process.exit(1);
}

const stats = fs.statSync(processedOutput);
console.log(`\n[✓] Successfully generated: ${processedOutput}`);
console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
