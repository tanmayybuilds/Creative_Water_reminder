import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;

const memes = [
  {
    input: "public/memes/raw/you_have_to_do_it.mp4",
    output: "public/memes/processed/you_have_to_do_it.webm",
  },
  {
    input: "public/memes/raw/whats_wrong_with_you.mp4",
    output: "public/memes/processed/whats_wrong_with_you.webm",
  },
];

console.log("=== ENCODING PROCESSED WEBMs AT 50 FPS ===");

for (const meme of memes) {
  const inputPath = path.resolve(meme.input);
  const outputPath = path.resolve(meme.output);

  const args = [
    "-y",
    "-threads", "8",
    "-i", inputPath,
    "-vf", "fps=50,scale='min(720,iw)':-2:flags=lanczos,format=yuv420p",
    "-c:v", "libvpx-vp9",
    "-pix_fmt", "yuv420p",
    "-row-mt", "1",
    "-tile-columns", "3",
    "-tile-rows", "1",
    "-frame-parallel", "1",
    "-cpu-used", "8",
    "-deadline", "realtime",
    "-lag-in-frames", "0",
    "-b:v", "2000k",
    "-maxrate", "2500k",
    "-bufsize", "4000k",
    "-g", "25",
    "-c:a", "libopus",
    "-b:a", "128k",
    "-ar", "48000",
    outputPath
  ];

  spawnSync(ffmpegPath, args, { stdio: "inherit" });
  const stat = fs.statSync(outputPath);
  console.log(`[✓] ${path.basename(outputPath)}: ${(stat.size / (1024 * 1024)).toFixed(2)} MB at 50 FPS`);
}
