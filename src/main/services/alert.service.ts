import type {
  AlertPriority as PrismaAlertPriority,
  AlertStatus as PrismaAlertStatus,
  AlertType as PrismaAlertType
} from '@prisma/client';
import { prisma } from '../database/prisma';
import { ActivityRepository, type ActivityRecord } from '../repositories/activity.repository';
import { AlertRepository, type AlertRecord } from '../repositories/alert.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { alertResolutionSchema, incidentAlertSchema } from '../../shared/schemas';
import { AlertPriority } from '../../shared/constants/alert-priority';
import type { AlertStatus as SharedAlertStatus } from '../../shared/constants/alert-status';
import type { AlertType as SharedAlertType } from '../../shared/constants/alert-type';
import { AlertStatus } from '../../shared/constants/alert-status';
import { AlertType } from '../../shared/constants/alert-type';
import type {
  GenerateProjectAlertsResult,
  IncidentAlertInput,
  ProjectAlert
} from '../../shared/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function mapProjectAlert(alert: AlertRecord): ProjectAlert {
  return {
    id: alert.id,
    projectId: alert.projectId,
    projectName: alert.project.name,
    activityId: alert.activityId,
    activityTitle: alert.activity?.title ?? null,
    title: alert.title,
    description: alert.description,
    type: alert.type as SharedAlertType,
    priority: alert.priority as AlertPriority,
    status: alert.status as SharedAlertStatus,
    dueDate: alert.dueDate?.toISOString() ?? null,
    resolvedAt: alert.resolvedAt?.toISOString() ?? null,
    resolutionNotes: alert.resolutionNotes,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString()
  };
}

export function shouldCreateAutomaticAlert(hasOpenDuplicate: boolean): boolean {
  return !hasOpenDuplicate;
}

export interface AutomaticAlertCandidate {
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
}

export function getAutomaticAlertCandidate(
  activity: Pick<ActivityRecord, 'title' | 'status' | 'dueDate'>,
  now = new Date()
): AutomaticAlertCandidate | null {
  if (activity.status === 'DONE' || activity.status === 'CANCELLED') {
    return null;
  }
  const remaining = activity.dueDate.getTime() - now.getTime();
  if (remaining < 0) {
    return {
      type: AlertType.OVERDUE,
      priority: AlertPriority.URGENT,
      title: 'Actividad vencida',
      description: `La actividad “${activity.title}” superó su fecha límite.`
    };
  }
  if (remaining <= 3 * DAY_MS) {
    return {
      type: AlertType.DUE_SOON,
      priority: AlertPriority.HIGH,
      title: 'Fecha próxima',
      description: `La actividad “${activity.title}” vence en los próximos 3 días.`
    };
  }
  return null;
}

export class AlertService {
  constructor(
    private readonly alerts = new AlertRepository(prisma),
    private readonly activities = new ActivityRepository(prisma),
    private readonly projects = new ProjectRepository(prisma),
    private readonly history = new HistoryRepository(prisma)
  ) {}

  async getAlertsByProjectId(projectId: string): Promise<ProjectAlert[]> {
    return (await this.alerts.listByProject(projectId)).map(mapProjectAlert);
  }

  async getAllAlerts(): Promise<ProjectAlert[]> {
    return (await this.alerts.listAll()).map(mapProjectAlert);
  }

