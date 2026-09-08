const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const csc = 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';
const isccCandidates = [
  'C:/Users/tanma/AppData/Local/Programs/Inno Setup 6/ISCC.exe',
  'C:/Program Files (x86)/Inno Setup 6/ISCC.exe',
  'C:/Program Files/Inno Setup 6/ISCC.exe'
];
const iscc = isccCandidates.find(p => fs.existsSync(p));

const src = path.resolve(__dirname, '../src-desktop/Program.cs');
const outRelease = path.resolve(__dirname, '../release/LOCKIN.exe');
const outRoot = path.resolve(__dirname, '../LOCKIN.exe');
const icon = path.resolve(__dirname, '../src-tauri/icons/icon.ico');
const issFile = path.resolve(__dirname, '../installer/LockinInstaller.iss');

if (!fs.existsSync(path.dirname(outRelease))) {
  fs.mkdirSync(path.dirname(outRelease), { recursive: true });
}

console.log('>>> [1/2] Compiling standalone Windows x64 executable (LOCKIN.exe)...');

const cscArgs1 = [
  '/target:winexe',
  '/optimize+',
  '/platform:anycpu',
  '/win32icon:' + icon,
  '/out:' + outRelease,
  src
];
const res1 = spawnSync(csc, cscArgs1, { encoding: 'utf-8' });
if (res1.status !== 0) {
  console.error('Failed to compile release/LOCKIN.exe:', res1.stdout || res1.stderr);
  process.exit(1);
}

const cscArgs2 = [
  '/target:winexe',
  '/optimize+',
  '/platform:anycpu',
  '/win32icon:' + icon,
  '/out:' + outRoot,
  src
];
const res2 = spawnSync(csc, cscArgs2, { encoding: 'utf-8' });
if (res2.status !== 0) {
  console.error('Failed to compile root LOCKIN.exe:', res2.stdout || res2.stderr);
  process.exit(1);
}

console.log('✓ Standalone binary ready: ' + outRoot);

if (iscc) {
  console.log('>>> [2/2] Compiling Windows x64 Setup Wizard Installer (LOCKIN_Setup_x64.exe)...');
  const res3 = spawnSync(iscc, ['/Q', issFile], { stdio: 'inherit' });
  if (res3.status !== 0) {
    console.error('Inno Setup compilation failed with code:', res3.status);
    process.exit(1);
  } else {
    const setupExe = path.resolve(__dirname, '../release/LOCKIN_Setup_x64.exe');
    console.log('✓ Successfully generated 64-bit Windows Installer:');
    console.log('  -> ' + setupExe);
    console.log('  Size: ' + (fs.statSync(setupExe).size / (1024 * 1024)).toFixed(2) + ' MB');
  }
} else {
  console.warn('Note: Inno Setup ISCC.exe not found. Setup wizard compilation skipped.');
}
