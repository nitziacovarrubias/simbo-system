import type { PrismaClient, Prisma } from '@prisma/client';

export class DesignRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.design.findMany({
      where: { projectId },
      include: { modules: true },
      orderBy: [{ isCurrent: 'desc' }, { version: 'desc' }],
    });
  }

  findCurrentByProject(projectId: string) {
    return this.db.design.findFirst({
      where: { projectId, isCurrent: true },
      include: { modules: true },
      orderBy: { version: 'desc' },
    });
  }

  create(data: Prisma.DesignCreateInput) {
    return this.db.design.create({
      data,
      include: { modules: true },
    });
  }

  addModule(data: Prisma.DesignModuleCreateInput) {
    return this.db.designModule.create({
      data,
      include: { material: true, template: true },
    });
  }

  markPreviousDesignsAsNotCurrent(projectId: string) {
    return this.db.design.updateMany({
      where: { projectId, isCurrent: true },
      data: { isCurrent: false },
    });
  }
}
