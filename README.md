# Water Reminder (Meme Edition)

A lightweight Windows desktop hydration sentinel that replaces easily dismissed notification toasts with unignorable, transparent character interventions. Built on Electron, React, and hardware-accelerated VP9 alpha video rendering.

[![Platform: Windows 10/11](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011%20(x64)-blue.svg)](#system-requirements)
[![Architecture: Electron + React](https://img.shields.io/badge/Stack-Electron%20%7C%20React%2018%20%7C%20TypeScript-informational.svg)](#technical-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

Traditional notification banners suffer from immediate dismissal reflex: users close toasts automatically without actually pausing to hydrate. 

**Water Reminder (Meme Edition)** solves this through scheduled, transparent desktop traversals:
* At configured intervals, a transparent, borderless overlay renders across the primary work area without stealing keyboard focus or minimizing active fullscreen applications.
* An animated character walks across the screen, pauses to present the hydration prompt, and exits cleanly.
* Clicking the character intercepts dismissal attempts and triggers contextual reaction sequences before resetting the timer.
* Operates **100% offline** with zero telemetry, zero cloud dependencies, and zero background analytics.

---

## Core Features

* **Transparent Desktop Traversal:** Native hardware-accelerated VP9 alpha-channel WebM playback with full sub-pixel transparency and GPU compositing.
* **Non-Disruptive Focus Management:** Window level set to `screen-saver` with `focusable: false` so active code editors, IDEs, terminals, and games never lose keyboard focus.
* **Dismissal Interception:** Multi-tier reaction system (`Level 0` gentle prompt through `Level 2` insistent intervention) for users who attempt to dismiss reminders repeatedly.
* **Control Dashboard:** Compact window (520×760) featuring interval configuration (5–60 min), live countdown, daily intake logging, and on-demand manual test triggers.
* **Local Persistence:** Daily hydration history and streak tracking stored locally on disk via SQLite / Dexie.js.
* **Zero Overhead Idle:** The transparent overlay remains dormant and unrendered until invoked by the timer loop.

---

## Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Electron Main Process                │
│   (Loopback HTTP Server, Process Management, Window IPC)│
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       BroadcastChannel          BroadcastChannel
                │                        │
                ▼                        ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│       Dashboard Window       │  │   Transparent Overlay Window │
│  - Timer & Schedule Controls │  │  - Fullscreen borderless      │
│  - Intake Metrics & History  │  │  - alwaysOnTop (screen-saver)│
│  - React 18 / Zustand Store  │  │  - Alpha-channel VP9 Player  │
└──────────────────────────────┘  └──────────────────────────────┘
```

### Video Pipeline (VP9 + Alpha)
Transparent rendering is achieved via WebM containers encoded with VP9 and an 8-bit alpha channel. Coordinates are synchronized via `requestAnimationFrame` against `video.currentTime`, allowing millisecond-accurate pauses and resume-points during user click events.

### Local Loopback Server
Electron's internal `file://` protocol lacks support for standard byte-range requests (`HTTP 206 Partial Content`), causing stuttering when seeking high-bitrate WebM files. The main process binds a lightweight HTTP server strictly to `127.0.0.1` on a dynamic ephemeral port to handle range requests and streaming buffer allocation.

### Window Levels & Focus Flags
The overlay window uses:
* `transparent: true`, `frame: false`, `hasShadow: false`
* `alwaysOnTop: true`, level: `'screen-saver'`
* Chromium flag: `--autoplay-policy=no-user-gesture-required` (enables audio playback on scheduled triggers without requiring initial user focus)

---

## System Requirements

* **OS:** Windows 10 or Windows 11 (64-bit)
* **Architecture:** x64
* **Memory:** 150 MB RAM (idle)
* **Disk Space:** ~250 MB installed

---

## Installation & Deployment

### Pre-Built Installer
Download the verified setup executable from releases:
* **Installer:** `LOCKIN_Setup_x64.exe` (Inno Setup 6 package with automatic silent install `/VERYSILENT` support)
* **Default Directory:** `%LOCALAPPDATA%\Programs\Water Reminder (Meme Edition)` (per-user) or `C:\Program Files` (per-machine elevated)

---

## Development Setup

### Prerequisites
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher
* Inno Setup 6 (optional, required only for compiling setup installers)

### Clone & Install
```bash
git clone https://github.com/tanmayybuilds/Creative_Water_reminder.git
cd Creative_Water_reminder
npm install
```

### Run Locally
```bash
npm run dev
```

### Build Production Deliverables
```bash
npm run build:exe
```
This script executes:
1. `tsc && vite build` — compiles TypeScript and bundles the client into `dist/`.
2. Assembles the standalone runtime into `release/bundle/`.
3. Patches the PE resources (`FileVersion`, `ProductName`, `CompanyName`, production icon) via `rcedit`.
4. Compiles `LOCKIN_Setup_x64.exe` via Inno Setup.

---

## Test Suites

The test suite validates the reminder lifecycle, finite state machine transitions, coordinate mathematics, and asset integrity:

```bash
# Run all automated tests
npm test

# Run the watcher suite during active development
npm run test:watch
```

Key test coverage:
* `tests/desktopWaterReminder.test.ts`: Timer state transitions, interval triggers, and IPC broadcast events.
* `tests/behaviorEngine.test.ts`: Dismissal counter escalation and behavioral response selection.
* `tests/movementProfiles.test.ts`: Coordinate calculation and easing curves across multiple screen resolutions.
* `tests/transparentPipeline.test.ts`: WebM alpha-channel asset presence, bitrate boundaries, and fallback handling.

---

## Repository Structure

```
Creative_Water_reminder/
├── electron/
│   ├── main.cjs                # Main process: multi-window lifecycle & loopback server
│   └── preload.cjs             # Context isolation bridge
├── installer/
│   └── LockinInstaller.iss     # Inno Setup 6 configuration
├── public/
│   ├── icon.ico                # Multi-resolution icon (16x16 to 256x256)
│   └── memes/processed/        # VP9 transparent WebM assets
├── scripts/
│   ├── package_app.cjs         # Release packaging and PE binary resource patching
│   └── process_meme.py         # Offline video rotoscoping and WebM compilation tool
├── src/
│   ├── app/                    # Root entry and mode switching (dashboard vs overlay)
│   ├── features/
│   │   ├── memes/              # Behavior engine, state stores, and fixtures
│   │   └── waterReminder/      # Core timer, overlay controls, and movement geometry
│   └── database/               # Local persistence layer
├── tests/                      # Automated TypeScript test suites
├── package.json
└── vite.config.ts
```

---

## Privacy & Security

* **No Network Egress:** The application never initiates external network requests. All HTTP traffic is bound strictly to `127.0.0.1` (local loopback) for media streaming.
* **No Telemetry:** No user analytics, error tracking, or session metrics are collected or transmitted.
* **Local Data Storage:** All daily hydration metrics and settings are stored locally on your device in standard browser IndexedDB / SQLite storage.

---

## License

This software is released under the [MIT License](LICENSE).
