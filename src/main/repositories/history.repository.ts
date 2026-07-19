import type { Prisma, PrismaClient } from '@prisma/client';

export class HistoryRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.historyEntry.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Prisma.HistoryEntryCreateInput) {
    return this.db.historyEntry.create({ data });
  }
}
