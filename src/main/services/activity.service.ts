import type {
  ActivityPriority as PrismaActivityPriority,
  ActivityStage as PrismaActivityStage,
  ActivityStatus as PrismaActivityStatus
} from '@prisma/client';
import { prisma } from '../database/prisma';
import { ActivityRepository, type ActivityRecord } from '../repositories/activity.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository } from '../repositories/user.repository';
import { AlertService } from './alert.service';
import { activitySchema, activityUpdateSchema } from '../../shared/schemas';
import { ActivityStatus } from '../../shared/constants/activity-status';
import type { ActivityPriority } from '../../shared/constants/activity-priority';
import type { ActivityStage } from '../../shared/constants/activity-stage';
import type { UserRole } from '../../shared/constants/roles';
import type { ActivityInput, ActivityUpdateInput, ProjectActivity } from '../../shared/types';

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function assigneeName(activity: ActivityRecord): string | null {
  const person = activity.assignedUser?.person;
  if (person) return `${person.firstName} ${person.lastName}`.trim();
  return activity.assignedUser?.username ?? null;
}

export function mapProjectActivity(activity: ActivityRecord): ProjectActivity {
  const assignedName = assigneeName(activity);
  return {
    id: activity.id,
    projectId: activity.projectId,
    title: activity.title,
    description: activity.description,
    stage: activity.stage as ActivityStage,
    assignedUserId: activity.assignedUserId,
    assignedPersonName: activity.assignedPersonName,
    assignedUser: activity.assignedUser
      ? {
          id: activity.assignedUser.id,
          fullName: assignedName ?? activity.assignedUser.username,
          role: activity.assignedUser.role as UserRole
        }
      : null,
    startDate: activity.startDate.toISOString(),
    dueDate: activity.dueDate.toISOString(),
    completedAt: activity.completedAt?.toISOString() ?? null,
    status: activity.status as ActivityStatus,
    priority: activity.priority as ActivityPriority,
    progressPercent: activity.progressPercent,
    notes: activity.notes,
    completionSuggested: activity.progressPercent === 100 && activity.status !== 'DONE',
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString()
  };
}

export function normalizeActivityProgress(
  status: ActivityStatus,
  progressPercent: number
): { status: ActivityStatus; progressPercent: number; completionSuggested: boolean } {
  if (status === ActivityStatus.DONE) {
    return { status, progressPercent: 100, completionSuggested: false };
  }
  return { status, progressPercent, completionSuggested: progressPercent === 100 };
}

export class ActivityService {
  constructor(
    private readonly activities = new ActivityRepository(prisma),
    private readonly projects = new ProjectRepository(prisma),
    private readonly users = new UserRepository(prisma),
    private readonly history = new HistoryRepository(prisma),
    private readonly alerts = new AlertService()
  ) {}

  async listByProject(projectId: string): Promise<ProjectActivity[]> {
    const records = await this.activities.listByProject(projectId);
    return records.map(mapProjectActivity);
  }

  async createActivity(projectId: string, input: ActivityInput): Promise<ProjectActivity> {
    const project = await this.projects.findById(projectId);
    if (!project) throw new Error('El proyecto solicitado no existe.');
    if (project.status === 'CLOSED' || project.status === 'ARCHIVED') {
      throw new Error('El cronograma está en modo solo lectura porque el proyecto está cerrado.');
    }

    const validInput = activitySchema.parse(input);
    if (validInput.assignedUserId && !(await this.users.findById(validInput.assignedUserId))) {
      throw new Error('El usuario responsable no existe.');
    }

    const normalized = normalizeActivityProgress(validInput.status, validInput.progressPercent);
    const created = await this.activities.create({
      projectId,
      assignedUserId: validInput.assignedUserId ?? null,
      assignedPersonName: normalizeText(validInput.assignedPersonName),
      title: validInput.title,
      description: normalizeText(validInput.description),
      stage: validInput.stage as PrismaActivityStage,
      startDate: new Date(validInput.startDate),
      dueDate: new Date(validInput.dueDate),
      completedAt: normalized.status === ActivityStatus.DONE ? new Date() : null,
      status: normalized.status as PrismaActivityStatus,
      priority: validInput.priority as PrismaActivityPriority,
      progressPercent: normalized.progressPercent,
      notes: normalizeText(validInput.notes)
    });

    await this.history.create({
      project: { connect: { id: projectId } },
      action: 'CREATED',
      entityType: 'Activity',
      entityId: created.id,
      title: 'Actividad creada',
      description: `Se creó la actividad “${created.title}”.`,
      afterJson: JSON.stringify(mapProjectActivity(created))
    });

    if (created.status === 'BLOCKED') {
      await this.alerts.createBlockedActivityAlert(created);
    }

    return mapProjectActivity(created);
  }

