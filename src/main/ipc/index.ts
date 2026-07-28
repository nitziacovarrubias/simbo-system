import { registerPersistenceIpcHandlers } from './persistence.ipc';
import { registerCuttingListIpcHandlers } from './cutting-list.ipc';
import { registerQuoteIpcHandlers } from './quote.ipc';
import { registerScheduleIpcHandlers } from './schedule.ipc';
import { registerAlertIpcHandlers } from './alert.ipc';

let handlersRegistered = false;

export function registerIpcHandlers(): void {
  if (handlersRegistered) {
    return;
  }

  registerPersistenceIpcHandlers();
  registerCuttingListIpcHandlers();
  registerQuoteIpcHandlers();
  registerScheduleIpcHandlers();
  registerAlertIpcHandlers();
  handlersRegistered = true;
}
