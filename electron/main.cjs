const { app, BrowserWindow, screen, ipcMain, powerMonitor, shell, Tray, Menu } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");

// =========================================================================
// 1. Production Rotating Logger
// =========================================================================
class ProductionLogger {
  constructor() {
    this.logDir = null;
    this.logFile = null;
    this.maxBytes = 2 * 1024 * 1024; // 2 MB
  }

  init() {
    try {
      this.logDir = path.join(app.getPath("userData"), "logs");
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      this.logFile = path.join(this.logDir, "lockin.log");
      this.rotateIfNeeded();
      this.info("Production Logger initialized at " + this.logFile);
    } catch (e) {
      console.error("Failed to initialize logger:", e);
    }
  }

  rotateIfNeeded() {
    if (!this.logFile || !fs.existsSync(this.logFile)) return;
    try {
      const stats = fs.statSync(this.logFile);
      if (stats.size >= this.maxBytes) {
        const backupFile = path.join(this.logDir, `lockin-${Date.now()}.log`);
        fs.renameSync(this.logFile, backupFile);
        // Clean up archives older than 3 backups
        const files = fs.readdirSync(this.logDir)
          .filter(f => f.startsWith("lockin-") && f.endsWith(".log"))
          .sort();
        while (files.length > 3) {
          const oldest = files.shift();
          fs.unlinkSync(path.join(this.logDir, oldest));
        }
      }
    } catch (e) {}
  }

