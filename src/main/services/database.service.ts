import { getDatabaseStatus } from '../database/prisma';

export class DatabaseService {
  getStatus() {
    return getDatabaseStatus();
  }
}
