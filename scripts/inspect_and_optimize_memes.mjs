import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ffmpegPath = ffmpegInstaller.path;

const memes = [
  "you_have_to_do_it",
  "whats_wrong_with_you",
];

console.log("=== ENCODING INTERUPTION MEMES AT EXACTLY 50 FPS (Zero Lag, FastDecode) ===");

for (const id of memes) {
  const rawPath = path.resolve(`public/memes/raw/${id}.mp4`);
  const fastMp4Path = path.resolve(`public/memes/raw/${id}_50fps.mp4`);

  console.log(`\nProcessing: ${id} -> 50 FPS H.264 MP4 with +faststart`);
  const mp4Args = [
    "-y",
    "-i", rawPath,
    "-vf", "fps=50,scale='min(720,iw)':-2:flags=lanczos,format=yuv420p",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-tune", "fastdecode",
    "-profile:v", "main",
    "-level", "3.1",
    "-movflags", "+faststart",
    "-bf", "0",              // 0 B-frames = zero decoder buffer latency = instant buttery playback
    "-crf", "19",            // Ultra-crisp quality
    "-maxrate", "3000k",
    "-bufsize", "6000k",
    "-g", "25",              // Keyframe every 0.5s (25 frames at 50fps)
    "-c:a", "aac",
    "-b:a", "160k",
    "-ar", "48000",
    fastMp4Path
  ];

  const res = spawnSync(ffmpegPath, mp4Args, { stdio: "inherit" });
  if (res.status === 0) {
    fs.copyFileSync(fastMp4Path, rawPath);
    fs.unlinkSync(fastMp4Path);
    const stat = fs.statSync(rawPath);
    console.log(`[✓] Successfully encoded ${id}.mp4 at exactly 50 FPS! Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  } else {
    console.error(`[✗] Failed to encode ${id}`);
  }
}

console.log("\n=== ALL MEMES READY AT 50 FPS ===");
