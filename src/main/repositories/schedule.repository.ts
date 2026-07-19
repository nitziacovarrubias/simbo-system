import type { Prisma, PrismaClient } from '@prisma/client';

export class ScheduleRepository {
  constructor(private readonly db: PrismaClient) {}

  listActivitiesByProject(projectId: string) {
    return this.db.activity.findMany({
      where: { projectId },
      include: {
        assignedTo: { include: { person: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listUpcoming(days: number) {
    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + days);

    return this.db.activity.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: until,
        },
        status: {
          notIn: ['DONE', 'CANCELED'],
        },
      },
    });
  }

  createActivity(data: Prisma.ActivityCreateInput) {
    return this.db.activity.create({ data });
  }
}