  write(level, message, meta = null) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${typeof meta === "object" ? JSON.stringify(meta) : meta}` : "";
    const line = `[${timestamp}] [${level}] ${message}${metaStr}\n`;
    try {
      if (this.logFile) {
        this.rotateIfNeeded();
        fs.appendFileSync(this.logFile, line, "utf8");
      }
    } catch (e) {}
    if (level === "ERROR") {
      console.error(line.trim());
    } else {
      console.log(line.trim());
    }
  }

  info(msg, meta) { this.write("INFO", msg, meta); }
  warn(msg, meta) { this.write("WARN", msg, meta); }
  error(msg, meta) { this.write("ERROR", msg, meta); }
}

const logger = new ProductionLogger();

// =========================================================================
// 2. Single Instance Lock Enforcement
// =========================================================================
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  console.log("Another instance of LOCKIN is already running. Focusing existing instance and quitting.");
  app.quit();
  process.exit(0);
}

// Global Window, Server & Tray References
let mainWindow = null;
let overlayWindow = null;
let appTray = null;
let server = null;
let serverPort = 0;
let isQuitting = false;

// =========================================================================
// 3. Main-Process Canonical Timer Engine
// =========================================================================
class MainTimerEngine {
  constructor() {
    this.stateFile = null;
    this.state = {
      intervalMinutes: 30,
      isTimerRunning: true,
      startedAt: Date.now(),
      targetEndTime: Date.now() + 30 * 60 * 1000,
      remainingSeconds: 30 * 60,
      phase: "IDLE", // IDLE | ENTERING | CENTER_HOLD | MEME_PLAYING | COMPLETED
      totalRemindersTriggered: 0,
      totalRemindersCompleted: 0,
      interruptionCount: 0,
    };
    this.intervalHandle = null;
  }

  init() {
    this.stateFile = path.join(app.getPath("userData"), "timer-state.json");
    this.loadState();
    this.startTicker();
    logger.info("MainTimerEngine initialized with interval: " + this.state.intervalMinutes + "m");
  }

  loadState() {
    if (!this.stateFile || !fs.existsSync(this.stateFile)) return;
    try {
      const raw = fs.readFileSync(this.stateFile, "utf8");
      const loaded = JSON.parse(raw);
      if (typeof loaded.intervalMinutes === "number") {
        this.state.intervalMinutes = Math.max(1, Math.min(180, loaded.intervalMinutes));
      }
      if (typeof loaded.totalRemindersTriggered === "number") {
        this.state.totalRemindersTriggered = loaded.totalRemindersTriggered;
      }
      if (typeof loaded.totalRemindersCompleted === "number") {
        this.state.totalRemindersCompleted = loaded.totalRemindersCompleted;
      }
      // Recompute targetEndTime based on clean interval
      const now = Date.now();
      if (loaded.isTimerRunning && loaded.targetEndTime && loaded.targetEndTime > now) {
        this.state.isTimerRunning = true;
        this.state.startedAt = loaded.startedAt || now;
        this.state.targetEndTime = loaded.targetEndTime;
        this.state.remainingSeconds = Math.max(0, Math.ceil((loaded.targetEndTime - now) / 1000));
      } else {
        this.state.startedAt = now;
        this.state.targetEndTime = now + this.state.intervalMinutes * 60 * 1000;
        this.state.remainingSeconds = this.state.intervalMinutes * 60;
        this.state.isTimerRunning = true;
      }
      this.state.phase = "IDLE";
      this.state.interruptionCount = 0;
    } catch (e) {
      logger.warn("Could not read timer state file, using defaults:", e.message);
    }
  }

  saveState() {
    if (!this.stateFile) return;
    try {
      const payload = JSON.stringify({
        intervalMinutes: this.state.intervalMinutes,
        isTimerRunning: this.state.isTimerRunning,
        startedAt: this.state.startedAt,
        targetEndTime: this.state.targetEndTime,
        totalRemindersTriggered: this.state.totalRemindersTriggered,
        totalRemindersCompleted: this.state.totalRemindersCompleted,
      }, null, 2);
      fs.writeFileSync(this.stateFile, payload, "utf8");
    } catch (e) {
      logger.error("Failed to persist timer state:", e.message);
    }
  }

  startTicker() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    if (!this.state.isTimerRunning || !this.state.targetEndTime) return;
    if (this.state.phase !== "IDLE" && this.state.phase !== "COMPLETED") return;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((this.state.targetEndTime - now) / 1000));

    if (remaining <= 0) {
      this.triggerReminder();
    } else {
      this.state.remainingSeconds = remaining;
      this.broadcastState();
    }
  }

  triggerReminder() {
    if (this.state.phase !== "IDLE" && this.state.phase !== "COMPLETED") return;
    logger.info("Timer expired. Triggering desktop water reminder overlay.");
    this.state.phase = "ENTERING";
    this.state.remainingSeconds = 0;
    this.state.interruptionCount = 0;
    this.state.totalRemindersTriggered += 1;
    this.saveState();

    showOverlayWindow();
    this.broadcastState();
  }

  triggerTestReminder() {
    logger.info("Manual test reminder requested.");
    this.state.phase = "ENTERING";
    this.state.remainingSeconds = 0;
    this.state.interruptionCount = 0;
    this.state.totalRemindersTriggered += 1;
    this.saveState();

    showOverlayWindow();
    this.broadcastState();
  }

  start() {
    const now = Date.now();
    this.state.isTimerRunning = true;
    this.state.startedAt = now;
    this.state.targetEndTime = now + this.state.intervalMinutes * 60 * 1000;
    this.state.remainingSeconds = this.state.intervalMinutes * 60;
    this.saveState();
    this.broadcastState();
    logger.info("Timer started. Target:", new Date(this.state.targetEndTime).toLocaleTimeString());
  }

  stop() {
    this.state.isTimerRunning = false;
    this.state.startedAt = null;
    this.state.targetEndTime = null;
    this.saveState();
    this.broadcastState();
    logger.info("Timer paused.");
  }

  reset() {
    const now = Date.now();
    this.state.startedAt = this.state.isTimerRunning ? now : null;
    this.state.targetEndTime = this.state.isTimerRunning ? now + this.state.intervalMinutes * 60 * 1000 : null;
    this.state.remainingSeconds = this.state.intervalMinutes * 60;
    this.state.phase = "IDLE";
    this.state.interruptionCount = 0;
    hideOverlayWindow();
    this.saveState();
    this.broadcastState();
    logger.info("Timer reset to " + this.state.intervalMinutes + " minutes.");
  }

  setIntervalMinutes(mins) {
    const clean = Math.max(1, Math.min(180, Math.round(Number(mins) || 30)));
    this.state.intervalMinutes = clean;
    const now = Date.now();
    this.state.startedAt = now;
    this.state.targetEndTime = now + clean * 60 * 1000;
    this.state.remainingSeconds = clean * 60;
    this.saveState();
    this.broadcastState();
    logger.info("Timer interval set to " + clean + " minutes.");
  }

  handleInterruption() {
    if (this.state.phase === "IDLE" || this.state.phase === "COMPLETED") return;
    this.state.interruptionCount += 1;
    this.state.phase = "MEME_PLAYING";
    logger.info("Overlay interrupted. Interruption count: " + this.state.interruptionCount);
    this.broadcastState();
  }

  handleMemeFinished() {
    if (this.state.interruptionCount === 1) {
      this.state.phase = "CENTER_HOLD";
      logger.info("First interruption meme finished. Resuming center hold.");
    } else {
      this.completeSequence();
    }
    this.broadcastState();
  }

  completeSequence() {
    logger.info("Reminder sequence completed.");
    const now = Date.now();
    this.state.phase = "COMPLETED";
    this.state.totalRemindersCompleted += 1;
    this.state.interruptionCount = 0;
    this.state.isTimerRunning = true;
    this.state.startedAt = now;
    this.state.targetEndTime = now + this.state.intervalMinutes * 60 * 1000;
    this.state.remainingSeconds = this.state.intervalMinutes * 60;
    this.saveState();
    this.broadcastState();

    setTimeout(() => {
      if (this.state.phase === "COMPLETED") {
        this.state.phase = "IDLE";
        hideOverlayWindow();
        this.broadcastState();
      }
    }, 400);
  }

  handleSystemResume() {
    const now = Date.now();
    if (!this.state.isTimerRunning || !this.state.targetEndTime) return;

    if (now >= this.state.targetEndTime) {
      const missedByMs = now - this.state.targetEndTime;
      logger.info(`System woke after scheduled timer (missed by ${(missedByMs / 1000).toFixed(0)}s).`);
      // If computer was sleeping for a while, fire 1 reminder cleanly rather than a storm
      this.triggerReminder();
    } else {
      this.state.remainingSeconds = Math.max(0, Math.ceil((this.state.targetEndTime - now) / 1000));
      this.broadcastState();
      logger.info(`System resumed. Next reminder in ${this.state.remainingSeconds}s.`);
    }
  }

  broadcastState() {
    const payload = { ...this.state };
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("timer:update", payload);
    }
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send("timer:update", payload);
    }
  }
}

const timerEngine = new MainTimerEngine();

// =========================================================================
// 4. Secure Local Streaming Server (127.0.0.1, Ephemeral Port, Path Defense)
// =========================================================================
function getDistDir() {
  const candidates = [
    path.join(__dirname, "../dist"),
    path.join(__dirname, "../../dist"),
    path.join(app.getAppPath(), "dist"),
    path.join(__dirname, "dist"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "index.html"))) return path.resolve(c);
  }
  return path.resolve(path.join(__dirname, "../dist"));
}

function startSecureServer(cb) {
  const distDir = getDistDir();
  logger.info("Static file distribution root:", distDir);

  server = http.createServer((req, res) => {
    // Only permit local loopback queries
    const clientIp = req.socket.remoteAddress;
    if (clientIp !== "127.0.0.1" && clientIp !== "::1" && clientIp !== "::ffff:127.0.0.1") {
      res.writeHead(403);
      return res.end("Forbidden: Localhost Only");
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      return res.end("Method Not Allowed");
    }

    let rawUrl = req.url.split("?")[0];
    if (rawUrl === "/" || rawUrl === "") rawUrl = "/index.html";

    // Path traversal defense: decode and reject any attempt to traverse directories
    let decoded = "";
    try {
      decoded = decodeURIComponent(rawUrl);
    } catch (e) {
      res.writeHead(400);
      return res.end("Bad Request");
    }

    if (decoded.includes("..")) {
      logger.warn("Blocked potential path traversal attempt:", rawUrl);
      res.writeHead(403);
      return res.end("Forbidden");
    }

    const cleanPath = path.normalize(decoded).replace(/^[\\\/]+/, "");
    const targetPath = path.resolve(distDir, cleanPath);

    if (!targetPath.startsWith(distDir)) {
      logger.warn("Blocked potential path traversal attempt:", rawUrl);
      res.writeHead(403);
      return res.end("Forbidden");
    }

    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
      res.writeHead(404);
      return res.end("Not Found");
    }

    const ext = path.extname(targetPath).toLowerCase();
    let mime = "application/octet-stream";
    if (ext === ".html") mime = "text/html; charset=utf-8";
    else if (ext === ".js") mime = "application/javascript; charset=utf-8";
    else if (ext === ".css") mime = "text/css; charset=utf-8";
    else if (ext === ".webm") mime = "video/webm";
    else if (ext === ".mp4") mime = "video/mp4";
    else if (ext === ".png") mime = "image/png";
    else if (ext === ".ico") mime = "image/x-icon";
    else if (ext === ".woff2") mime = "font/woff2";
    else if (ext === ".json") mime = "application/json; charset=utf-8";

    const stat = fs.statSync(targetPath);
    const range = req.headers.range;

    const baseHeaders = {
      "Content-Type": mime,
      "Access-Control-Allow-Origin": "http://127.0.0.1:" + serverPort,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self' data: blob: http://127.0.0.1:*; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' data: blob: http://127.0.0.1:*; connect-src 'self' http://127.0.0.1:*; img-src 'self' data: blob:; font-src 'self' data:; object-src 'none';",
    };

    if (range && range.startsWith("bytes=")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

      if (start >= stat.size || end >= stat.size || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        return res.end();
      }

      const chunkSize = end - start + 1;
      res.writeHead(206, {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
      });

      if (req.method === "HEAD") return res.end();
      fs.createReadStream(targetPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        ...baseHeaders,
        "Content-Length": stat.size,
        "Accept-Ranges": "bytes",
      });

      if (req.method === "HEAD") return res.end();
      fs.createReadStream(targetPath).pipe(res);
    }
  });

  server.listen(0, "127.0.0.1", () => {
    serverPort = server.address().port;
    logger.info("Secure local server listening on http://127.0.0.1:" + serverPort);
    cb(serverPort);
  });

  server.on("error", (err) => {
    logger.error("Local HTTP server error:", err);
  });
}

// =========================================================================
// 5. Window Geometry & Multi-Monitor Resolution
// =========================================================================
function getPrimaryWorkArea() {
  const primary = screen.getPrimaryDisplay();
  return primary.workArea;
}

function updateOverlayBounds() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const workArea = getPrimaryWorkArea();
  logger.info("Updating overlay window bounds to primary display:", workArea);
  overlayWindow.setBounds({
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height,
  });
}

function showOverlayWindow() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  updateOverlayBounds();
  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.showInactive();
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

function hideOverlayWindow() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.hide();
}

// =========================================================================
// 6. IPC Bridge Registration
// =========================================================================
function registerIpcHandlers() {
  // Window Visibility Controls
  ipcMain.handle("window:show-overlay", () => {
    showOverlayWindow();
    return true;
  });

  ipcMain.handle("window:hide-overlay", () => {
    hideOverlayWindow();
    return true;
  });

  ipcMain.handle("window:is-overlay-visible", () => {
    return overlayWindow ? overlayWindow.isVisible() : false;
  });

  ipcMain.handle("app:quit", () => {
    logger.info("Renderer requested graceful application quit.");
    isQuitting = true;
    app.quit();
    return true;
  });

  // App Metadata & Startup Setting
  ipcMain.handle("app:get-version", () => "1.0.0");

  ipcMain.handle("app:get-startup", () => {
    try {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    } catch (e) {
      return false;
    }
  });

  ipcMain.handle("app:set-startup", (_event, enabled) => {
    try {
      app.setLoginItemSettings({
        openAtLogin: Boolean(enabled),
        args: ["--hidden"],
      });
      logger.info("Windows launch at startup set to:", Boolean(enabled));
      return true;
    } catch (e) {
      logger.error("Failed to set login item settings:", e.message);
      return false;
    }
  });

  ipcMain.handle("app:open-logs", async () => {
    try {
      const logDir = path.join(app.getPath("userData"), "logs");
      await shell.openPath(logDir);
      return true;
    } catch (e) {
      return false;
    }
  });

  // Canonical Timer IPC Endpoints
  ipcMain.handle("timer:get-state", () => timerEngine.state);
  ipcMain.handle("timer:start", () => { timerEngine.start(); return timerEngine.state; });
  ipcMain.handle("timer:stop", () => { timerEngine.stop(); return timerEngine.state; });
  ipcMain.handle("timer:reset", () => { timerEngine.reset(); return timerEngine.state; });
  ipcMain.handle("timer:set-interval", (_event, mins) => { timerEngine.setIntervalMinutes(mins); return timerEngine.state; });
  ipcMain.handle("timer:trigger-test", () => { timerEngine.triggerTestReminder(); return timerEngine.state; });
  ipcMain.handle("timer:interrupted", () => { timerEngine.handleInterruption(); return timerEngine.state; });
  ipcMain.handle("timer:meme-finished", () => { timerEngine.handleMemeFinished(); return timerEngine.state; });
  ipcMain.handle("timer:completed", () => { timerEngine.completeSequence(); return timerEngine.state; });
}

// Ensure unmuted video, GPU acceleration, and zero-latency background decoding
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("ignore-gpu-blocklist");

function getAppIconPath() {
  const candidates = [
    path.join(__dirname, "icon.ico"),
    path.join(__dirname, "../public/icon.ico"),
    path.join(__dirname, "../dist/icon.ico"),
    path.join(__dirname, "../build/icon.ico"),
    path.join(app.getAppPath(), "electron/icon.ico"),
    path.join(app.getAppPath(), "public/icon.ico"),
    path.join(app.getAppPath(), "icon.ico"),
    path.join(path.dirname(app.getPath("exe")), "icon.ico"),
    path.join(__dirname, "../public/icon.png"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

// =========================================================================
// 7. Application Startup Lifecycle
// =========================================================================
app.on("second-instance", () => {
  logger.info("Second instance launched. Restoring and focusing existing dashboard window.");
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  logger.init();
  logger.info("LOCKIN application initialized on Windows " + process.arch);

  registerIpcHandlers();

  startSecureServer((p) => {
    const workArea = getPrimaryWorkArea();
    const iconPath = getAppIconPath();
    logger.info("Using application icon from: " + iconPath);

    // 1. Dashboard Window (Interactive control panel)
    mainWindow = new BrowserWindow({
      width: 520,
      height: 760,
      minWidth: 420,
      minHeight: 640,
      title: "Water Reminder (Meme Edition)",
      icon: iconPath,
      backgroundColor: "#08080a",
      autoHideMenuBar: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, "preload.cjs"),
        additionalArguments: ["--window-type=dashboard"],
      },
    });

    if (fs.existsSync(iconPath)) {
      try { mainWindow.setIcon(iconPath); } catch (e) {}
    }

    mainWindow.loadURL(`http://127.0.0.1:${p}/index.html?mode=dashboard`);

