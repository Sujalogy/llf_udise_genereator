// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // You can add more methods here as needed
  // For example:
  // saveFile: (data) => ipcRenderer.invoke('save-file', data),
  // readFile: (path) => ipcRenderer.invoke('read-file', path),
});

// Log when preload is ready
console.log('Preload script loaded successfully');