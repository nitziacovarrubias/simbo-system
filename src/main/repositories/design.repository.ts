import type { PrismaClient, Prisma } from '@prisma/client';

export const designDetailInclude = {
  modules: {
    include: { material: true, template: true },
    orderBy: { createdAt: 'asc' }
  },
  project: true
} satisfies Prisma.DesignInclude;

export type DesignDetailRecord = Prisma.DesignGetPayload<{
  include: typeof designDetailInclude;
}>;

export class DesignRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.design.findMany({
      where: { projectId },
      include: { modules: true },
      orderBy: [{ isCurrent: 'desc' }, { version: 'desc' }]
    });
  }

  findCurrentByProject(projectId: string) {
    return this.db.design.findFirst({
      where: { projectId, isCurrent: true },
      include: designDetailInclude,
      orderBy: { version: 'desc' }
    });
  }

  findById(id: string) {
    return this.db.design.findUnique({
      where: { id },
      include: designDetailInclude
    });
  }

  findLatestVersion(projectId: string) {
    return this.db.design.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
  }

  create(data: Prisma.DesignCreateInput) {
    return this.db.design.create({ data, include: designDetailInclude });
  }

  update(id: string, data: Prisma.DesignUpdateInput) {
    return this.db.design.update({ where: { id }, data, include: designDetailInclude });
  }

  markPreviousDesignsAsNotCurrent(projectId: string) {
    return this.db.design.updateMany({
      where: { projectId, isCurrent: true },
      data: { isCurrent: false }
    });
  }
}
