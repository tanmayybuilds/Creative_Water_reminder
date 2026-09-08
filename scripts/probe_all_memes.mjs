import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;
const rawDir = path.resolve(process.cwd(), "public/memes/raw");

const files = fs.readdirSync(rawDir).filter(f => f.endsWith(".mp4"));

console.log("=== PROBING ALL 11 RAW MEME FILES ===");

for (const file of files) {
  const filePath = path.join(rawDir, file);
  const result = spawnSync(ffmpegPath, ["-i", filePath], { encoding: "utf8" });
  const output = result.stderr || "";

  let fps = "30";
  let duration = "0";
  let resolution = "unknown";
  let audio = "none";

  const fpsMatch = output.match(/(\d+(?:\.\d+)?)\s*fps/);
  if (fpsMatch) fps = fpsMatch[1];

  const durMatch = output.match(/Duration:\s*(\d+:\d+:\d+\.\d+)/);
  if (durMatch) duration = durMatch[1];

  const resMatch = output.match(/Stream #0:0.*?Video:.*?(\d{3,4}x\d{3,4})/);
  if (resMatch) resolution = resMatch[1];

  const audioMatch = output.match(/Stream #0:1.*?Audio:\s*([^,]+),\s*(\d+\s*Hz)/);
  if (audioMatch) audio = `${audioMatch[1]}, ${audioMatch[2]}`;

  console.log(`- ${file}: ${resolution} @ ${fps} fps, Duration: ${duration}, Audio: ${audio}`);
}
