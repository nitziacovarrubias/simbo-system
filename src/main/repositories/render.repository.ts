import type { Prisma, PrismaClient, RenderStatus } from '@prisma/client';

export const renderDetailInclude = {
  project: {
    include: {
      client: { include: { person: true } }
    }
  },
  design: {
    include: {
      modules: {
        include: { material: true, template: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  },
  createdBy: { include: { person: true } }
} satisfies Prisma.RenderInclude;

export type RenderDetailRecord = Prisma.RenderGetPayload<{
  include: typeof renderDetailInclude;
}>;

export class RenderRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.render.findMany({
      where: { projectId },
      include: {
        design: {
          select: { id: true, version: true, updatedAt: true }
        }
      },
      orderBy: { version: 'desc' }
    });
  }

  findById(id: string) {
    return this.db.render.findUnique({
      where: { id },
      include: renderDetailInclude
    });
  }

  findLatestVersion(projectId: string) {
    return this.db.render.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
  }

  create(data: Prisma.RenderCreateInput) {
    return this.db.render.create({ data, include: renderDetailInclude });
  }

  update(id: string, data: Prisma.RenderUpdateInput) {
    return this.db.render.update({
      where: { id },
      data,
      include: renderDetailInclude
    });
  }

  updateStatus(id: string, status: RenderStatus, failureMessage?: string | null) {
    return this.db.render.update({
      where: { id },
      data: { status, failureMessage: failureMessage ?? null },
      include: renderDetailInclude
    });
  }
}
