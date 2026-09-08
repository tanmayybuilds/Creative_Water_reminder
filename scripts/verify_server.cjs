const { spawn, spawnSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const csc = 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';
const src = path.resolve('src-desktop/Program.cs');
const out = path.resolve('VerifyServer.exe');

console.log('Compiling test server...');
const res = spawnSync(csc, ['/target:exe', '/out:' + out, src], { encoding: 'utf-8' });
if (res.status !== 0) {
  console.error('CSC error:', res.stdout || res.stderr);
  process.exit(1);
}

console.log('Test server compiled successfully!');
try { fs.unlinkSync(out); } catch(e){}
console.log('Verification passed: Program.cs compiles with 0 errors.');
