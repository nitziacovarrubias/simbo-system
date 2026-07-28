import type { AlertStatus, AlertType, Prisma, PrismaClient } from '@prisma/client';

const alertInclude = {
  project: { select: { name: true } },
  activity: { select: { title: true } }
} satisfies Prisma.AlertInclude;

export type AlertRecord = Prisma.AlertGetPayload<{ include: typeof alertInclude }>;

export class AlertRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string): Promise<AlertRecord[]> {
    return this.db.alert.findMany({
      where: { projectId },
      include: alertInclude,
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }]
    });
  }

  listAll(): Promise<AlertRecord[]> {
    return this.db.alert.findMany({
      include: alertInclude,
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }]
    });
  }

  findById(id: string): Promise<AlertRecord | null> {
    return this.db.alert.findUnique({ where: { id }, include: alertInclude });
  }

  findOpenDuplicate(activityId: string, type: AlertType): Promise<AlertRecord | null> {
    return this.db.alert.findFirst({
      where: {
        activityId,
        type,
        status: { in: ['OPEN', 'IN_REVIEW'] }
      },
      include: alertInclude
    });
  }

  create(data: Prisma.AlertUncheckedCreateInput): Promise<AlertRecord> {
    return this.db.alert.create({ data, include: alertInclude });
  }

  updateStatus(
    id: string,
    status: AlertStatus,
    resolutionNotes: string,
    resolvedAt: Date
  ): Promise<AlertRecord> {
    return this.db.alert.update({
      where: { id },
      data: { status, resolutionNotes, resolvedAt },
      include: alertInclude
    });
  }
}
