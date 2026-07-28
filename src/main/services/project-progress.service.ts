import { prisma } from '../database/prisma';
import { ActivityRepository } from '../repositories/activity.repository';
import { AlertRepository } from '../repositories/alert.repository';
import { mapProjectActivity } from './activity.service';
import { mapProjectAlert } from './alert.service';
import { ActivityStatus } from '../../shared/constants/activity-status';
import { AlertStatus } from '../../shared/constants/alert-status';
import { AlertType } from '../../shared/constants/alert-type';
import type { ProjectActivity, ProjectAlert, ProjectProgressReport } from '../../shared/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateProjectProgressReport(
  activities: ProjectActivity[],
  alerts: ProjectAlert[],
  now = new Date()
): ProjectProgressReport {
  const openStatuses = [AlertStatus.OPEN, AlertStatus.IN_REVIEW];
  const activeAlerts = alerts.filter((alert) => openStatuses.includes(alert.status));
  const overallProgressPercent =
    activities.length === 0
      ? 0
      : Math.round(
          activities.reduce((total, activity) => total + activity.progressPercent, 0) /
            activities.length
        );
  const openActivities = activities.filter(
    (activity) => activity.status !== ActivityStatus.DONE && activity.status !== ActivityStatus.CANCELLED
  );
  const upcomingDeadlines = openActivities
    .filter((activity) => {
      const remaining = new Date(activity.dueDate).getTime() - now.getTime();
      return remaining >= 0 && remaining <= 3 * DAY_MS;
    })
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

  return {
    totalActivities: activities.length,
    pendingActivities: activities.filter((activity) => activity.status === ActivityStatus.TODO).length,
    inProgressActivities: activities.filter(
      (activity) => activity.status === ActivityStatus.IN_PROGRESS
    ).length,
    blockedActivities: activities.filter((activity) => activity.status === ActivityStatus.BLOCKED).length,
    completedActivities: activities.filter((activity) => activity.status === ActivityStatus.DONE).length,
    cancelledActivities: activities.filter(
      (activity) => activity.status === ActivityStatus.CANCELLED
    ).length,
    overallProgressPercent,
    openAlerts: activeAlerts.length,
    urgentAlerts: activeAlerts.filter((alert) => alert.priority === 'URGENT').length,
    overdueActivities: openActivities.filter(
      (activity) => new Date(activity.dueDate).getTime() < now.getTime()
    ).length,
    upcomingDeadlines,
    latestIncidents: alerts
      .filter((alert) => alert.type === AlertType.INCIDENT)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5)
  };
}

export class ProjectProgressService {
  constructor(
    private readonly activities = new ActivityRepository(prisma),
    private readonly alerts = new AlertRepository(prisma)
  ) {}

  async getProjectProgressReport(projectId: string): Promise<ProjectProgressReport> {
    const [activities, alerts] = await Promise.all([
      this.activities.listByProject(projectId),
      this.alerts.listByProject(projectId)
    ]);
    return calculateProjectProgressReport(
      activities.map(mapProjectActivity),
      alerts.map(mapProjectAlert)
    );
  }
}
