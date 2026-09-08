const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");

let mainWindow = null;
let overlayWindow = null;
let server = null;
let port = 0;

function getDistDir() {
  const possibleDirs = [
    path.join(__dirname, "../dist"),
    path.join(__dirname, "../../dist"),
    path.join(app.getAppPath(), "dist"),
    path.join(__dirname, "dist"),
  ];
  for (const d of possibleDirs) {
    if (fs.existsSync(path.join(d, "index.html"))) return d;
  }
  return path.join(__dirname, "../dist");
}

// Local offline static server to serve dist/
function startServer(cb) {
  const distDir = getDistDir();
  server = http.createServer((req, res) => {
    let reqUrl = req.url.split("?")[0];
    if (reqUrl === "/") reqUrl = "/index.html";
    const filePath = path.join(distDir, reqUrl);

    // API endpoints to control transparent overlay visibility
    if (reqUrl === "/api/overlay/show" || reqUrl === "/api/window/topmost") {
      if (overlayWindow) {
        overlayWindow.showInactive();
        overlayWindow.setAlwaysOnTop(true, "screen-saver");
      }
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(JSON.stringify({ status: "shown" }));
    }

    if (reqUrl === "/api/overlay/hide" || reqUrl === "/api/window/normal") {
      if (overlayWindow) {
        overlayWindow.hide();
      }
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(JSON.stringify({ status: "hidden" }));
    }

    if (reqUrl === "/api/exit") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ status: "exiting" }));
      app.quit();
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end("Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    let mime = "application/octet-stream";
    if (ext === ".html") mime = "text/html; charset=utf-8";
    else if (ext === ".js") mime = "application/javascript; charset=utf-8";
    else if (ext === ".css") mime = "text/css; charset=utf-8";
    else if (ext === ".webm") mime = "video/webm";
    else if (ext === ".mp4") mime = "video/mp4";
    else if (ext === ".png") mime = "image/png";
    else if (ext === ".ico") mime = "image/x-icon";
    else if (ext === ".woff2") mime = "font/woff2";

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range && range.startsWith("bytes=")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": mime,
        "Access-Control-Allow-Origin": "*",
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": mime,
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });

  server.listen(0, "127.0.0.1", () => {
    port = server.address().port;
    cb(port);
  });
}

// Ensure unmuted video and audio autoplay without requiring initial user gestures in the unfocused overlay window
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

app.whenReady().then(() => {
  startServer((p) => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const workArea = primaryDisplay.workArea;
    const iconPath = fs.existsSync(path.join(__dirname, "icon.ico"))
      ? path.join(__dirname, "icon.ico")
      : path.join(__dirname, "../src-tauri/icons/icon.ico");

    // 1. Dashboard Window (The main timer control panel)
    mainWindow = new BrowserWindow({
      width: 520,
      height: 760,
      title: "LOCKIN",
      icon: iconPath,
      backgroundColor: "#08080a",
      autoHideMenuBar: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.cjs"),
      },
    });

    mainWindow.loadURL(`http://127.0.0.1:${p}/index.html?mode=dashboard`);

    mainWindow.on("closed", () => {
      mainWindow = null;
      app.quit();
    });

    // 2. Pure Transparent Desktop Overlay Window (Floats over screen work area)
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
        preload: path.join(__dirname, "preload.cjs"),
      },
    });

    overlayWindow.setAlwaysOnTop(true, "screen-saver");
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.loadURL(`http://127.0.0.1:${p}/index.html?mode=overlay`);

    overlayWindow.on("closed", () => {
      overlayWindow = null;
    });
  });
});

app.on("window-all-closed", () => {
  app.quit();
});


