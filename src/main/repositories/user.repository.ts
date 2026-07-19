import type { PrismaClient } from '@prisma/client';

export class UserRepository {
  constructor(private readonly db: PrismaClient) {}

  listActive() {
    return this.db.user.findMany({
      where: { isActive: true },
      include: { person: true },
      orderBy: { username: 'asc' },
    });
  }

  findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: { person: true },
    });
  }

  findByUsername(username: string) {
    return this.db.user.findUnique({
      where: { username },
      include: { person: true },
    });
  }

  countActive() {
    return this.db.user.count({
      where: { isActive: true },
    });
  }
}
