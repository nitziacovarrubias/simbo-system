import type { CuttingListStatus, Prisma, PrismaClient } from '@prisma/client';

export const cuttingListDetailInclude = {
  project: {
    include: {
      client: { include: { person: true } }
    }
  },
  design: true,
  pieces: {
    include: { material: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
  }
} satisfies Prisma.CuttingListInclude;

export type CuttingListDetailRecord = Prisma.CuttingListGetPayload<{
  include: typeof cuttingListDetailInclude;
}>;

export class CuttingListRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.cuttingList.findMany({
      where: { projectId },
      include: {
        design: true,
        _count: { select: { pieces: true } }
      },
      orderBy: { version: 'desc' }
    });
  }


  findLatestAuthorized(projectId: string) {
    return this.db.cuttingList.findFirst({
      where: { projectId, status: 'AUTHORIZED' },
      include: cuttingListDetailInclude,
      orderBy: { version: 'desc' }
    });
  }

  findLatestPendingValidation(projectId: string) {
    return this.db.cuttingList.findFirst({
      where: { projectId, status: 'PENDING_VALIDATION' },
      include: cuttingListDetailInclude,
      orderBy: { version: 'desc' }
    });
  }

  findById(id: string) {
    return this.db.cuttingList.findUnique({
      where: { id },
      include: cuttingListDetailInclude
    });
  }

  findPieceById(id: string) {
    return this.db.cuttingPiece.findUnique({
      where: { id },
      include: { cuttingList: true }
    });
  }

  findLatestVersion(projectId: string) {
    return this.db.cuttingList.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
  }

  create(data: Prisma.CuttingListCreateInput) {
    return this.db.cuttingList.create({
      data,
      include: cuttingListDetailInclude
    });
  }

  updatePiece(id: string, data: Prisma.CuttingPieceUncheckedUpdateInput) {
    return this.db.cuttingPiece.update({ where: { id }, data });
  }

  addPiece(data: Prisma.CuttingPieceUncheckedCreateInput) {
    return this.db.cuttingPiece.create({ data });
  }

  removePiece(id: string) {
    return this.db.cuttingPiece.delete({ where: { id } });
  }

  updateList(id: string, data: Prisma.CuttingListUpdateInput) {
    return this.db.cuttingList.update({ where: { id }, data });
  }

  updateStatus(id: string, status: CuttingListStatus, notes?: string) {
    return this.db.cuttingList.update({
      where: { id },
      data: {
        status,
        validationNotes: notes,
        authorizedAt: status === 'AUTHORIZED' ? new Date() : null,
        rejectedAt: status === 'REJECTED' ? new Date() : null
      }
    });
  }

  markByDesignOutdated(designId: string) {
    return this.db.cuttingList.updateMany({
      where: {
        designId,
        status: { not: 'OUTDATED' }
      },
      data: { status: 'OUTDATED' }
    });
  }

  markProjectListsOutdated(projectId: string) {
    return this.db.cuttingList.updateMany({
      where: {
        projectId,
        status: { not: 'OUTDATED' }
      },
      data: { status: 'OUTDATED' }
    });
  }
}
