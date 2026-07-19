import type { CuttingListStatus, Prisma, PrismaClient } from '@prisma/client';

export class CuttingListRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.cuttingList.findMany({
      where: { projectId },
      include: {
        pieces: true,
        _count: { select: { pieces: true } },
      },
      orderBy: { version: 'desc' },
    });
  }

  findLatestByProject(projectId: string) {
    return this.db.cuttingList.findFirst({
      where: { projectId },
      include: { pieces: true },
      orderBy: { version: 'desc' },
    });
  }

  create(data: Prisma.CuttingListCreateInput) {
    return this.db.cuttingList.create({
      data,
      include: { pieces: true },
    });
  }

  updateStatus(id: string, status: CuttingListStatus, userId?: string, notes?: string) {
    return this.db.cuttingList.update({
      where: { id },
      data: {
        status,
        validatedBy: userId ? { connect: { id: userId } } : undefined,
        notes,
        authorizedAt: status === 'AUTHORIZED' ? new Date() : undefined,
        rejectedAt: status === 'REJECTED' ? new Date() : undefined,
      },
    });
  }
}
