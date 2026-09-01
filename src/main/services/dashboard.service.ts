import { prisma } from '../database/prisma';
import type { DashboardSummary } from '../../shared/types';

export class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    const now = new Date();

    // Se usa el inicio del día para no marcar como retrasado
    // un proyecto que todavía debe entregarse hoy.
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // El indicador del dashboard muestra entregas pendientes
    // desde hoy hasta el final de la semana actual.
    const endOfWeek = new Date(startOfToday);
    const daysUntilSunday = (7 - endOfWeek.getDay()) % 7;

    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);

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
      prisma.client.count({
        where: {
          status: 'ACTIVE'
        }
      }),

      // Proyectos activos mostrados en el panel principal.
      prisma.project.count({
        where: {
          status: {
            notIn: ['CLOSED', 'ARCHIVED']
          }
        }
      }),

      prisma.quote.count({
        where: {
          status: 'PENDING'
        }
      }),

      prisma.cuttingList.count({
        where: {
          status: 'PENDING_VALIDATION'
        }
      }),

      prisma.alert.count({
        where: {
          status: {
            in: ['OPEN', 'IN_REVIEW']
          }
        }
      }),

      // Conserva el nombre actual por compatibilidad con DashboardSummary.
      // Ahora representa proyectos por entregar esta semana.
      prisma.project.count({
        where: {
          status: {
            notIn: ['CLOSED', 'ARCHIVED']
          },
          deliveryDate: {
            gte: startOfToday,
            lte: endOfWeek
          }
        }
      }),

      prisma.activity.count({
        where: {
          status: {
            in: ['TODO', 'IN_PROGRESS', 'BLOCKED']
          }
        }
      }),

      // Un proyecto se considera retrasado cuando su fecha de entrega
      // ya pasó y todavía no está cerrado ni archivado.
      prisma.project.count({
        where: {
          status: {
            notIn: ['CLOSED', 'ARCHIVED']
          },
          deliveryDate: {
            lt: startOfToday
          }
        }
      }),

      prisma.project.count({
        where: {
          status: 'PRODUCTION'
        }
      }),

      prisma.project.count({
        where: {
          status: 'CLOSED'
        }
      })
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