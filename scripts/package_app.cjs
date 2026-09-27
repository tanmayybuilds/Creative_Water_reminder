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
const rceditExe = path.resolve('tools/rcedit.exe');
const iconFile = path.resolve('public/icon.ico');

console.log('>>> [1/4] Preparing standalone application bundle...');

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

// 1. Copy Electron runtime binaries if electron/dist exists
if (fs.existsSync(electronDist)) {
  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }
  fs.mkdirSync(appDir, { recursive: true });
  copyRecursiveSync(electronDist, bundleDir);

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

  // Copy app files into resources/app
  copyRecursiveSync(path.resolve('electron'), path.join(appDir, 'electron'));
  copyRecursiveSync(path.resolve('dist'), path.join(appDir, 'dist'));
  copyRecursiveSync(path.resolve('public'), path.join(appDir, 'public'));
  if (fs.existsSync(iconFile)) {
    fs.copyFileSync(iconFile, path.join(appDir, 'electron/icon.ico'));
  }
  fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify({
    name: "lockin",
    version: "1.0.0",
    main: "electron/main.cjs"
  }, null, 2));
}

// Ensure icon.ico and icon.png are in bundleDir
if (fs.existsSync(iconFile) && fs.existsSync(bundleDir)) {
  fs.copyFileSync(iconFile, path.join(bundleDir, 'icon.ico'));
}
const pngFile = path.resolve('public/icon.png');
if (fs.existsSync(pngFile) && fs.existsSync(bundleDir)) {
  fs.copyFileSync(pngFile, path.join(bundleDir, 'icon.png'));
}

// 2. Patch binary with production icon and metadata using rcedit
const targetExe = path.join(bundleDir, 'LOCKIN.exe');
if (fs.existsSync(rceditExe) && fs.existsSync(targetExe) && fs.existsSync(iconFile)) {
  console.log('>>> [2/4] Embedding high-res production icon and Windows PE metadata...');
  const rcRes = spawnSync(rceditExe, [
    targetExe,
    '--set-icon', iconFile,
    '--set-version-string', 'FileDescription', 'Water Reminder (Meme Edition)',
    '--set-version-string', 'ProductName', 'Water Reminder (Meme Edition)',
    '--set-version-string', 'CompanyName', 'tanmay_chaudhary',
    '--set-version-string', 'LegalCopyright', 'Copyright (C) 2026 tanmay_chaudhary',
    '--set-version-string', 'OriginalFilename', 'LOCKIN.exe',
    '--set-file-version', '1.0.0',
    '--set-product-version', '1.0.0'
  ], { stdio: 'inherit' });
  if (rcRes.status === 0) {
    console.log('✓ Successfully embedded production icon into LOCKIN.exe');
  } else {
    console.warn('Warning: rcedit exited with code:', rcRes.status);
  }
}

// 3. Update LockinInstaller.iss with exact Partner Center App Name and Publisher
const issContent = `; Inno Setup Script for Water Reminder (Meme Edition) 64-bit Desktop Application
#define MyAppName "Water Reminder (Meme Edition)"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "tanmay_chaudhary"
#define MyAppURL "https://pulseaistudio.in"
#define MyAppExeName "LOCKIN.exe"
#define MyAppId "{{A684DF21-2D62-4C10-B147-9759F4A42C1E}"

[Setup]
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName}
UninstallDisplayName={#MyAppName}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=..\\release
OutputBaseFilename=LOCKIN_Setup_x64
SetupIconFile=..\\public\\icon.ico
UninstallDisplayIcon={app}\\icon.ico
Compression=lzma2/fast
SolidCompression=no
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=commandline
CloseApplications=no
RestartApplications=no
DisableWelcomePage=yes
DisableDirPage=auto

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
Source: "..\\release\\bundle\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\\public\\icon.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\\public\\icon.png"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; IconFilename: "{app}\\icon.ico"
Name: "{autoprograms}\\LOCKIN"; Filename: "{app}\\{#MyAppExeName}"; IconFilename: "{app}\\icon.ico"
Name: "{group}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; IconFilename: "{app}\\icon.ico"
Name: "{group}\\LOCKIN"; Filename: "{app}\\{#MyAppExeName}"; IconFilename: "{app}\\icon.ico"
Name: "{group}\\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"; IconFilename: "{app}\\icon.ico"
Name: "{autodesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; IconFilename: "{app}\\icon.ico"; Tasks: desktopicon
Name: "{autodesktop}\\LOCKIN"; Filename: "{app}\\{#MyAppExeName}"; IconFilename: "{app}\\icon.ico"; Tasks: desktopicon

[Registry]
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "DisplayName"; ValueData: "{#MyAppName}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "Publisher"; ValueData: "{#MyAppPublisher}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "DisplayVersion"; ValueData: "{#MyAppVersion}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "DisplayIcon"; ValueData: "{app}\\icon.ico"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "InstallLocation"; ValueData: "{app}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "UninstallString"; ValueData: """{app}\\unins000.exe"""; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "QuietUninstallString"; ValueData: """{app}\\unins000.exe"" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: string; ValueName: "URLInfoAbout"; ValueData: "{#MyAppURL}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: dword; ValueName: "NoModify"; ValueData: 1; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1"; ValueType: dword; ValueName: "NoRepair"; ValueData: 1; Flags: uninsdeletekey

[Run]
Filename: "{app}\\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
`;

fs.writeFileSync(issFile, issContent);

console.log('>>> [3/4] Compiling 64-Bit Setup Installer Wizard (LOCKIN_Setup_x64.exe)...');
const res = spawnSync(iscc, ['/Q', issFile], { stdio: 'inherit' });
if (res.status !== 0) {
  console.error('Inno Setup compilation failed with code:', res.status);
  process.exit(1);
}

const setupExe = path.resolve('release/LOCKIN_Setup_x64.exe');
console.log('✓ Successfully generated deliverables:');
console.log('  1. Full Setup Wizard: ' + setupExe + ' (' + (fs.statSync(setupExe).size / (1024*1024)).toFixed(2) + ' MB)');
console.log('  2. Standalone Portable Bundle: ' + bundleDir);

// Copy setup installer to root LOCKIN.exe for 1-click execution
fs.copyFileSync(setupExe, path.resolve('LOCKIN.exe'));
console.log('✓ Copied 1-click installer to root LOCKIN.exe');

// Clean up any stale installers from public/ so Vite doesn't copy them into dist/
try { fs.unlinkSync(path.resolve('public/LOCKIN.exe')); } catch (e) {}
try { fs.unlinkSync(path.resolve('public/LOCKIN_Windows_x64.zip')); } catch (e) {}

// Compress bundleDir into portable LOCKIN_Windows_x64.zip
console.log('>>> [4/4] Creating portable ZIP archive (LOCKIN_Windows_x64.zip)...');
const zipScript = `Compress-Archive -Path '${bundleDir}/*' -DestinationPath '${path.resolve('LOCKIN_Windows_x64.zip')}' -Force`;
spawnSync('powershell', ['-Command', zipScript], { stdio: 'inherit' });
console.log('✓ Portable ZIP package created successfully!');
