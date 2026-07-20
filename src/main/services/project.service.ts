import { ProjectStatus as PrismaProjectStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import { ClientRepository } from '../repositories/client.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { projectSchema, roomSpaceSchema } from '../../shared/schemas';
import { ProjectStatus } from '../../shared/constants/domain.enums';
import { toProjectDetail, toProjectListItem } from './mappers';
import { prepareRoomSpaceForSave } from './room-space.service';
import type {
  ProjectDetail,
  ProjectListItem,
  ProjectMutationInput,
  RoomSpaceInput
} from '../../shared/types';

export type ProjectRepositoryPort = Pick<
  ProjectRepository,
  'list' | 'findById' | 'create' | 'update' | 'saveRoomSpace' | 'updateStatus'
>;
export type ProjectClientRepositoryPort = Pick<ClientRepository, 'findById'>;
export type ProjectHistoryRepositoryPort = Pick<HistoryRepository, 'create'>;

function normalizeNullable(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function projectSnapshot(project: {
  name: string;
  clientId: string;
  location: string | null;
  description: string | null;
  status: string;
  startDate: Date;
  deliveryDate: Date | null;
}): string {
  return JSON.stringify({
    name: project.name,
    clientId: project.clientId,
    location: project.location,
    description: project.description,
    status: project.status,
    startDate: project.startDate.toISOString(),
    deliveryDate: project.deliveryDate?.toISOString() ?? null
  });
}

export class ProjectService {
  constructor(
    private readonly projects: ProjectRepositoryPort = new ProjectRepository(prisma),
    private readonly clients: ProjectClientRepositoryPort = new ClientRepository(prisma),
    private readonly history: ProjectHistoryRepositoryPort = new HistoryRepository(prisma)
  ) {}

  async listProjects(): Promise<ProjectListItem[]> {
    const projects = await this.projects.list();
    return projects.map(toProjectListItem);
  }

  async getProjectById(projectId: string): Promise<ProjectDetail> {
    const project = await this.projects.findById(projectId);
    if (!project) {
      throw new Error('El proyecto solicitado no existe.');
    }

    return toProjectDetail(project);
  }

  async createProject(input: ProjectMutationInput): Promise<ProjectDetail> {
    const validInput = projectSchema.parse(input);
    const client = await this.clients.findById(validInput.clientId);
    if (!client) {
      throw new Error('El cliente seleccionado no existe.');
    }

    const project = await this.projects.create({
      name: validInput.name,
      clientId: validInput.clientId,
      location: normalizeNullable(validInput.location),
      description: normalizeNullable(validInput.description),
      status: PrismaProjectStatus.DRAFT,
      startDate: new Date(validInput.startDate),
      deliveryDate: validInput.deliveryDate ? new Date(validInput.deliveryDate) : null
    });

    await this.history.create({
      project: { connect: { id: project.id } },
      action: 'CREATED',
      entityType: 'Project',
      entityId: project.id,
      title: 'Proyecto creado',
      description: 'Se creó el expediente inicial del proyecto.',
      afterJson: projectSnapshot(project)
    });

    return this.getProjectById(project.id);
  }

  async updateProject(projectId: string, input: ProjectMutationInput): Promise<ProjectDetail> {
    const current = await this.projects.findById(projectId);
    if (!current) {
      throw new Error('El proyecto solicitado no existe.');
    }

    const validInput = projectSchema.parse(input);
    const client = await this.clients.findById(validInput.clientId);
    if (!client) {
      throw new Error('El cliente seleccionado no existe.');
    }

    const updated = await this.projects.update(projectId, {
      name: validInput.name,
      clientId: validInput.clientId,
      location: normalizeNullable(validInput.location),
      description: normalizeNullable(validInput.description),
      status: validInput.status as PrismaProjectStatus,
      startDate: new Date(validInput.startDate),
      deliveryDate: validInput.deliveryDate ? new Date(validInput.deliveryDate) : null
    });

    await this.history.create({
      project: { connect: { id: projectId } },
      action: current.status === updated.status ? 'UPDATED' : 'STATUS_CHANGED',
      entityType: 'Project',
      entityId: projectId,
      title:
        current.status === updated.status
          ? 'Proyecto actualizado'
          : 'Estado del proyecto actualizado',
      description: 'Se modificaron los datos generales del proyecto.',
      beforeJson: projectSnapshot(current),
      afterJson: projectSnapshot(updated)
    });

    return this.getProjectById(projectId);
  }

  async saveProjectRoomSpace(projectId: string, input: RoomSpaceInput): Promise<ProjectDetail> {
    const current = await this.projects.findById(projectId);
    if (!current) {
      throw new Error('El proyecto solicitado no existe.');
    }

    const validInput = roomSpaceSchema.parse(input);
    const roomSpace = prepareRoomSpaceForSave(validInput, current.roomSpaceJson);
    const nextStatus =
      current.status === ProjectStatus.DRAFT
        ? PrismaProjectStatus.DESIGN
        : (current.status as PrismaProjectStatus);

    await this.projects.saveRoomSpace(projectId, JSON.stringify(roomSpace), nextStatus);

    const historyInput: Prisma.HistoryEntryCreateInput = {
      project: { connect: { id: projectId } },
      action: 'UPDATED',
      entityType: 'ProjectRoomSpace',
      entityId: projectId,
      title: current.roomSpaceJson ? 'Medidas actualizadas' : 'Medidas capturadas',
      description:
        'Se guardaron las medidas del espacio y el proyecto quedó preparado para diseño.',
      beforeJson: current.roomSpaceJson,
      afterJson: JSON.stringify(roomSpace)
    };
    await this.history.create(historyInput);

    return this.getProjectById(projectId);
  }

  async closeProject(projectId: string, userId?: string): Promise<void> {
    const project = await this.projects.updateStatus(projectId, PrismaProjectStatus.CLOSED);
    await this.history.create({
      project: { connect: { id: project.id } },
      user: userId ? { connect: { id: userId } } : undefined,
      action: 'STATUS_CHANGED',
      entityType: 'Project',
      entityId: project.id,
      title: 'Proyecto cerrado',
      description: 'El proyecto cambió a estado cerrado.'
    });
  }
}
