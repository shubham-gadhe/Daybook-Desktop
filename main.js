const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('node:path');

const APP_ID = 'com.shubhamgadhe.daybook';
app.setAppUserModelId(APP_ID);

function createWindow() {
  const win = new BrowserWindow({
    name: 'daybook-main-window',
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 650,
    show: false,
    backgroundColor: '#EDF1F0',
    autoHideMenuBar: true,
    title: 'Daybook',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== `file://${path.resolve(__dirname, 'index.html').replace(/\\/g, '/')}` && !url.startsWith('file://')) {
      event.preventDefault();
      if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
