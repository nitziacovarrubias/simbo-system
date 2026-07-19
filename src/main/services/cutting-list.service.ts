import { CuttingListStatus } from '@prisma/client';
import { prisma } from '../database/prisma';
import { CuttingListRepository } from '../repositories/cutting-list.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { toCuttingListItem } from './mappers';
import type { CuttingListItem } from '../../shared/types';

export class CuttingListService {
  private readonly cuttingLists = new CuttingListRepository(prisma);
  private readonly history = new HistoryRepository(prisma);

  async listCuttingListsByProject(projectId: string): Promise<CuttingListItem[]> {
    const lists = await this.cuttingLists.listByProject(projectId);
    return lists.map(toCuttingListItem);
  }

  async authorizeCuttingList(cuttingListId: string, userId: string, notes?: string): Promise<void> {
    const list = await this.cuttingLists.updateStatus(cuttingListId, CuttingListStatus.AUTHORIZED, userId, notes);

    await this.history.create({
      project: { connect: { id: list.projectId } },
      user: { connect: { id: userId } },
      action: 'APPROVED',
      entityType: 'CuttingList',
      entityId: list.id,
      title: 'Despiece autorizado',
      description: notes ?? 'La lista de despiece fue autorizada.',
    });
  }
}
