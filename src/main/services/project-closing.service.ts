import { prisma } from '../database/prisma';
import { ActivityRepository } from '../repositories/activity.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { archiveProjectSchema, closeProjectSchema } from '../../shared/schemas';
import { UserRole } from '../../shared/constants/roles';
import type { ProjectStatus } from '../../shared/constants/domain.enums';
import type {
  ArchiveProjectInput,
  CloseProjectInput,
  ProjectClosingResult
} from '../../shared/types';

export function validateProjectClosing(
  openActivities: number,
  input: CloseProjectInput
): void {
  if (input.actorRole !== UserRole.SUPERVISOR) {
    throw new Error('Solo un supervisor puede cerrar el proyecto.');
  }
  if (openActivities > 0 && !input.confirmOpenActivities) {
    throw new Error('El proyecto tiene actividades pendientes. Confirma el cierre para continuar.');
  }
  if (openActivities > 0 && (!input.reason || input.reason.trim().length < 5)) {
    throw new Error('Escribe un motivo para cerrar el proyecto con actividades pendientes.');
  }
}

export function validateProjectArchiving(status: string, actorRole: UserRole): void {
  if (actorRole !== UserRole.SUPERVISOR) {
    throw new Error('Solo un supervisor puede archivar el proyecto.');
  }
  if (status !== 'CLOSED') {
    throw new Error('Solo se pueden archivar proyectos cerrados.');
  }
}

export class ProjectClosingService {
  constructor(
    private readonly projects = new ProjectRepository(prisma),
    private readonly activities = new ActivityRepository(prisma),
    private readonly history = new HistoryRepository(prisma)
  ) {}

  async closeProject(projectId: string, input: CloseProjectInput): Promise<ProjectClosingResult> {
    const validInput = closeProjectSchema.parse(input);
    const project = await this.projects.findById(projectId);
    if (!project) throw new Error('El proyecto solicitado no existe.');
    if (project.status === 'ARCHIVED') throw new Error('El proyecto ya está archivado.');
    if (project.status === 'CLOSED') throw new Error('El proyecto ya está cerrado.');
    const openActivities = await this.activities.countOpenByProject(projectId);
    validateProjectClosing(openActivities, validInput);

    const closedAt = new Date();
    const closed = await this.projects.close(projectId, closedAt);
    await this.history.create({
      project: { connect: { id: projectId } },
      action: 'STATUS_CHANGED',
      entityType: 'Project',
      entityId: projectId,
      title: 'Proyecto cerrado',
      description:
        openActivities > 0
          ? `Se cerró con ${openActivities} actividad(es) pendiente(s). Motivo: ${validInput.reason}`
          : validInput.reason || 'La instalación fue finalizada y el proyecto se envió al historial.'
    });
    return {
      projectId,
      status: closed.status as ProjectStatus,
      closedAt: closed.closedAt?.toISOString() ?? closedAt.toISOString(),
      archivedAt: closed.archivedAt?.toISOString() ?? null
    };
  }

  async archiveProject(
    projectId: string,
    input: ArchiveProjectInput
  ): Promise<ProjectClosingResult> {
    const validInput = archiveProjectSchema.parse(input);
    const project = await this.projects.findById(projectId);
    if (!project) throw new Error('El proyecto solicitado no existe.');
    validateProjectArchiving(project.status, validInput.actorRole);
    const archivedAt = new Date();
    const archived = await this.projects.archive(projectId, archivedAt);
    await this.history.create({
      project: { connect: { id: projectId } },
      action: 'ARCHIVED',
      entityType: 'Project',
      entityId: projectId,
      title: 'Proyecto archivado',
      description: validInput.notes || 'El proyecto cerrado se movió al historial archivado.'
    });
    return {
      projectId,
      status: archived.status as ProjectStatus,
      closedAt: archived.closedAt?.toISOString() ?? null,
      archivedAt: archived.archivedAt?.toISOString() ?? archivedAt.toISOString()
    };
  }
}