  async updateActivity(activityId: string, input: ActivityUpdateInput): Promise<ProjectActivity> {
    const current = await this.activities.findById(activityId);
    if (!current) throw new Error('La actividad solicitada no existe.');
    const project = await this.projects.findById(current.projectId);
    if (!project) throw new Error('El proyecto solicitado no existe.');
    if (project.status === 'CLOSED' || project.status === 'ARCHIVED') {
      throw new Error('El cronograma está en modo solo lectura porque el proyecto está cerrado.');
    }

    const partial = activityUpdateSchema.parse(input);
    const merged = activitySchema.parse({
      title: partial.title ?? current.title,
      description: partial.description === undefined ? current.description : partial.description,
      stage: partial.stage ?? current.stage,
      assignedUserId:
        partial.assignedUserId === undefined ? current.assignedUserId : partial.assignedUserId,
      assignedPersonName:
        partial.assignedPersonName === undefined
          ? current.assignedPersonName
          : partial.assignedPersonName,
      startDate: partial.startDate ?? current.startDate.toISOString(),
      dueDate: partial.dueDate ?? current.dueDate.toISOString(),
      status: partial.status ?? current.status,
      priority: partial.priority ?? current.priority,
      progressPercent: partial.progressPercent ?? current.progressPercent,
      notes: partial.notes === undefined ? current.notes : partial.notes
    });

    if (merged.assignedUserId && !(await this.users.findById(merged.assignedUserId))) {
      throw new Error('El usuario responsable no existe.');
    }

    const normalized = normalizeActivityProgress(merged.status, merged.progressPercent);
    const statusChanged = current.status !== (normalized.status as PrismaActivityStatus);
    const updated = await this.activities.update(activityId, {
      assignedUserId: merged.assignedUserId ?? null,
      assignedPersonName: normalizeText(merged.assignedPersonName),
      title: merged.title,
      description: normalizeText(merged.description),
      stage: merged.stage as PrismaActivityStage,
      startDate: new Date(merged.startDate),
      dueDate: new Date(merged.dueDate),
      completedAt:
        normalized.status === ActivityStatus.DONE
          ? current.completedAt ?? new Date()
          : current.status === 'DONE'
            ? null
            : current.completedAt,
      status: normalized.status as PrismaActivityStatus,
      priority: merged.priority as PrismaActivityPriority,
      progressPercent: normalized.progressPercent,
      notes: normalizeText(merged.notes)
    });

    await this.history.create({
      project: { connect: { id: current.projectId } },
      action: statusChanged ? 'STATUS_CHANGED' : 'UPDATED',
      entityType: 'Activity',
      entityId: updated.id,
      title: statusChanged ? 'Estado de actividad actualizado' : 'Actividad actualizada',
      description: statusChanged
        ? `La actividad “${updated.title}” cambió de ${current.status} a ${updated.status}.`
        : `Se actualizó la actividad “${updated.title}”.`,
      beforeJson: JSON.stringify(mapProjectActivity(current)),
      afterJson: JSON.stringify(mapProjectActivity(updated))
    });

    if (current.status !== 'BLOCKED' && updated.status === 'BLOCKED') {
      await this.alerts.createBlockedActivityAlert(updated);
    }

    return mapProjectActivity(updated);
  }

  async deleteActivity(activityId: string): Promise<{ id: string; projectId: string }> {
    const current = await this.activities.findById(activityId);
    if (!current) throw new Error('La actividad solicitada no existe.');
    const project = await this.projects.findById(current.projectId);
    if (project?.status === 'CLOSED' || project?.status === 'ARCHIVED') {
      throw new Error('El cronograma está en modo solo lectura porque el proyecto está cerrado.');
    }

    await this.activities.delete(activityId);
    await this.history.create({
      project: { connect: { id: current.projectId } },
      action: 'UPDATED',
      entityType: 'Activity',
      entityId: current.id,
      title: 'Actividad eliminada',
      description: `Se eliminó la actividad “${current.title}”.`,
      beforeJson: JSON.stringify(mapProjectActivity(current))
    });
    return { id: current.id, projectId: current.projectId };
  }
}
