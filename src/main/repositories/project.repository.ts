import type { PrismaClient, Prisma, ProjectStatus } from '@prisma/client';

export class ProjectRepository {
  constructor(private readonly db: PrismaClient) {}

  list() {
    return this.db.project.findMany({
      include: {
        client: { include: { person: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.db.project.findUnique({
      where: { id },
      include: {
        client: { include: { person: true } },
        designs: true,
        renders: true,
        cuttingLists: true,
        quotes: true,
        activities: true,
        alerts: true,
        documents: true,
        historyEntries: true,
      },
    });
  }

  create(data: Prisma.ProjectCreateInput) {
    return this.db.project.create({
      data,
      include: { client: { include: { person: true } } },
    });
  }

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return this.db.project.update({
      where: { id },
      data,
      include: { client: { include: { person: true } } },
    });
  }

  updateStatus(id: string, status: ProjectStatus) {
    return this.db.project.update({
      where: { id },
      data: {
        status,
        closedAt: status === 'CLOSED' ? new Date() : undefined,
        archivedAt: status === 'ARCHIVED' ? new Date() : undefined,
      },
    });
  }

  countActive() {
    return this.db.project.count({
      where: {
        status: {
          notIn: ['CLOSED', 'ARCHIVED'],
        },
      },
    });
  }
}
