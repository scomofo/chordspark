const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

let mainWindow;
let demucsProcess = null;

function getResourcePath() {
  // In production: resources are in process.resourcesPath/resources/
  // In dev: resources are in __dirname/resources/
  var prodPath = path.join(process.resourcesPath, 'resources');
  if (fs.existsSync(prodPath)) return prodPath;
  return path.join(__dirname, 'resources');
}

function getStemsDir() {
  var dir = path.join(app.getPath('userData'), 'stems');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function hashFilePath(filePath) {
  return crypto.createHash('md5').update(filePath).digest('hex').substring(0, 12);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 850,
    minWidth: 400,
    minHeight: 700,
    resizable: true,
    title: 'ChordSpark',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ===== STEM SEPARATION IPC =====

// Open file dialog for audio files
ipcMain.handle('stems:openFile', async () => {
  var result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  var filePath = result.filePaths[0];
  return { filePath: filePath, fileName: path.basename(filePath) };
});

// Check if stems are already cached for a file
ipcMain.handle('stems:checkCache', async (event, filePath) => {
  var hash = hashFilePath(filePath);
  var outputDir = path.join(getStemsDir(), hash);
  var stemNames = ['drums', 'bass', 'other', 'vocals', 'guitar', 'piano'];
  var stemPaths = {};
  var allExist = true;

  for (var i = 0; i < stemNames.length; i++) {
    var stemFile = path.join(outputDir, 'target_' + i + '_' + stemNames[i] + '.wav');
    if (fs.existsSync(stemFile)) {
      stemPaths[stemNames[i]] = stemFile;
    } else {
      allExist = false;
    }
  }

  if (allExist) return stemPaths;
  return null;
});

// Run demucs separation
ipcMain.handle('stems:separate', async (event, filePath) => {
  var resDir = getResourcePath();
  var demucsBinName = process.platform === 'win32' ? 'demucs.exe' : 'demucs';
  var demucsBin = path.join(resDir, demucsBinName);
  var modelFile = path.join(resDir, 'ggml-model-htdemucs-6s-f16.bin');

  // Check binary exists
  if (!fs.existsSync(demucsBin)) {
    throw new Error(demucsBinName + ' not found at ' + demucsBin + '. Place the compiled binary in the resources/ folder.');
  }
  if (!fs.existsSync(modelFile)) {
    throw new Error('Model file not found at ' + modelFile + '. Download ggml-model-htdemucs-6s-f16.bin from HuggingFace.');
  }

  var hash = hashFilePath(filePath);
  var outputDir = path.join(getStemsDir(), hash);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    // Spawn demucs: demucs.exe <model> <input> <output_dir> <num_threads>
    var numThreads = Math.max(1, Math.min(os.cpus().length, 8));
    demucsProcess = spawn(demucsBin, [modelFile, filePath, outputDir + path.sep, String(numThreads)], {
      windowsHide: true
    });

    var stderr = '';
    var startTime = Date.now();

    demucsProcess.stdout.on('data', (data) => {
      var line = data.toString().trim();
      if (line && mainWindow) {
        mainWindow.webContents.send('stems:progress', { type: 'stdout', line: line });
      }
    });

    demucsProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      var line = data.toString().trim();
      if (line && mainWindow) {
        // Try to extract progress from stderr output
        mainWindow.webContents.send('stems:progress', { type: 'stderr', line: line });
      }
    });

    demucsProcess.on('error', (err) => {
      demucsProcess = null;
      reject(new Error('Failed to start demucs: ' + err.message));
    });

    demucsProcess.on('close', (code) => {
      demucsProcess = null;
      if (code === 0) {
        // Collect output stem paths
        var stemNames = ['drums', 'bass', 'other', 'vocals', 'guitar', 'piano'];
        var stemPaths = {};
        for (var i = 0; i < stemNames.length; i++) {
          var stemFile = path.join(outputDir, 'target_' + i + '_' + stemNames[i] + '.wav');
          if (fs.existsSync(stemFile)) {
            stemPaths[stemNames[i]] = stemFile;
          }
        }
        var elapsed = Math.round((Date.now() - startTime) / 1000);
        resolve({ stemPaths: stemPaths, elapsed: elapsed });
      } else {
        reject(new Error('Demucs exited with code ' + code + ': ' + stderr.slice(-500)));
      }
    });
  });
});

// Cancel running demucs process
ipcMain.on('stems:cancel', () => {
  if (demucsProcess) {
    demucsProcess.kill();
    demucsProcess = null;
  }
});

// Convert file path to file:// URL for audio playback
ipcMain.handle('stems:getFileUrl', async (event, stemPath) => {
  // Convert Windows path to file URL
  var normalized = stemPath.replace(/\\/g, '/');
  if (!normalized.startsWith('/')) normalized = '/' + normalized;
  return 'file://' + normalized;
});

// ===== APP LIFECYCLE =====

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (demucsProcess) {
    demucsProcess.kill();
    demucsProcess = null;
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
