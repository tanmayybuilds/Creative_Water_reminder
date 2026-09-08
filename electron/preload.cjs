// Preload script for secure IPC bridging
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  version: '0.1.0'
});
