import type { Prisma, PrismaClient } from '@prisma/client';

const scheduleProjectInclude = {
  client: { include: { person: true } },
  quotes: { select: { status: true } }
} satisfies Prisma.ProjectInclude;

export type ScheduleProjectRecord = Prisma.ProjectGetPayload<{
  include: typeof scheduleProjectInclude;
}>;

export class ScheduleRepository {
  constructor(private readonly db: PrismaClient) {}

  findProjectContext(projectId: string): Promise<ScheduleProjectRecord | null> {
    return this.db.project.findUnique({
      where: { id: projectId },
      include: scheduleProjectInclude
    });
  }
}
