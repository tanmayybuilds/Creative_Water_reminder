# LOCKIN: Creative Water Reminder

A desktop water reminder application for developers and creators that replaces easily ignorable system notifications with animated, transparent desktop interventions.

[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Why I Built This

Like many developers, I regularly enter long periods of deep focus where I lose track of time. Hours pass while debugging or writing code, and I frequently forget to drink water.

I tried several existing water reminder tools, but they all suffered from the same core problem: notification blindness. Standard Windows desktop notifications or quiet chimes are too easy to dismiss without thinking. After a few days, muscle memory takes over and you close the toast without ever leaving your chair or taking a sip.

I wanted something that actually gets my attention without being a generic corporate popup. LOCKIN solves this by displaying a transparent video character that walks directly across the screen, displays a reminder banner in the center, and walks off. If you try to dismiss it by clicking the screen, the app intercepts your click and plays a humorous reaction clip reminding you to actually drink your water.

## How It Works

The application operates in a recurring cycle (defaulting to 30 minutes, customizable from 5 to 60 minutes).

### 1. The Screen Traversal
When the reminder interval triggers:
* A transparent overlay appears over the desktop without minimizing or interrupting whatever application you are currently using.
* The character enters from the right side of the screen, walking toward the center using a smooth cubic ease-in-out curve.
* At the center of the screen, the character pauses and unfolds a reminder banner: "Drink Water Now".
* After a short pause, the character continues walking off the left edge of the screen, and the overlay closes automatically.

### 2. The Interruption Handler
If you attempt to bypass the reminder by clicking the screen:
* First click: The walking animation freezes at its exact screen coordinate and video frame. An overlay clip opens in the center of the screen ("You Have To Do It!"). Once the clip finishes, the walking character unpauses from the exact spot and completes its walk.
* Second click: If you click a second time during the same session, it triggers a second reaction clip ("What's Wrong With You?!"), resets the timer, and updates your session logs.

### 3. The Control Dashboard
A dedicated dashboard window allows you to:
* Adjust the reminder interval (presets from 5 to 60 minutes, or custom intervals).
* View a live countdown to the next reminder.
* Track daily water consumption against a target goal.
* Trigger a manual test reminder at any time to preview the animation.

## Architecture and Technical Decisions

### Multi-Window Electron Setup
The app runs on Electron and is split into two distinct windows:
1. Dashboard Window: A standard 520x760 window providing controls, timer status, and intake tracking.
2. Overlay Window: A full-screen, borderless, transparent window positioned across the entire primary display work area. It is configured with `alwaysOnTop: true` and `level: 'screen-saver'` so it renders above all other applications, including code editors and terminals.

### Transparent Video Pipeline (VP9 with Alpha Channel)
To achieve a character walking directly on the desktop without an ugly background box, I encoded the video assets using VP9 WebM with a native 8-bit alpha channel.
* The video player uses CSS hardware transforms (`transform: translateZ(0)`) to ensure smooth 60 FPS rendering on modern GPUs.
* Playback coordinates are calculated via `requestAnimationFrame` and synced directly with `video.currentTime`. This allows the application to pause and resume at the exact sub-second timestamp and screen coordinate if the user clicks to interrupt.

### Local Embedded HTTP Streaming Server
Windows file protocol (`file://`) can cause buffering and range request limitations when seeking through WebM video files in Electron. To solve this, I added a lightweight internal Node.js HTTP server inside `electron/main.cjs`.
* It binds to an ephemeral local port on `127.0.0.1`.
* It handles HTTP 206 partial content range requests (`Content-Range` and `Accept-Ranges`), enabling instant scrubbing and zero-delay video decoding.

### Inter-Process Communication
To keep the dashboard and the overlay synchronized without heavy IPC boilerplate, the application uses the standard `BroadcastChannel` API (`lockin_water_channel`). When a timer completes or a test trigger is pressed in the dashboard, the event is immediately received by the overlay window to initiate the animation sequence.

### Chromium Autoplay Handling
Chromium normally blocks media with audio from playing without prior user gesture, which would prevent background reminders from sounding when the overlay window is not focused. I configured the Electron main process with the `--autoplay-policy=no-user-gesture-required` command line switch, ensuring that reminders play reliably on schedule.

## Tech Stack

* Runtime: Electron 33
* Frontend: React 18, TypeScript, Tailwind CSS
* State Management: Zustand
* Animation: Framer Motion, requestAnimationFrame
* Local Storage: SQLite / Dexie.js for persistent daily hydration logs
* Build Tooling: Vite 8, Inno Setup 6 (Windows installer generation)
* Testing: Vitest and custom TypeScript integration test suites

## Getting Started

### Prerequisites
* Windows 10 or 11 (64-bit)
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher
* Optional: Inno Setup 6 (required only if you want to compile the standalone installer executable)

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/tanmayybuilds/Creative_Water_reminder.git
cd Creative_Water_reminder
npm install
```

### Running in Development
Start the Vite development server and launch the Electron application:

```bash
npm run dev
```

## Testing

The project includes unit and integration tests covering the reminder state machine, coordinate math, interruption escalation, and video timing logic.

To run all automated test suites:

```bash
npm test
```

To run the reminder watcher in watch mode:

```bash
npm run test:watch
```

Test suites cover:
* `tests/desktopWaterReminder.test.ts`: Complete lifecycle of the reminder loop, timer states, and event dispatching.
* `tests/behaviorEngine.test.ts`: User interaction handling and interruption mechanics.
* `tests/movementProfiles.test.ts`: Coordinate calculation and easing curves across varying display resolutions.
* `tests/transparentPipeline.test.ts`: Validation of WebM transparent video assets and fallback handling.

## Packaging and Building

To build the production bundle and generate the standalone Windows installer:

```bash
npm run build:exe
```

This script performs three automated steps:
1. Runs the TypeScript compiler and builds the optimized Vite client in `dist/`.
2. Assembles the standalone application bundle with the Electron runtime inside `release/bundle/`.
3. Compiles the Inno Setup script (`installer/LockinInstaller.iss`) into a production installer located at `release/LOCKIN_Setup_x64.exe`.

## Project Structure

```
Creative_Water_reminder/
├── electron/
│   ├── main.cjs                # Main process (multi-window setup, HTTP server, flags)
│   └── preload.cjs             # Preload script
├── installer/
│   └── LockinInstaller.iss     # Inno Setup installer script
├── public/
│   └── memes/
│       └── processed/          # Transparent VP9 WebM video clips and reaction media
├── scripts/
│   └── package_app.cjs         # Packaging script for building standalone bundle and installer
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root component (handles dashboard vs overlay mode)
│   │   └── globals.css         # Styling and custom layout utilities
│   ├── components/             # Reusable UI components
│   ├── features/
│   │   └── waterReminder/      # Core reminder logic
│   │       ├── waterReminderStore.ts      # Zustand state store and timer logic
│   │       ├── waterReminderOverlay.tsx    # Transparent overlay and interruption component
│   │       ├── waterReminderCard.tsx       # Dashboard controls and countdown card
│   │       ├── waterReminderPosition.ts   # Screen geometry and movement easing
│   │       └── CartoonTextUnfold.tsx      # Center banner animation
│   └── database/
│       └── db.ts               # Local SQLite database initialization
├── tests/                      # Automated test suites
├── package.json
└── vite.config.ts
```

## Key Challenges and What I Learned

1. Window Transparency on Windows: Creating an Electron window that is both transparent and click-through when inactive, but capable of capturing input during interaction, requires careful management of `alwaysOnTop` levels (`screen-saver`) and window visibility states.
2. WebM Alpha Channel Performance: Early iterations tried using canvas pixel manipulation or green screen keying in JavaScript, which was CPU heavy. Moving to natively encoded VP9 WebM with 8-bit alpha channels allowed direct GPU compositing at 60 FPS with negligible CPU overhead while idling.
3. Accurate Resume Positioning: When an interruption clip plays, the walking character must freeze immediately. Tying the horizontal position calculation to `requestAnimationFrame` and reading `video.currentTime` allowed the app to freeze the character in place and resume without visual jumping.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
