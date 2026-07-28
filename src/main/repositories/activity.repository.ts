import type { Prisma, PrismaClient } from '@prisma/client';

const activityInclude = {
  assignedUser: { include: { person: true } }
} satisfies Prisma.ActivityInclude;

export type ActivityRecord = Prisma.ActivityGetPayload<{ include: typeof activityInclude }>;

export class ActivityRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string): Promise<ActivityRecord[]> {
    return this.db.activity.findMany({
      where: { projectId },
      include: activityInclude,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }]
    });
  }

  findById(id: string): Promise<ActivityRecord | null> {
    return this.db.activity.findUnique({ where: { id }, include: activityInclude });
  }

  create(data: Prisma.ActivityUncheckedCreateInput): Promise<ActivityRecord> {
    return this.db.activity.create({ data, include: activityInclude });
  }

  update(id: string, data: Prisma.ActivityUncheckedUpdateInput): Promise<ActivityRecord> {
    return this.db.activity.update({ where: { id }, data, include: activityInclude });
  }

  delete(id: string): Promise<ActivityRecord> {
    return this.db.activity.delete({ where: { id }, include: activityInclude });
  }

  countOpenByProject(projectId: string): Promise<number> {
    return this.db.activity.count({
      where: { projectId, status: { notIn: ['DONE', 'CANCELLED'] } }
    });
  }
}
