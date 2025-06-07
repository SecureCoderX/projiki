const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  getWindowState: () => ipcRenderer.invoke('window-get-state'),
  
  // Window state listeners
  onWindowStateChanged: (callback) => {
    ipcRenderer.on('window-state-changed', callback);
    return () => ipcRenderer.removeListener('window-state-changed', callback);
  },
  
  onWindowFocusChanged: (callback) => {
    ipcRenderer.on('window-focus-changed', callback);
    return () => ipcRenderer.removeListener('window-focus-changed', callback);
  },
  
  // App info
  getAppInfo: () => ipcRenderer.invoke('app-get-info'),
  
  // Platform detection
  getPlatform: () => process.platform,
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
});