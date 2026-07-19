import { prisma } from '../database/prisma';
import { HistoryRepository } from '../repositories/history.repository';
import { toHistoryEntryListItem } from './mappers';
import type { HistoryEntryListItem } from '../../shared/types';

export class HistoryService {
  private readonly history = new HistoryRepository(prisma);

  async listHistoryByProject(projectId: string): Promise<HistoryEntryListItem[]> {
    const entries = await this.history.listByProject(projectId);
    return entries.map(toHistoryEntryListItem);
  }
}
