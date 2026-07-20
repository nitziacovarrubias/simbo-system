import type { Prisma, PrismaClient, ProjectStatus } from '@prisma/client';

const projectListInclude = {
  client: { include: { person: true } },
  activities: {
    where: { assignedToId: { not: null } },
    include: { assignedTo: { include: { person: true } } },
    orderBy: { updatedAt: 'desc' as const },
    take: 1
  }
} satisfies Prisma.ProjectInclude;

const projectDetailInclude = {
  client: { include: { person: true } },
  activities: {
    include: { assignedTo: { include: { person: true } } },
    orderBy: { updatedAt: 'desc' as const }
  },
  historyEntries: {
    orderBy: { createdAt: 'desc' as const }
  }
} satisfies Prisma.ProjectInclude;

export type ProjectListRecord = Prisma.ProjectGetPayload<{ include: typeof projectListInclude }>;
export type ProjectDetailRecord = Prisma.ProjectGetPayload<{
  include: typeof projectDetailInclude;
}>;

export interface ProjectPersistenceInput {
  name: string;
  clientId: string;
  location: string | null;
  description: string | null;
  status: ProjectStatus;
  startDate: Date;
  deliveryDate: Date | null;
}

export class ProjectRepository {
  constructor(private readonly db: PrismaClient) {}

  list(): Promise<ProjectListRecord[]> {
    return this.db.project.findMany({
      include: projectListInclude,
      orderBy: { updatedAt: 'desc' }
    });
  }

  findById(id: string): Promise<ProjectDetailRecord | null> {
    return this.db.project.findUnique({
      where: { id },
      include: projectDetailInclude
    });
  }

  create(input: ProjectPersistenceInput): Promise<ProjectDetailRecord> {
    return this.db.project.create({
      data: {
        name: input.name,
        location: input.location,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        deliveryDate: input.deliveryDate,
        client: { connect: { id: input.clientId } }
      },
      include: projectDetailInclude
    });
  }

  update(id: string, input: ProjectPersistenceInput): Promise<ProjectDetailRecord> {
    return this.db.project.update({
      where: { id },
      data: {
        name: input.name,
        location: input.location,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        deliveryDate: input.deliveryDate,
        client: { connect: { id: input.clientId } }
      },
      include: projectDetailInclude
    });
  }

  saveRoomSpace(
    id: string,
    roomSpaceJson: string,
    status: ProjectStatus
  ): Promise<ProjectDetailRecord> {
    return this.db.project.update({
      where: { id },
      data: { roomSpaceJson, status },
      include: projectDetailInclude
    });
  }

  updateStatus(id: string, status: ProjectStatus) {
    return this.db.project.update({
      where: { id },
      data: {
        status,
        closedAt: status === 'CLOSED' ? new Date() : undefined,
        archivedAt: status === 'ARCHIVED' ? new Date() : undefined
      }
    });
  }

  countActive(): Promise<number> {
    return this.db.project.count({
      where: {
        status: {
          notIn: ['CLOSED', 'ARCHIVED']
        }
      }
    });
  }
}
