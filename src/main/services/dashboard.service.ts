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
      pendingActivitiesCount,
      overdueProjectsCount,
      productionProjectsCount,
      closedProjectsCount
    ] = await prisma.$transaction([
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: { notIn: ['CLOSED', 'ARCHIVED'] } } }),
      prisma.quote.count({ where: { status: 'PENDING' } }),
      prisma.cuttingList.count({ where: { status: 'PENDING_VALIDATION' } }),
      prisma.alert.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
      prisma.activity.count({
        where: {
          dueDate: { gte: now, lte: nextWeek },
          status: { notIn: ['DONE', 'CANCELLED'] }
        }
      }),
      prisma.activity.count({ where: { status: { in: ['TODO', 'IN_PROGRESS', 'BLOCKED'] } } }),
      prisma.project.count({
        where: {
          status: { notIn: ['CLOSED', 'ARCHIVED'] },
          activities: {
            some: { dueDate: { lt: now }, status: { notIn: ['DONE', 'CANCELLED'] } }
          }
        }
      }),
      prisma.project.count({ where: { status: 'PRODUCTION' } }),
      prisma.project.count({ where: { status: 'CLOSED' } })
    ]);

    return {
      clientsCount,
      activeProjectsCount,
      pendingQuotesCount,
      pendingCuttingListsCount,
      openAlertsCount,
      upcomingActivitiesCount,
      pendingActivitiesCount,
      overdueProjectsCount,
      productionProjectsCount,
      closedProjectsCount
    };
  }
}
