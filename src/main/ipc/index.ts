import { registerPersistenceIpcHandlers } from './persistence.ipc';
import { registerCuttingListIpcHandlers } from './cutting-list.ipc';

let handlersRegistered = false;

export function registerIpcHandlers(): void {
  if (handlersRegistered) {
    return;
  }

  registerPersistenceIpcHandlers();
  registerCuttingListIpcHandlers();
  handlersRegistered = true;
}