  async generateProjectAlerts(projectId: string, now = new Date()): Promise<GenerateProjectAlertsResult> {
    if (!(await this.projects.findById(projectId))) throw new Error('El proyecto solicitado no existe.');
    const activities = await this.activities.listByProject(projectId);
    let createdCount = 0;

    for (const activity of activities) {
      const candidate = getAutomaticAlertCandidate(activity, now);
      if (!candidate) continue;
      const duplicate = await this.alerts.findOpenDuplicate(
        activity.id,
        candidate.type as PrismaAlertType
      );
      if (!shouldCreateAutomaticAlert(Boolean(duplicate))) continue;

      const created = await this.alerts.create({
        projectId,
        activityId: activity.id,
        title: candidate.title,
        description: candidate.description,
        type: candidate.type as PrismaAlertType,
        priority: candidate.priority as PrismaAlertPriority,
        status: AlertStatus.OPEN as PrismaAlertStatus,
        dueDate: activity.dueDate
      });
      createdCount += 1;
      await this.history.create({
        project: { connect: { id: projectId } },
        action: 'CREATED',
        entityType: 'Alert',
        entityId: created.id,
        title: 'Alerta generada',
        description: `${candidate.title}: ${activity.title}.`
      });
    }

    return { createdCount, alerts: await this.getAlertsByProjectId(projectId) };
  }

  async createBlockedActivityAlert(activity: ActivityRecord): Promise<ProjectAlert> {
    const duplicate = await this.alerts.findOpenDuplicate(activity.id, 'BLOCKED_ACTIVITY');
    if (duplicate) return mapProjectAlert(duplicate);
    const created = await this.alerts.create({
      projectId: activity.projectId,
      activityId: activity.id,
      title: 'Actividad bloqueada',
      description: `La actividad “${activity.title}” cambió a estado bloqueado.`,
      type: 'BLOCKED_ACTIVITY',
      priority: activity.priority === 'URGENT' ? 'URGENT' : 'HIGH',
      status: 'OPEN' as PrismaAlertStatus,
      dueDate: activity.dueDate
    });
    await this.history.create({
      project: { connect: { id: activity.projectId } },
      action: 'CREATED',
      entityType: 'Alert',
      entityId: created.id,
      title: 'Alerta por actividad bloqueada',
      description: `Se generó una alerta para “${activity.title}”.`
    });
    return mapProjectAlert(created);
  }

  async createIncidentAlert(projectId: string, input: IncidentAlertInput): Promise<ProjectAlert> {
    if (!(await this.projects.findById(projectId))) throw new Error('El proyecto solicitado no existe.');
    const validInput = incidentAlertSchema.parse(input);
    const created = await this.alerts.create({
      projectId,
      title: validInput.title,
      description: validInput.description,
      type: 'INCIDENT' as PrismaAlertType,
      priority: validInput.priority as PrismaAlertPriority,
      status: 'OPEN' as PrismaAlertStatus,
      dueDate: validInput.dueDate ? new Date(validInput.dueDate) : null
    });
    await this.history.create({
      project: { connect: { id: projectId } },
      action: 'CREATED',
      entityType: 'Alert',
      entityId: created.id,
      title: 'Incidencia registrada',
      description: validInput.title
    });
    return mapProjectAlert(created);
  }

  async resolveAlert(alertId: string, notes: string): Promise<ProjectAlert> {
    return this.finishAlert(alertId, notes, AlertStatus.RESOLVED);
  }

  async dismissAlert(alertId: string, notes: string): Promise<ProjectAlert> {
    return this.finishAlert(alertId, notes, AlertStatus.DISMISSED);
  }

  private async finishAlert(
    alertId: string,
    notes: string,
    status: AlertStatus.RESOLVED | AlertStatus.DISMISSED
  ): Promise<ProjectAlert> {
    const current = await this.alerts.findById(alertId);
    if (!current) throw new Error('La alerta solicitada no existe.');
    if (current.status === 'RESOLVED' || current.status === 'DISMISSED') {
      throw new Error('La alerta ya fue atendida.');
    }
    const validInput = alertResolutionSchema.parse({ notes });
    const updated = await this.alerts.updateStatus(
      alertId,
      status as PrismaAlertStatus,
      validInput.notes,
      new Date()
    );
    await this.history.create({
      project: { connect: { id: current.projectId } },
      action: 'STATUS_CHANGED',
      entityType: 'Alert',
      entityId: current.id,
      title: status === AlertStatus.RESOLVED ? 'Alerta resuelta' : 'Alerta descartada',
      description: validInput.notes
    });
    return mapProjectAlert(updated);
  }
}
