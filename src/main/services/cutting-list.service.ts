import type { CuttingListStatus, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import {
  CuttingListRepository,
  type CuttingListDetailRecord
} from '../repositories/cutting-list.repository';
import { DesignRepository } from '../repositories/design.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { MaterialRepository } from '../repositories/material.repository';
import {
  authorizeCuttingListSchema,
  cuttingPieceInputSchema,
  updateCuttingPieceSchema
} from '../../shared/schemas/cutting-list.schema';
import type {
  CuttingListDetail,
  CuttingListExportResult,
  CuttingListSummary,
  CuttingPiece,
  CuttingPieceInput
} from '../../shared/types';
import { CuttingListExportService } from './cutting-list-export.service';
import { CuttingListGeneratorService } from './cutting-list-generator.service';
import {
  assertCuttingListCanBeAuthorized,
  assertCuttingListCanBeEdited,
  assertDesignCanGenerateCuttingList,
  calculateMaterialSummary,
  getNextCuttingListVersion,
  validateRejectReason
} from './cutting-list.utils';

function mapPiece(piece: CuttingListDetailRecord['pieces'][number]): CuttingPiece {
  return {
    id: piece.id,
    cuttingListId: piece.cuttingListId,
    sourceModuleId: piece.sourceModuleId,
    sourceModuleName: piece.sourceModuleName,
    pieceName: piece.pieceName,
    category: piece.category,
    quantity: piece.quantity,
    materialId: piece.materialId,
    materialName: piece.materialName,
    thicknessMm: piece.thicknessMm,
    widthMm: piece.widthMm,
    heightMm: piece.heightMm,
    depthMm: piece.depthMm,
    grainDirection: piece.grainDirection as CuttingPiece['grainDirection'],
    edgeBanding: piece.edgeBanding as CuttingPiece['edgeBanding'],
    comments: piece.comments ?? '',
    isManual: piece.isManual,
    sortOrder: piece.sortOrder,
    createdAt: piece.createdAt.toISOString(),
    updatedAt: piece.updatedAt.toISOString()
  };
}

function isOutdated(list: {
  status: CuttingListStatus;
  generatedAt: Date;
  design: { updatedAt: Date } | null;
}): boolean {
  return list.status === 'OUTDATED' || Boolean(list.design && list.design.updatedAt > list.generatedAt);
}

function mapSummary(
  list: Awaited<ReturnType<CuttingListRepository['listByProject']>>[number],
  latestVersion: number
): CuttingListSummary {
  return {
    id: list.id,
    projectId: list.projectId,
    designId: list.designId,
    versionNumber: list.version,
    designVersion: list.designVersion,
    status: list.status as CuttingListSummary['status'],
    piecesCount: list._count.pieces,
    generatedAt: list.generatedAt.toISOString(),
    authorizedAt: list.authorizedAt?.toISOString() ?? null,
    rejectedAt: list.rejectedAt?.toISOString() ?? null,
    exportedAt: list.exportedAt?.toISOString() ?? null,
    isLatestVersion: list.version === latestVersion,
    isDesignOutdated: isOutdated(list),
    updatedAt: list.updatedAt.toISOString()
  };
}

function mapDetail(list: CuttingListDetailRecord, latestVersion: number): CuttingListDetail {
  const pieces = list.pieces.map(mapPiece);
  return {
    id: list.id,
    projectId: list.projectId,
    designId: list.designId,
    versionNumber: list.version,
    designVersion: list.designVersion,
    status: list.status as CuttingListDetail['status'],
    piecesCount: pieces.length,
    generatedAt: list.generatedAt.toISOString(),
    authorizedAt: list.authorizedAt?.toISOString() ?? null,
    rejectedAt: list.rejectedAt?.toISOString() ?? null,
    exportedAt: list.exportedAt?.toISOString() ?? null,
    isLatestVersion: list.version === latestVersion,
    isDesignOutdated: isOutdated(list),
    updatedAt: list.updatedAt.toISOString(),
    projectName: list.project.name,
    clientName: `${list.project.client.person.firstName} ${list.project.client.person.lastName}`.trim(),
    designTitle: list.design?.title ?? null,
    designStatus: list.design?.status ?? null,
    notes: list.notes ?? '',
    validationNotes: list.validationNotes ?? '',
    exportPath: list.exportPath,
    pieces,
    materialSummary: calculateMaterialSummary(pieces)
  };
}

function pieceCreateData(
  input: CuttingPieceInput,
  isManual: boolean
): Prisma.CuttingPieceUncheckedCreateWithoutCuttingListInput {
  return {
    sourceModuleId: input.sourceModuleId ?? null,
    sourceModuleName: input.sourceModuleName,
    pieceName: input.pieceName,
    category: input.category,
    quantity: input.quantity,
    materialId: input.materialId ?? null,
    materialName: input.materialName,
    thicknessMm: input.thicknessMm,
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    depthMm: input.depthMm ?? null,
    grainDirection: input.grainDirection,
    edgeBanding: input.edgeBanding,
    comments: input.comments ?? null,
    isManual,
    sortOrder: input.sortOrder ?? 0
  };
}

export class CuttingListService {
  private readonly cuttingLists = new CuttingListRepository(prisma);
  private readonly designs = new DesignRepository(prisma);
  private readonly materials = new MaterialRepository(prisma);
  private readonly history = new HistoryRepository(prisma);
  private readonly generator = new CuttingListGeneratorService();
  private readonly exporter: CuttingListExportService;

  constructor(exporter = new CuttingListExportService()) {
    this.exporter = exporter;
  }

  async getCuttingListsByProjectId(projectId: string): Promise<CuttingListSummary[]> {
    const lists = await this.cuttingLists.listByProject(projectId);
    const latestVersion = lists[0]?.version ?? 0;
    return lists.map((list) => mapSummary(list, latestVersion));
  }

  async listCuttingListsByProject(projectId: string): Promise<CuttingListSummary[]> {
    return this.getCuttingListsByProjectId(projectId);
  }

  async getCuttingListById(cuttingListId: string): Promise<CuttingListDetail> {
    const list = await this.cuttingLists.findById(cuttingListId);
    if (!list) throw new Error('No se encontró la lista de despiece.');
    const latest = await this.cuttingLists.findLatestVersion(list.projectId);
    return mapDetail(list, latest?.version ?? list.version);
  }

  async generateCuttingList(projectId: string, designId: string): Promise<CuttingListDetail> {
    const design = await this.designs.findById(designId);
    if (!design || design.projectId !== projectId || !design.isCurrent) {
      throw new Error('No se encontró el diseño vigente del proyecto.');
    }

    assertDesignCanGenerateCuttingList({
      modulesCount: design.modules.length,
      hasCollisions: design.modules.some((module) => module.hasCollision)
    });

    const activeMaterials = await this.materials.listActive();
    const generated = this.generator.generate({ modules: design.modules, materials: activeMaterials });
    if (generated.pieces.length === 0) {
      throw new Error('El diseño no generó piezas de madera. Agrega un módulo fabricable.');
    }

    const latest = await this.cuttingLists.findLatestVersion(projectId);
    const version = getNextCuttingListVersion(latest?.version);
    const list = await this.cuttingLists.create({
      project: { connect: { id: projectId } },
      design: { connect: { id: designId } },
      version,
      designVersion: design.version,
      status: 'PENDING_VALIDATION',
      generatedAt: new Date(),
      notes: generated.observations.join('\n') || null,
      pieces: {
        create: generated.pieces.map((piece) => pieceCreateData(piece, false))
      }
    });

    await prisma.quote.updateMany({
      where: { projectId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });

    await this.history.create({
      project: { connect: { id: projectId } },
      action: version === 1 ? 'CREATED' : 'UPDATED',
      entityType: 'CuttingList',
      entityId: list.id,
      title: version === 1 ? 'Lista de despiece generada' : 'Nueva versión de despiece generada',
      description: `Se generó la versión ${version} con ${list.pieces.length} conceptos.`
    });

    return mapDetail(list, version);
  }

  async updateCuttingPiece(pieceId: string, input: unknown): Promise<CuttingListDetail> {
    const current = await this.cuttingLists.findPieceById(pieceId);
    if (!current) throw new Error('No se encontró la pieza.');
    assertCuttingListCanBeEdited(current.cuttingList.status);
    const validInput = updateCuttingPieceSchema.parse(input);

    await this.cuttingLists.updatePiece(pieceId, {
      ...validInput,
      comments: validInput.comments ?? undefined
    });
    await this.cuttingLists.updateList(current.cuttingListId, {
      status: 'PENDING_VALIDATION',
      validationNotes: null,
      rejectedAt: null
    });
    await prisma.quote.updateMany({
      where: { cuttingListId: current.cuttingListId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });
    await this.history.create({
      project: { connect: { id: current.cuttingList.projectId } },
      action: 'UPDATED',
      entityType: 'CuttingPiece',
      entityId: pieceId,
      title: 'Pieza de despiece editada',
      description: `Se editó la pieza ${current.pieceName}.`
    });
    return this.getCuttingListById(current.cuttingListId);
  }

  async addManualCuttingPiece(cuttingListId: string, input: unknown): Promise<CuttingListDetail> {
    const list = await this.cuttingLists.findById(cuttingListId);
    if (!list) throw new Error('No se encontró la lista de despiece.');
    assertCuttingListCanBeEdited(list.status);
    const validInput = cuttingPieceInputSchema.parse(input);

    await this.cuttingLists.addPiece({
      cuttingListId,
      ...pieceCreateData(validInput, true)
    });
    await this.cuttingLists.updateList(cuttingListId, {
      status: 'PENDING_VALIDATION',
      validationNotes: null,
      rejectedAt: null
    });
    await prisma.quote.updateMany({
      where: { cuttingListId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });
    await this.history.create({
      project: { connect: { id: list.projectId } },
      action: 'CREATED',
      entityType: 'CuttingPiece',
      title: 'Pieza manual agregada',
      description: `Se agregó manualmente la pieza ${validInput.pieceName}.`
    });
    return this.getCuttingListById(cuttingListId);
  }

  async removeCuttingPiece(pieceId: string): Promise<CuttingListDetail> {
    const current = await this.cuttingLists.findPieceById(pieceId);
    if (!current) throw new Error('No se encontró la pieza.');
    assertCuttingListCanBeEdited(current.cuttingList.status);
    await this.cuttingLists.removePiece(pieceId);
    await this.cuttingLists.updateList(current.cuttingListId, {
      status: 'PENDING_VALIDATION',
      validationNotes: null,
      rejectedAt: null
    });
    await prisma.quote.updateMany({
      where: { cuttingListId: current.cuttingListId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });
    await this.history.create({
      project: { connect: { id: current.cuttingList.projectId } },
      action: 'UPDATED',
      entityType: 'CuttingPiece',
      entityId: pieceId,
      title: 'Pieza eliminada del despiece',
      description: `Se eliminó la pieza ${current.pieceName}.`
    });
    return this.getCuttingListById(current.cuttingListId);
  }

  async authorizeCuttingList(cuttingListId: string, notes?: string): Promise<CuttingListDetail> {
    const list = await this.getCuttingListById(cuttingListId);
    const validNotes = authorizeCuttingListSchema.parse({ notes }).notes;
    assertCuttingListCanBeAuthorized(list.pieces, list.isDesignOutdated);
    await this.cuttingLists.updateStatus(cuttingListId, 'AUTHORIZED', validNotes);
    await this.history.create({
      project: { connect: { id: list.projectId } },
      action: 'APPROVED',
      entityType: 'CuttingList',
      entityId: list.id,
      title: 'Despiece autorizado',
      description: validNotes || 'La lista de despiece fue autorizada.'
    });
    return this.getCuttingListById(cuttingListId);
  }

  async rejectCuttingList(cuttingListId: string, reason: string): Promise<CuttingListDetail> {
    const list = await this.getCuttingListById(cuttingListId);
    const validReason = validateRejectReason(reason);
    await this.cuttingLists.updateStatus(cuttingListId, 'REJECTED', validReason);
    await prisma.quote.updateMany({
      where: { cuttingListId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });
    await this.history.create({
      project: { connect: { id: list.projectId } },
      action: 'REJECTED',
      entityType: 'CuttingList',
      entityId: list.id,
      title: 'Despiece rechazado',
      description: validReason
    });
    return this.getCuttingListById(cuttingListId);
  }

  async exportCuttingListToExcel(cuttingListId: string): Promise<CuttingListExportResult> {
    const list = await this.getCuttingListById(cuttingListId);
    if (list.pieces.length === 0) {
      throw new Error('No se puede exportar una lista vacía.');
    }
    if (!['DRAFT', 'PENDING_VALIDATION', 'AUTHORIZED'].includes(list.status)) {
      throw new Error('Solo se puede exportar una lista preliminar o autorizada.');
    }
    const result = await this.exporter.export(list);
    await this.cuttingLists.updateList(cuttingListId, {
      exportPath: result.filePath,
      exportedAt: new Date(result.exportedAt)
    });
    await this.history.create({
      project: { connect: { id: list.projectId } },
      action: 'EXPORTED',
      entityType: 'CuttingList',
      entityId: list.id,
      title: 'Despiece exportado a Excel',
      description: result.fileName
    });
    return result;
  }
}
