import { describe, expect, it } from 'vitest';
import { ActivityPriority } from '@shared/constants/activity-priority';
import { ActivityStage } from '@shared/constants/activity-stage';
import { ActivityStatus } from '@shared/constants/activity-status';
import { AlertPriority } from '@shared/constants/alert-priority';
import { AlertStatus } from '@shared/constants/alert-status';
import { AlertType } from '@shared/constants/alert-type';
import type { ProjectActivity, ProjectAlert } from '@shared/types';
import { calculateProjectProgressReport } from '@main/services/project-progress.service';

function activity(id: string, status: ActivityStatus, progressPercent: number, dueDate: string): ProjectActivity {
  return {
    id,
    projectId: 'project-1',
    title: `Actividad ${id}`,
    description: null,
    stage: ActivityStage.PRODUCTION,
    assignedUserId: null,
    assignedPersonName: null,
    assignedUser: null,
    startDate: '2026-07-20T12:00:00.000Z',
    dueDate,
    completedAt: status === ActivityStatus.DONE ? '2026-07-22T12:00:00.000Z' : null,
    status,
    priority: ActivityPriority.MEDIUM,
    progressPercent,
    notes: null,
    completionSuggested: false,
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-20T12:00:00.000Z'
  };
}

const incident: ProjectAlert = {
  id: 'alert-1',
  projectId: 'project-1',
  projectName: 'Proyecto demo',
  activityId: null,
  activityTitle: null,
  title: 'Material faltante',
  description: 'Falta una cubierta.',
  type: AlertType.INCIDENT,
  priority: AlertPriority.URGENT,
  status: AlertStatus.OPEN,
  dueDate: null,
  resolvedAt: null,
  resolutionNotes: null,
  createdAt: '2026-07-26T10:00:00.000Z',
  updatedAt: '2026-07-26T10:00:00.000Z'
};

describe('calculateProjectProgressReport', () => {
  it('calculates the general project progress and report counters', () => {
    const report = calculateProjectProgressReport(
      [
        activity('1', ActivityStatus.DONE, 100, '2026-07-22T12:00:00.000Z'),
        activity('2', ActivityStatus.IN_PROGRESS, 50, '2026-07-28T12:00:00.000Z'),
        activity('3', ActivityStatus.TODO, 0, '2026-07-25T12:00:00.000Z')
      ],
      [incident],
      new Date('2026-07-26T12:00:00.000Z')
    );

    expect(report.overallProgressPercent).toBe(50);
    expect(report.completedActivities).toBe(1);
    expect(report.overdueActivities).toBe(1);
    expect(report.openAlerts).toBe(1);
    expect(report.latestIncidents).toHaveLength(1);
  });
});
