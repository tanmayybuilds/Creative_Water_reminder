const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const electronDist = path.resolve('node_modules/electron/dist');
const bundleDir = path.resolve('release/bundle');
const appDir = path.join(bundleDir, 'resources/app');
const possibleIscc = [
  path.join(process.env.LOCALAPPDATA || '', 'Programs/Inno Setup 6/ISCC.exe'),
  'C:/Program Files (x86)/Inno Setup 6/ISCC.exe',
  'C:/Program Files/Inno Setup 6/ISCC.exe',
];
const iscc = possibleIscc.find(p => fs.existsSync(p)) || possibleIscc[0];
const issFile = path.resolve('installer/LockinInstaller.iss');

console.log('>>> [1/3] Preparing standalone application bundle...');

if (fs.existsSync(bundleDir)) {
  fs.rmSync(bundleDir, { recursive: true, force: true });
}
fs.mkdirSync(appDir, { recursive: true });

// 1. Copy Electron runtime binaries
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(electronDist, bundleDir);

// Rename electron.exe -> LOCKIN.exe inside bundle
const oldExe = path.join(bundleDir, 'electron.exe');
const newExe = path.join(bundleDir, 'LOCKIN.exe');
if (fs.existsSync(oldExe)) {
  if (fs.existsSync(newExe)) {
    try { fs.unlinkSync(newExe); } catch (e) {}
  }
  try {
    fs.renameSync(oldExe, newExe);
  } catch (e) {
    fs.copyFileSync(oldExe, newExe);
    try { fs.unlinkSync(oldExe); } catch (e) {}
  }
}

// 2. Copy app files into resources/app
copyRecursiveSync(path.resolve('electron'), path.join(appDir, 'electron'));
copyRecursiveSync(path.resolve('dist'), path.join(appDir, 'dist'));
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify({
  name: "lockin",
  version: "0.1.0",
  main: "electron/main.cjs"
}, null, 2));

console.log('✓ Standalone bundle created at:', bundleDir);

// 3. Update LockinInstaller.iss to package the bundle
const issContent = `; Inno Setup Script for LOCKIN 64-bit Desktop Application
#define MyAppName "LOCKIN"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "LOCKIN"
#define MyAppURL "https://github.com/tanmayybuilds/Creative_Water_reminder"
#define MyAppExeName "LOCKIN.exe"

[Setup]
AppId={{A684DF21-2D62-4C10-B147-9759F4A42C1E}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={localappdata}\\Programs\\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=..\\release
OutputBaseFilename=LOCKIN_Setup_x64
SetupIconFile=..\\src-tauri\\icons\\icon.ico
UninstallDisplayIcon={app}\\{#MyAppExeName}
Compression=lzma2/fast
SolidCompression=no
WizardStyle=modern
PrivilegesRequired=lowest
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
Source: "..\\release\\bundle\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
Name: "{group}\\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
`;

fs.writeFileSync(issFile, issContent);

console.log('>>> [2/3] Compiling 64-Bit Setup Installer Wizard (LOCKIN_Setup_x64.exe)...');
const res = spawnSync(iscc, ['/Q', issFile], { stdio: 'inherit' });
if (res.status !== 0) {
  console.error('Inno Setup compilation failed with code:', res.status);
  process.exit(1);
}

const setupExe = path.resolve('release/LOCKIN_Setup_x64.exe');
console.log('✓ [3/3] Successfully generated deliverables:');
console.log('  1. Full Setup Wizard: ' + setupExe + ' (' + (fs.statSync(setupExe).size / (1024*1024)).toFixed(2) + ' MB)');
console.log('  2. Standalone Portable Bundle: ' + bundleDir);

// Copy setup installer to root LOCKIN.exe for 1-click execution
fs.copyFileSync(setupExe, path.resolve('LOCKIN.exe'));
console.log('✓ Copied 1-click installer to LOCKIN.exe');

// Clean up any stale installers from public/ so Vite doesn't copy them into dist/
try { fs.unlinkSync(path.resolve('public/LOCKIN.exe')); } catch (e) {}
try { fs.unlinkSync(path.resolve('public/LOCKIN_Windows_x64.zip')); } catch (e) {}

// Compress bundleDir into portable LOCKIN_Windows_x64.zip
console.log('>>> [4/4] Creating portable ZIP archive (LOCKIN_Windows_x64.zip)...');
const zipScript = `Compress-Archive -Path '${bundleDir}/*' -DestinationPath '${path.resolve('LOCKIN_Windows_x64.zip')}' -Force`;
spawnSync('powershell', ['-Command', zipScript], { stdio: 'inherit' });
console.log('✓ Portable ZIP package created successfully!');

