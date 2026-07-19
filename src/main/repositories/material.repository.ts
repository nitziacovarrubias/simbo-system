import type { PrismaClient, Prisma } from '@prisma/client';

export class MaterialRepository {
  constructor(private readonly db: PrismaClient) {}

  listActive() {
    return this.db.material.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  findById(id: string) {
    return this.db.material.findUnique({
      where: { id },
    });
  }

  create(data: Prisma.MaterialCreateInput) {
    return this.db.material.create({ data });
  }

  update(id: string, data: Prisma.MaterialUpdateInput) {
    return this.db.material.update({
      where: { id },
      data,
    });
  }
}
