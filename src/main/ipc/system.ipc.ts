import { app, ipcMain } from 'electron';
import type { AppInfo } from '@shared/types/simbo-api.types';

export function registerSystemIpc(): void {
    ipcMain.handle('system:getAppInfo', (): AppInfo => {
        return {
            name: 'SIMBO',
            version: app.getVersion(),
            platform: process.platform
        };
    });
}