import { registerPersistenceIpcHandlers } from './persistence.ipc';

let handlersRegistered = false;

export function registerIpcHandlers(): void {
  if (handlersRegistered) {
    return;
  }

  registerPersistenceIpcHandlers();
  handlersRegistered = true;
}
