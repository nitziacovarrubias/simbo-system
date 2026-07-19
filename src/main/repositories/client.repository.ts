import type { PrismaClient, Prisma } from '@prisma/client';

export class ClientRepository {
  constructor(private readonly db: PrismaClient) {}

  list() {
    return this.db.client.findMany({
      include: {
        person: true,
        _count: { select: { projects: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.db.client.findUnique({
      where: { id },
      include: {
        person: true,
        projects: true,
      },
    });
  }

  create(data: Prisma.ClientCreateInput) {
    return this.db.client.create({
      data,
      include: { person: true },
    });
  }

  update(id: string, data: Prisma.ClientUpdateInput) {
    return this.db.client.update({
      where: { id },
      data,
      include: { person: true },
    });
  }

  countActive() {
    return this.db.client.count({
      where: { status: 'ACTIVE' },
    });
  }
}
