import type { PrismaClient, Prisma } from '@prisma/client';

export class RenderRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.render.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
  }

  create(data: Prisma.RenderCreateInput) {
    return this.db.render.create({ data });
  }

  update(id: string, data: Prisma.RenderUpdateInput) {
    return this.db.render.update({
      where: { id },
      data,
    });
  }
}