    mainWindow.on("closed", () => {
      mainWindow = null;
      if (!isQuitting) {
        logger.info("Dashboard closed by user. Quitting application.");
        app.quit();
      }
    });

    // 2. Pure Transparent Desktop Overlay Window
    overlayWindow = new BrowserWindow({
      width: workArea.width,
      height: workArea.height,
      x: workArea.x,
      y: workArea.y,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      hasShadow: false,
      resizable: false,
      focusable: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        backgroundThrottling: false,
        preload: path.join(__dirname, "preload.cjs"),
        additionalArguments: ["--window-type=overlay"],
      },
    });

    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    overlayWindow.setAlwaysOnTop(true, "screen-saver");
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.loadURL(`http://127.0.0.1:${p}/index.html?mode=overlay`);

    overlayWindow.on("closed", () => {
      overlayWindow = null;
    });

    // 3. System Tray Notification Area Icon
    try {
      if (fs.existsSync(iconPath)) {
        appTray = new Tray(iconPath);
        const trayMenu = Menu.buildFromTemplate([
          {
            label: "Open Dashboard",
            click: () => {
              if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
              }
            },
          },
          {
            label: "Trigger Test Reminder",
            click: () => {
              timerEngine.triggerTestReminder();
            },
          },
          { type: "separator" },
          {
            label: "Quit LOCKIN",
            click: () => {
              isQuitting = true;
              app.quit();
            },
          },
        ]);
        appTray.setToolTip("LOCKIN — Water Reminder (Meme Edition)");
        appTray.setContextMenu(trayMenu);
        appTray.on("click", () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          }
        });
        logger.info("System Tray icon registered successfully.");
      }
    } catch (trayErr) {
      logger.warn("Could not initialize system tray:", trayErr.message);
    }

    // Initialize Timer Engine after server & windows ready
    timerEngine.init();

    // Listen to multi-monitor and display metric changes
    screen.on("display-metrics-changed", updateOverlayBounds);
    screen.on("display-added", updateOverlayBounds);
    screen.on("display-removed", updateOverlayBounds);

    // Listen to power state changes (sleep/wake)
    powerMonitor.on("suspend", () => {
      logger.info("System entering sleep/suspend mode.");
    });

    powerMonitor.on("resume", () => {
      logger.info("System resumed from sleep.");
      timerEngine.handleSystemResume();
    });
  });
});

// Process Crash & Exception Handlers
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception in main process:", err.stack || err.message);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection in main process:", reason);
});

app.on("render-process-gone", (_event, webContents, details) => {
  logger.error(`Render process gone (${details.reason}, exitCode: ${details.exitCode})`);
});

app.on("child-process-gone", (_event, details) => {
  logger.warn(`Child process gone (${details.type}, ${details.reason}, exitCode: ${details.exitCode})`);
});

app.on("before-quit", () => {
  isQuitting = true;
  logger.info("Application before-quit initiated.");
  if (server) {
    try { server.close(); } catch (e) {}
  }
});

app.on("window-all-closed", () => {
  logger.info("All windows closed. Quitting.");
  app.quit();
});
