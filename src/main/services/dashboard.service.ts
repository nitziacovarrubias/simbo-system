import { prisma } from '../database/prisma';
import type { DashboardSummary } from '../../shared/types';

export class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      clientsCount,
      activeProjectsCount,
      pendingQuotesCount,
      pendingCuttingListsCount,
      openAlertsCount,
      upcomingActivitiesCount,
    ] = await prisma.$transaction([
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: { notIn: ['CLOSED', 'ARCHIVED'] } } }),
      prisma.quote.count({ where: { status: 'PENDING' } }),
      prisma.cuttingList.count({ where: { status: 'PENDING_VALIDATION' } }),
      prisma.alert.count({ where: { resolvedAt: null } }),
      prisma.activity.count({
        where: {
          dueDate: { gte: now, lte: nextWeek },
          status: { notIn: ['DONE', 'CANCELED'] },
        },
      }),
    ]);

    return {
      clientsCount,
      activeProjectsCount,
      pendingQuotesCount,
      pendingCuttingListsCount,
      openAlertsCount,
      upcomingActivitiesCount,
    };
  }
}
