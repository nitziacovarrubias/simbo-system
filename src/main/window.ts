import { BrowserWindow } from 'electron';
import { join } from 'node:path';

export function createMainWindow(): BrowserWindow {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1180,
        minHeight: 720,
        show: false,
        title: 'SIMBO',
        backgroundColor: '#293241',
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (process.env.ELECTRON_RENDERER_URL) {
        void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    return mainWindow;
}