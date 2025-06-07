const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let isQuitting = false;

// Window state management
const windowState = {
  width: 1600,    // Much larger default width
  height: 1000,   // Much larger default height
  x: undefined,
  y: undefined,
  isMaximized: false,
};

function createWindow() {
  // Create the browser window with enhanced settings
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 1000,   // Increased minimum width
    minHeight: 700,   // Increased minimum height
    frame: false,
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev, // Disable web security in dev for local resources
    },
    show: false,
    backgroundColor: '#0a0a0a',
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
    fullscreenable: true,
    // macOS specific
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'under-window',
  });

  // Restore window state if maximized
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }

  // Window event handlers
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus the window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Save window state on resize/move
  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('maximize', () => {
    windowState.isMaximized = true;
    mainWindow.webContents.send('window-state-changed', { isMaximized: true });
  });
  mainWindow.on('unmaximize', () => {
    windowState.isMaximized = false;
    mainWindow.webContents.send('window-state-changed', { isMaximized: false });
  });

  // Handle window focus events
  mainWindow.on('focus', () => {
    mainWindow.webContents.send('window-focus-changed', { focused: true });
  });
  
  mainWindow.on('blur', () => {
    mainWindow.webContents.send('window-focus-changed', { focused: false });
  });

  // Handle close event
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      handleAppClose();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle unresponsive window
  mainWindow.on('unresponsive', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Application Not Responding',
      message: 'Projiki is not responding. Would you like to wait or restart?',
      buttons: ['Wait', 'Restart'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 1) {
        mainWindow.reload();
      }
    });
  });

  // Handle when window becomes responsive again
  mainWindow.on('responsive', () => {
    console.log('Application is responding again');
  });
}

function saveWindowState() {
  if (!mainWindow) return;
  
  const bounds = mainWindow.getBounds();
  windowState.width = bounds.width;
  windowState.height = bounds.height;
  windowState.x = bounds.x;
  windowState.y = bounds.y;
  windowState.isMaximized = mainWindow.isMaximized();
}

function handleAppClose() {
  // Show save confirmation if needed (for future implementation)
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Close Projiki',
    message: 'Are you sure you want to close Projiki?',
    detail: 'Any unsaved changes will be automatically saved.',
    buttons: ['Cancel', 'Close'],
    defaultId: 1,
    cancelId: 0,
  }).then((result) => {
    if (result.response === 1) {
      isQuitting = true;
      app.quit();
    }
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();

  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });

  // Set app user model ID for Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.yourcompany.projiki');
  }
});

// Handle all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle before quit
app.on('before-quit', () => {
  isQuitting = true;
});

// Handle app will quit
app.on('will-quit', (event) => {
  // Save any pending data here
  console.log('App will quit - saving state...');
});

// Enhanced IPC handlers
ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
  return { success: true };
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
    return { success: true, maximized: false };
  } else {
    mainWindow?.maximize();
    return { success: true, maximized: true };
  }
});

ipcMain.handle('window-close', () => {
  handleAppClose();
  return { success: true };
});

ipcMain.handle('window-get-state', () => {
  if (!mainWindow) return null;
  
  return {
    isMaximized: mainWindow.isMaximized(),
    isMinimized: mainWindow.isMinimized(),
    isFocused: mainWindow.isFocused(),
    bounds: mainWindow.getBounds(),
  };
});

ipcMain.handle('app-get-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
  };
});

// App metadata handlers (for DataService)
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

ipcMain.handle('app:getName', () => {
  return app.getName()
})

ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name)
})

// File dialog handlers (for backup/export functionality)
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  return result
})

ipcMain.handle('dialog:saveFile', async (event, options = {}) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    ...options
  })
  
  return result
})

// Crash recovery
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  
  dialog.showErrorBox(
    'Unexpected Error',
    'An unexpected error occurred. The application will continue running, but you may want to restart it.\n\n' + error.message
  );
});