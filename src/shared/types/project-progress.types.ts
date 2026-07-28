import type { ProjectActivity } from './activity.types';
import type { ProjectAlert } from './alert.types';

export interface ProjectProgressReport {
  totalActivities: number;
  pendingActivities: number;
  inProgressActivities: number;
  blockedActivities: number;
  completedActivities: number;
  cancelledActivities: number;
  overallProgressPercent: number;
  openAlerts: number;
  urgentAlerts: number;
  overdueActivities: number;
  upcomingDeadlines: ProjectActivity[];
  latestIncidents: ProjectAlert[];
}
