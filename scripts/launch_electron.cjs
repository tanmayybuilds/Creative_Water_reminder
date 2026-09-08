const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

console.log('Testing electron launch with electron/main.cjs...');
const mainJs = path.resolve('electron/main.cjs');
const proc = spawn(electron, [mainJs], { detached: true, stdio: 'ignore' });
proc.unref();
console.log('Launched Electron app with PID:', proc.pid);
