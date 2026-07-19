import type { Prisma, PrismaClient } from '@prisma/client';

export class AlertRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.alert.findMany({
      where: { projectId },
      orderBy: [{ resolvedAt: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  listOpen() {
    return this.db.alert.findMany({
      where: { resolvedAt: null },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  create(data: Prisma.AlertCreateInput) {
    return this.db.alert.create({ data });
  }

  markAsRead(id: string) {
    return this.db.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  resolve(id: string) {
    return this.db.alert.update({
      where: { id },
      data: {
        isRead: true,
        resolvedAt: new Date(),
      },
    });
  }
}
