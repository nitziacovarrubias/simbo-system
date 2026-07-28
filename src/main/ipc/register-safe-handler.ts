import { ipcMain } from 'electron';
import { z } from 'zod';

export function registerSafeHandler<TArgs extends unknown[], TResult>(
  channel: string,
  handler: (...args: TArgs) => Promise<TResult> | TResult
): void {
  ipcMain.handle(channel, async (_event, ...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      const message =
        error instanceof z.ZodError
          ? error.issues.map((issue) => issue.message).join(' ')
          : error instanceof Error
            ? error.message
            : 'Error desconocido';
      console.error(`IPC handler failed: ${channel}`, error);
      throw new Error(`No se pudo completar la operación: ${message}`);
    }
  });
}
