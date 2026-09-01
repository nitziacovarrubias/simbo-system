import { BrowserWindow } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function createMainWindow(): BrowserWindow {
    const preloadPath = join(__dirname, '../preload/index.mjs');

    console.log('[SIMBO] __dirname:', __dirname);
    console.log('[SIMBO] preload path:', preloadPath);
    console.log('[SIMBO] preload exists:', existsSync(preloadPath));

    const mainWindow = new BrowserWindow({
        // Proporción principal utilizada en las referencias de Figma.
        width: 1536,
        height: 1024,

        // Evita que la interfaz se comprima demasiado.
        minWidth: 1180,
        minHeight: 760,

        show: false,
        center: true,
        title: 'SIMBO',

        // Mismo tono cálido utilizado como fondo del login.
        backgroundColor: '#f7f3ef',

        // La barra clásica de Electron no forma parte del diseño de SIMBO.
        autoHideMenuBar: true,

        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    // Oculta completamente el menú nativo cuando la ventana inicia.
    mainWindow.setMenuBarVisibility(false);

    mainWindow.webContents.on('preload-error', (_event, failedPreloadPath, error) => {
        console.error('[SIMBO] PRELOAD ERROR');
        console.error('[SIMBO] failed path:', failedPreloadPath);
        console.error('[SIMBO] error:', error);
    });

    mainWindow.webContents.on(
        'console-message',
        (_event, level, message, line, sourceId) => {
            console.log('[SIMBO] renderer console:', {
                level,
                message,
                line,
                sourceId
            });
        }
    );

    mainWindow.webContents.on(
        'did-fail-load',
        (_event, errorCode, errorDescription) => {
            console.error('[SIMBO] renderer failed to load:', {
                errorCode,
                errorDescription
            });
        }
    );

    mainWindow.webContents.on('render-process-gone', (_event, details) => {
        console.error('[SIMBO] renderer process gone:', details);
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (process.env.ELECTRON_RENDERER_URL) {
        console.log(
            '[SIMBO] loading renderer URL:',
            process.env.ELECTRON_RENDERER_URL
        );

        void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        const rendererPath = join(__dirname, '../renderer/index.html');

        console.log('[SIMBO] loading renderer file:', rendererPath);
        console.log('[SIMBO] renderer exists:', existsSync(rendererPath));

        void mainWindow.loadFile(rendererPath);
    }

    return mainWindow;
}