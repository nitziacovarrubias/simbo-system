import type { Prisma, PrismaClient } from '@prisma/client';

export class DocumentRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.document.findMany({
      where: { projectId },
      orderBy: [{ stage: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(data: Prisma.DocumentCreateInput) {
    return this.db.document.create({ data });
  }
}
