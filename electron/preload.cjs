// Preload script for secure, isolated IPC bridging
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  isOverlayWindow: process.argv.includes('--window-type=overlay'),
  platform: process.platform,
  version: '1.0.0',

  // Window Controls
  showOverlay: () => ipcRenderer.invoke('window:show-overlay'),
  hideOverlay: () => ipcRenderer.invoke('window:hide-overlay'),
  isOverlayVisible: () => ipcRenderer.invoke('window:is-overlay-visible'),
  quitApp: () => ipcRenderer.invoke('app:quit'),

  // Application Settings & Metadata
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getStartupStatus: () => ipcRenderer.invoke('app:get-startup'),
  setStartupStatus: (enabled) => ipcRenderer.invoke('app:set-startup', enabled),
  openLogsFolder: () => ipcRenderer.invoke('app:open-logs'),

  // Main-Process Canonical Timer
  getTimerState: () => ipcRenderer.invoke('timer:get-state'),
  startTimer: () => ipcRenderer.invoke('timer:start'),
  stopTimer: () => ipcRenderer.invoke('timer:stop'),
  resetTimer: () => ipcRenderer.invoke('timer:reset'),
  setIntervalMinutes: (mins) => ipcRenderer.invoke('timer:set-interval', mins),
  triggerTestReminder: () => ipcRenderer.invoke('timer:trigger-test'),
  handleUserInterruption: () => ipcRenderer.invoke('timer:interrupted'),
  handleMemeFinished: () => ipcRenderer.invoke('timer:meme-finished'),
  handleSequenceCompleted: () => ipcRenderer.invoke('timer:completed'),

  // Live Timer Events Subscription
  onTimerUpdate: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('timer:update', handler);
    return () => ipcRenderer.removeListener('timer:update', handler);
  },
});
