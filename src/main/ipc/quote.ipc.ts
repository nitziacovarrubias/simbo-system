import { ipcMain } from 'electron';
import { z } from 'zod';
import { IPC_CHANNELS } from './ipc-channels';
import { QuoteService } from '../services/quote.service';

const idSchema = z.string().min(1);
const optionalIdSchema = z.string().min(1).optional();

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

export function registerQuoteIpcHandlers(): void {
  const service = new QuoteService();

  registerSafeHandler(IPC_CHANNELS.getQuotesByProjectId, (projectId: string) =>
    service.getQuotesByProjectId(idSchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.getQuoteById, (quoteId: string) =>
    service.getQuoteById(idSchema.parse(quoteId))
  );
  registerSafeHandler(
    IPC_CHANNELS.generateQuote,
    (projectId: string, cuttingListId?: string) =>
      service.generateQuote(idSchema.parse(projectId), optionalIdSchema.parse(cuttingListId))
  );
  registerSafeHandler(IPC_CHANNELS.updateQuoteItem, (quoteItemId: string, input: unknown) =>
    service.updateQuoteItem(idSchema.parse(quoteItemId), input)
  );
  registerSafeHandler(IPC_CHANNELS.addQuoteItem, (quoteId: string, input: unknown) =>
    service.addQuoteItem(idSchema.parse(quoteId), input)
  );
  registerSafeHandler(IPC_CHANNELS.removeQuoteItem, (quoteItemId: string) =>
    service.removeQuoteItem(idSchema.parse(quoteItemId))
  );
  registerSafeHandler(IPC_CHANNELS.updateQuoteAdjustments, (quoteId: string, input: unknown) =>
    service.updateQuoteAdjustments(idSchema.parse(quoteId), input)
  );
  registerSafeHandler(IPC_CHANNELS.approveQuote, (quoteId: string, notes?: string) =>
    service.approveQuote(idSchema.parse(quoteId), notes)
  );
  registerSafeHandler(IPC_CHANNELS.rejectQuote, (quoteId: string, reason: string) =>
    service.rejectQuote(idSchema.parse(quoteId), reason)
  );
  registerSafeHandler(IPC_CHANNELS.exportQuoteToExcel, (quoteId: string) =>
    service.exportQuoteToExcel(idSchema.parse(quoteId))
  );
}
