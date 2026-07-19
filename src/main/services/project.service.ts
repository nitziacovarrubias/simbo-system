import { ProjectStatus } from '@prisma/client';
import { prisma } from '../database/prisma';
import { ProjectRepository } from '../repositories/project.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { toProjectListItem } from './mappers';
import type { ProjectListItem } from '../../shared/types';

export class ProjectService {
  private readonly projects = new ProjectRepository(prisma);
  private readonly history = new HistoryRepository(prisma);

  async listProjects(): Promise<ProjectListItem[]> {
    const projects = await this.projects.list();
    return projects.map(toProjectListItem);
  }

  async closeProject(projectId: string, userId?: string): Promise<void> {
    // Se guarda historial para poder consultar el cierre después.
    const project = await this.projects.updateStatus(projectId, ProjectStatus.CLOSED);
    await this.history.create({
      project: { connect: { id: project.id } },
      user: userId ? { connect: { id: userId } } : undefined,
      action: 'STATUS_CHANGED',
      entityType: 'Project',
      entityId: project.id,
      title: 'Proyecto cerrado',
      description: 'El proyecto cambió a estado cerrado.',
    });
  }
}
