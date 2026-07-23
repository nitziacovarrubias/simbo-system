import { ipcMain } from 'electron';
import { z } from 'zod';
import { IPC_CHANNELS } from './ipc-channels';
import { CuttingListService } from '../services/cutting-list.service';

const idSchema = z.string().min(1);

function registerSafeHandler<TArgs extends unknown[], TResult>(
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

export function registerCuttingListIpcHandlers(): void {
  const service = new CuttingListService();

  registerSafeHandler(IPC_CHANNELS.getCuttingListsByProjectId, (projectId: string) =>
    service.getCuttingListsByProjectId(idSchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.getCuttingListById, (cuttingListId: string) =>
    service.getCuttingListById(idSchema.parse(cuttingListId))
  );
  registerSafeHandler(
    IPC_CHANNELS.generateCuttingList,
    (projectId: string, designId: string) =>
      service.generateCuttingList(idSchema.parse(projectId), idSchema.parse(designId))
  );
  registerSafeHandler(IPC_CHANNELS.updateCuttingPiece, (pieceId: string, input: unknown) =>
    service.updateCuttingPiece(idSchema.parse(pieceId), input)
  );
  registerSafeHandler(
    IPC_CHANNELS.addManualCuttingPiece,
    (cuttingListId: string, input: unknown) =>
      service.addManualCuttingPiece(idSchema.parse(cuttingListId), input)
  );
  registerSafeHandler(IPC_CHANNELS.removeCuttingPiece, (pieceId: string) =>
    service.removeCuttingPiece(idSchema.parse(pieceId))
  );
  registerSafeHandler(
    IPC_CHANNELS.authorizeCuttingList,
    (cuttingListId: string, notes?: string) =>
      service.authorizeCuttingList(idSchema.parse(cuttingListId), notes)
  );
  registerSafeHandler(
    IPC_CHANNELS.rejectCuttingList,
    (cuttingListId: string, reason: string) =>
      service.rejectCuttingList(idSchema.parse(cuttingListId), reason)
  );
  registerSafeHandler(IPC_CHANNELS.exportCuttingListToExcel, (cuttingListId: string) =>
    service.exportCuttingListToExcel(idSchema.parse(cuttingListId))
  );
}
