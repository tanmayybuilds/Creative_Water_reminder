# LOCKIN: Water Reminder (Meme Edition)

A high-performance Windows 10/11 desktop water reminder application that replaces easily ignorable toast notifications with animated, transparent desktop interventions, unignorable reaction clips, and persistent local hydration tracking.

[![Electron](https://img.shields.io/badge/Electron-44.0-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg)](https://vitejs.dev/)
[![Microsoft Store](https://img.shields.io/badge/Microsoft%20Store-MSIX%20x64-0078D7.svg)](https://partner.microsoft.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Why LOCKIN Exists

During long coding or gaming sessions, developers experience **notification blindness**. Standard Windows notification toasts or subtle chimes are dismissed automatically via muscle memory without taking a sip of water.

**LOCKIN** solves this by rendering a transparent walking character directly across your desktop screen at scheduled intervals. The character walks into the center of the display, unfolds a reminder banner, and walks off. If you attempt to click through or dismiss it, the application intercepts your click and plays an escalating comedic meme reaction reminding you to drink your water before resuming cleanly.

---

## Core Features

- 💧 **Unignorable Desktop Traversal:** 60 FPS transparent video overlay walking across your screen without minimizing active applications.
- ⚡ **Zero-Latency Escalation:** Click interception triggers motivational reaction memes (*"You Have To Do It!"*, *"What's Wrong With You?!"*) with exact frame-freeze and resume.
- 🛡️ **100% Offline & Privacy-First:** Zero cloud services, zero external telemetry, zero tracking. All settings and hydration intake logs are stored locally in Dexie IndexedDB.
- 🕒 **Main-Process Scheduling Engine:** Reliable timer lifecycle managed in the Electron main process, immune to background renderer throttling and resilient across system sleep/wake cycles.
- 🖥️ **Multi-Monitor & DPI Aware:** Automatically detects Windows work area geometry, accounts for taskbar docking, and anchors cleanly to your primary display.
- 🚀 **Windows Integration:** Single-instance locking (focuses existing window on duplicate launch), optional silent startup with Windows, and local rotating diagnostic logs.

---

## System Requirements

- **Operating System:** Windows 10 (Build 14316 or higher) or Windows 11 (64-bit)
- **Architecture:** x64
- **Runtime Dependencies:** None required (standalone bundled Electron runtime)

---

## Getting Started (Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm v9.0.0 or higher

### 2. Installation
```bash
git clone https://github.com/tanmayybuilds/Creative_Water_reminder.git
cd Creative_Water_reminder
npm install
```

### 3. Running in Development
Start Vite development bundler and launch the Electron application:
```bash
npm run dev
```

---

## Automated Testing

The codebase includes 15 automated unit, integration, and security test suites totaling over 1,000 passed assertions.

Run the complete test suite:
```bash
npm test
```

### Key Test Suites:
- `tests/productionHardening.test.ts`: Main process timer lifecycle, sleep/wake resync, path traversal security, multi-monitor clamping, Dexie schema v3, and single instance lock.
- `tests/desktopWaterReminder.test.ts`: Complete reminder loop, coordinate math across 1080p, 1440p, 4K, and laptop displays, single-fire guards, and interruption escalation.
- `tests/transparentPipeline.test.ts`: VP9 WebM alpha channel stream verification, audio sync (Opus), and duration checks.
- `tests/movementProfiles.test.ts`: Cubic bezier easing calculations and kinetic traversal trajectories.
- `tests/behaviorEngine.test.ts`: Multi-stage user intervention state transitions and anti-infinite-loop guards.

---

## Production Packaging & Distribution

### 1. Microsoft Store Package (MSIX / AppX)
The primary release artifact for Microsoft Store / Partner Center ingestion:

```bash
npm run build:store
```

**Artifacts Generated in `release/`:**
- `release/Water Reminder (Meme Edition) 1.0.0.appx` (224.18 MB)
- `release/LOCKIN-1.0.0-x64.msix` (224.18 MB)
- `release/checksums/SHA256SUMS.txt`
- `release/release-notes/RELEASE_NOTES_v1.0.0.md`
- `release/validation-report/WACK_STORE_REPORT.md`

### 2. Standalone Windows Setup Installer (Direct EXE)
For direct website or GitHub release distribution:

```bash
npm run build:exe
```

**Artifacts Generated:**
- `release/LOCKIN_Setup_x64.exe` (196.56 MB Setup Wizard with `/VERYSILENT` support)
- `LOCKIN_Windows_x64.zip` (Portable standalone archive)

---

## Production Architecture

For comprehensive technical specifications, refer to the documentation:
- [Production Architecture Guide](docs/ARCHITECTURE_PRODUCTION.md)
- [Production Audit & Vulnerability Report](docs/PRODUCTION_AUDIT.md)
- [Microsoft Store Submission Manual](docs/MICROSOFT_STORE_SUBMISSION.md)
- [Privacy Policy](docs/PRIVACY.md)
- [Third-Party Software & Asset Notices](docs/THIRD_PARTY_NOTICES.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

---

## License

This project is open-source and licensed under the [MIT License](LICENSE).
Media clips are utilized for transformative, non-profit satirical commentary under fair use doctrines.
