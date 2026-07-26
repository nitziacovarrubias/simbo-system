import { registerPersistenceIpcHandlers } from './persistence.ipc';
import { registerCuttingListIpcHandlers } from './cutting-list.ipc';
import { registerQuoteIpcHandlers } from './quote.ipc';

let handlersRegistered = false;

export function registerIpcHandlers(): void {
  if (handlersRegistered) {
    return;
  }

  registerPersistenceIpcHandlers();
  registerCuttingListIpcHandlers();
  registerQuoteIpcHandlers();
  handlersRegistered = true;
}
