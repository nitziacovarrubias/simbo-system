import { app, ipcMain } from 'electron';
import type { AppInfo } from '@shared/types/domain.types';

export function registerSystemIpc(): void {
  ipcMain.handle('system:getAppInfo', (): AppInfo => {
    return {
      name: 'SIMBO',
      version: app.getVersion(),
      environment: process.env.NODE_ENV ?? 'development'
    };
  });
}
