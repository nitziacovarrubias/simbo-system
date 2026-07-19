import type { Prisma, PrismaClient, QuoteStatus } from '@prisma/client';

export class QuoteRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.quote.findMany({
      where: { projectId },
      include: { items: true },
      orderBy: { version: 'desc' },
    });
  }

  findLatestByProject(projectId: string) {
    return this.db.quote.findFirst({
      where: { projectId },
      include: { items: true },
      orderBy: { version: 'desc' },
    });
  }

  create(data: Prisma.QuoteCreateInput) {
    return this.db.quote.create({
      data,
      include: { items: true },
    });
  }

  updateStatus(id: string, status: QuoteStatus, notes?: string) {
    return this.db.quote.update({
      where: { id },
      data: {
        status,
        notes,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
        rejectedAt: status === 'REJECTED' ? new Date() : undefined,
      },
    });
  }
}
