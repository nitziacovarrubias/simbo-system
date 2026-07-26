import type { Prisma, QuoteStatus } from '@prisma/client';
import { prisma } from '../database/prisma';
import { CuttingListRepository, type CuttingListDetailRecord } from '../repositories/cutting-list.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { QuoteRepository, type QuoteDetailRecord } from '../repositories/quote.repository';
import {
  approveQuoteSchema,
  quoteAdjustmentsSchema,
  quoteItemInputSchema,
  rejectQuoteSchema,
  updateQuoteItemSchema
} from '../../shared/schemas/quote.schema';
import type {
  QuoteAdjustmentsInput,
  QuoteDetail,
  QuoteExportResult,
  QuoteItem,
  QuoteItemInput,
  QuoteSummary
} from '../../shared/types';
import { QuoteExportService } from './quote-export.service';
import {
  calculateQuoteTotals,
  calculateSuggestedAdvance,
  calculateSuggestedLabor,
  groupCuttingPiecesByMaterial
} from './quote-calculator.service';
import {
  assertQuoteCanBeApproved,
  getNextQuoteVersion,
  isQuoteSourceOutdated,
  validateQuoteRejectReason
} from './quote.utils';

function mapQuoteItem(item: QuoteDetailRecord['items'][number]): QuoteItem {
  return {
    id: item.id,
    quoteId: item.quoteId,
    materialId: item.materialId,
    sourceType: item.sourceType as QuoteItem['sourceType'],
    sourcePieceId: item.sourcePieceId,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPrice,
    amount: item.amount,
    comments: item.comments ?? '',
    isManual: item.isManual,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function isSourceOutdated(quote: {
  status: QuoteStatus;
  cuttingList: { status: string } | null;
}): boolean {
  return isQuoteSourceOutdated(quote.status, quote.cuttingList?.status);
}

function mapSummary(
  quote: Awaited<ReturnType<QuoteRepository['listByProject']>>[number],
  latestVersion: number
): QuoteSummary {
  return {
    id: quote.id,
    projectId: quote.projectId,
    cuttingListId: quote.cuttingListId,
    versionNumber: quote.version,
    status: quote.status as QuoteSummary['status'],
    subtotal: quote.subtotal,
    taxAmount: quote.taxAmount,
    laborCost: quote.laborCost,
    extraCost: quote.extraCost,
    discountAmount: quote.discountAmount,
    advancePayment: quote.advancePayment,
    total: quote.total,
    currency: quote.currency as QuoteSummary['currency'],
    itemsCount: quote._count.items,
    generatedAt: quote.generatedAt.toISOString(),
    approvedAt: quote.approvedAt?.toISOString() ?? null,
    rejectedAt: quote.rejectedAt?.toISOString() ?? null,
    exportedAt: quote.exportedAt?.toISOString() ?? null,
    isLatestVersion: quote.version === latestVersion,
    isSourceOutdated: isSourceOutdated(quote),
    updatedAt: quote.updatedAt.toISOString()
  };
}

function buildGenerationWarnings(quote: QuoteDetailRecord): string[] {
  const warnings: string[] = [];
  if (quote.cuttingList?.status === 'PENDING_VALIDATION') {
    warnings.push('Esta cotización se generó con una lista de despiece pendiente de validación.');
  }
  if (quote.cuttingList?.status === 'OUTDATED' || quote.status === 'OUTDATED') {
    warnings.push('Esta cotización está desactualizada.');
  }
  const zeroPriceMaterials = quote.items
    .filter((item) => item.sourceType === 'MATERIAL' && item.unitPrice === 0)
    .map((item) => item.description);
  if (zeroPriceMaterials.length > 0) {
    warnings.push(`Falta capturar precio para: ${zeroPriceMaterials.join(', ')}.`);
  }
  return warnings;
}

function mapDetail(quote: QuoteDetailRecord, latestVersion: number): QuoteDetail {
  const person = quote.project.client.person;
  return {
    id: quote.id,
    projectId: quote.projectId,
    cuttingListId: quote.cuttingListId,
    versionNumber: quote.version,
    status: quote.status as QuoteDetail['status'],
    subtotal: quote.subtotal,
    taxAmount: quote.taxAmount,
    laborCost: quote.laborCost,
    extraCost: quote.extraCost,
    discountAmount: quote.discountAmount,
    advancePayment: quote.advancePayment,
    total: quote.total,
    currency: quote.currency as QuoteDetail['currency'],
    itemsCount: quote.items.length,
    generatedAt: quote.generatedAt.toISOString(),
    approvedAt: quote.approvedAt?.toISOString() ?? null,
    rejectedAt: quote.rejectedAt?.toISOString() ?? null,
    exportedAt: quote.exportedAt?.toISOString() ?? null,
    isLatestVersion: quote.version === latestVersion,
    isSourceOutdated: isSourceOutdated(quote),
    updatedAt: quote.updatedAt.toISOString(),
    projectName: quote.project.name,
    projectStatus: quote.project.status,
    clientName: `${person.firstName} ${person.lastName}`.trim(),
    clientPhone: person.phone,
    clientEmail: person.email,
    projectAddress: quote.project.client.projectAddress ?? quote.project.location,
    cuttingListVersion: quote.cuttingList?.version ?? null,
    cuttingListStatus: quote.cuttingList?.status ?? null,
    taxRate: quote.taxRate,
    notes: quote.notes ?? '',
    clientDecisionNotes: quote.clientDecisionNotes ?? '',
    generationWarnings: buildGenerationWarnings(quote),
    items: quote.items.map(mapQuoteItem)
  };
}

function assertQuoteCanBeEdited(status: QuoteStatus): void {
  if (status === 'APPROVED') {
    throw new Error('No se puede editar una cotización aprobada.');
  }
  if (status === 'OUTDATED') {
    throw new Error('No se puede editar una cotización desactualizada. Genera una nueva versión.');
  }
}

function itemCreateData(
  quoteId: string,
  input: QuoteItemInput,
  isManual: boolean
): Prisma.QuoteItemUncheckedCreateInput {
  return {
    quoteId,
    materialId: input.materialId ?? null,
    sourceType: input.sourceType as Prisma.QuoteItemUncheckedCreateInput['sourceType'],
    sourcePieceId: input.sourcePieceId ?? null,
    description: input.description,
    quantity: input.quantity,
    unit: input.unit,
    unitPrice: input.unitPrice,
    amount: Math.round((input.quantity * input.unitPrice + Number.EPSILON) * 100) / 100,
    comments: input.comments || null,
    isManual,
    sortOrder: input.sortOrder ?? 0
  };
}

function calculateStoredQuoteTotals(
  quote: Pick<
    QuoteDetailRecord,
    'laborCost' | 'extraCost' | 'taxRate' | 'discountAmount' | 'advancePayment'
  >,
  items: Array<{ quantity: number; unitPrice: number }>
) {
  return calculateQuoteTotals({
    items,
    laborCost: quote.laborCost,
    extraCost: quote.extraCost,
    taxRate: quote.taxRate,
    discountAmount: quote.discountAmount,
    advancePayment: quote.advancePayment
  });
}

export class QuoteService {
  private readonly quotes = new QuoteRepository(prisma);
  private readonly cuttingLists = new CuttingListRepository(prisma);
  private readonly projects = new ProjectRepository(prisma);
  private readonly history = new HistoryRepository(prisma);
  private readonly exporter: QuoteExportService;

  constructor(exporter = new QuoteExportService()) {
    this.exporter = exporter;
  }

  async getQuotesByProjectId(projectId: string): Promise<QuoteSummary[]> {
    const quotes = await this.quotes.listByProject(projectId);
    const latestVersion = quotes[0]?.version ?? 0;
    return quotes.map((quote) => mapSummary(quote, latestVersion));
  }

  async listQuotesByProject(projectId: string): Promise<QuoteSummary[]> {
    return this.getQuotesByProjectId(projectId);
  }

  async getQuoteById(quoteId: string): Promise<QuoteDetail> {
    const quote = await this.quotes.findById(quoteId);
    if (!quote) throw new Error('No se encontró la cotización.');
    const latest = await this.quotes.findLatestVersion(quote.projectId);
    return mapDetail(quote, latest?.version ?? quote.version);
  }

  private async resolveCuttingList(
    projectId: string,
    cuttingListId?: string
  ): Promise<CuttingListDetailRecord> {
    if (cuttingListId) {
      const selected = await this.cuttingLists.findById(cuttingListId);
      if (!selected || selected.projectId !== projectId) {
        throw new Error('No se encontró la lista de despiece seleccionada.');
      }
      if (!['AUTHORIZED', 'PENDING_VALIDATION'].includes(selected.status)) {
        throw new Error('La lista seleccionada no está disponible para cotizar.');
      }
      return selected;
    }

    const authorized = await this.cuttingLists.findLatestAuthorized(projectId);
    if (authorized) return authorized;
    const pending = await this.cuttingLists.findLatestPendingValidation(projectId);
    if (pending) return pending;
    throw new Error('Primero genera una lista de despiece para crear la cotización.');
  }

  async generateQuote(projectId: string, cuttingListId?: string): Promise<QuoteDetail> {
    const project = await this.projects.findById(projectId);
    if (!project) throw new Error('No se encontró el proyecto.');
    const cuttingList = await this.resolveCuttingList(projectId, cuttingListId);
    if (cuttingList.pieces.length === 0) {
      throw new Error('No se puede generar una cotización con un despiece vacío.');
    }

    const materialGroups = groupCuttingPiecesByMaterial(
      cuttingList.pieces.map((piece) => ({
        id: piece.id,
        materialId: piece.materialId,
        materialName: piece.materialName,
        widthMm: piece.widthMm,
        heightMm: piece.heightMm,
        quantity: piece.quantity,
        materialCost: piece.material?.cost ?? 0
      }))
    );

    const materialSubtotal = materialGroups.reduce((total, group) => total + group.amount, 0);
    const laborCost = calculateSuggestedLabor(materialSubtotal);
    const preliminaryTotals = calculateQuoteTotals({
      items: materialGroups.map((group) => ({
        quantity: group.areaM2,
        unitPrice: group.unitPrice
      })),
      laborCost,
      extraCost: 0,
      taxRate: 0.16,
      discountAmount: 0,
      advancePayment: 0
    });
    const advancePayment = calculateSuggestedAdvance(preliminaryTotals.total);
    const latest = await this.quotes.findLatestVersion(projectId);
    const version = getNextQuoteVersion(latest?.version);

    const quote = await this.quotes.create({
      project: { connect: { id: projectId } },
      cuttingList: { connect: { id: cuttingList.id } },
      version,
      status: 'PENDING',
      subtotal: preliminaryTotals.subtotal,
      taxRate: 0.16,
      taxAmount: preliminaryTotals.taxAmount,
      laborCost,
      extraCost: 0,
      discountAmount: 0,
      advancePayment,
      total: preliminaryTotals.total,
      currency: 'MXN',
      notes: null,
      generatedAt: new Date(),
      items: {
        create: materialGroups.map((group, index) => ({
          materialId: group.materialId,
          sourceType: 'MATERIAL',
          description: group.materialName,
          quantity: group.areaM2,
          unit: 'm²',
          unitPrice: group.unitPrice,
          amount: group.amount,
          comments:
            group.unitPrice === 0
              ? 'Precio pendiente de captura.'
              : `Área estimada desde ${group.pieceIds.length} pieza(s).`,
          isManual: false,
          sortOrder: index + 1
        }))
      }
    });

    await this.projects.updateStatus(projectId, 'QUOTING');
    await this.history.create({
      project: { connect: { id: projectId } },
      action: 'CREATED',
      entityType: 'Quote',
      entityId: quote.id,
      title: 'Cotización generada',
      description: `Se generó la cotización versión ${version} desde el despiece versión ${cuttingList.version}.`
    });

    return this.getQuoteById(quote.id);
  }

  async updateQuoteItem(quoteItemId: string, input: unknown): Promise<QuoteDetail> {
    const current = await this.quotes.findItemById(quoteItemId);
    if (!current) throw new Error('No se encontró el concepto.');
    assertQuoteCanBeEdited(current.quote.status);
    const quote = await this.quotes.findById(current.quoteId);
    if (!quote) throw new Error('No se encontró la cotización.');
    const validInput = updateQuoteItemSchema.parse(input);
    const quantity = validInput.quantity ?? current.quantity;
    const unitPrice = validInput.unitPrice ?? current.unitPrice;
    const amount = Math.round((quantity * unitPrice + Number.EPSILON) * 100) / 100;
    const proposedItems = quote.items.map((item) =>
      item.id === quoteItemId ? { quantity, unitPrice } : item
    );
    const totals = calculateStoredQuoteTotals(quote, proposedItems);

    await prisma.$transaction(async (tx) => {
      await tx.quoteItem.update({
        where: { id: quoteItemId },
        data: {
          materialId: validInput.materialId,
          sourceType:
            validInput.sourceType as Prisma.QuoteItemUncheckedUpdateInput['sourceType'],
          sourcePieceId: validInput.sourcePieceId,
          description: validInput.description,
          quantity: validInput.quantity,
          unit: validInput.unit,
          unitPrice: validInput.unitPrice,
          comments: validInput.comments === undefined ? undefined : validInput.comments || null,
          sortOrder: validInput.sortOrder,
          amount
        }
      });
      await tx.quote.update({
        where: { id: current.quoteId },
        data: {
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          status: 'PENDING',
          clientDecisionNotes: null,
          approvedAt: null,
          rejectedAt: null
        }
      });
    });

    await this.history.create({
      project: { connect: { id: current.quote.projectId } },
      action: 'UPDATED',
      entityType: 'QuoteItem',
      entityId: quoteItemId,
      title: 'Concepto de cotización editado',
      description: `Se editó el concepto ${current.description}.`
    });
    return this.getQuoteById(current.quoteId);
  }

  async addQuoteItem(quoteId: string, input: unknown): Promise<QuoteDetail> {
    const quote = await this.quotes.findById(quoteId);
    if (!quote) throw new Error('No se encontró la cotización.');
    assertQuoteCanBeEdited(quote.status);
    const validInput = quoteItemInputSchema.parse(input);
    const nextSortOrder = Math.max(0, ...quote.items.map((item) => item.sortOrder)) + 1;
    const createData = itemCreateData(
      quoteId,
      {
        ...validInput,
        sortOrder: validInput.sortOrder && validInput.sortOrder > 0
          ? validInput.sortOrder
          : nextSortOrder
      },
      true
    );
    const totals = calculateStoredQuoteTotals(quote, [
      ...quote.items,
      { quantity: validInput.quantity, unitPrice: validInput.unitPrice }
    ]);

    await prisma.$transaction(async (tx) => {
      await tx.quoteItem.create({ data: createData });
      await tx.quote.update({
        where: { id: quoteId },
        data: {
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          status: 'PENDING',
          clientDecisionNotes: null,
          approvedAt: null,
          rejectedAt: null
        }
      });
    });

    await this.history.create({
      project: { connect: { id: quote.projectId } },
      action: 'CREATED',
      entityType: 'QuoteItem',
      title: 'Concepto manual agregado',
      description: `Se agregó el concepto ${validInput.description}.`
    });
    return this.getQuoteById(quoteId);
  }

  async removeQuoteItem(quoteItemId: string): Promise<QuoteDetail> {
    const current = await this.quotes.findItemById(quoteItemId);
    if (!current) throw new Error('No se encontró el concepto.');
    assertQuoteCanBeEdited(current.quote.status);
    const quote = await this.quotes.findById(current.quoteId);
    if (!quote) throw new Error('No se encontró la cotización.');
    const totals = calculateStoredQuoteTotals(
      quote,
      quote.items.filter((item) => item.id !== quoteItemId)
    );

    await prisma.$transaction(async (tx) => {
      await tx.quoteItem.delete({ where: { id: quoteItemId } });
      await tx.quote.update({
        where: { id: current.quoteId },
        data: {
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
          status: 'PENDING',
          clientDecisionNotes: null,
          approvedAt: null,
          rejectedAt: null
        }
      });
    });

    await this.history.create({
      project: { connect: { id: current.quote.projectId } },
      action: 'UPDATED',
      entityType: 'QuoteItem',
      entityId: quoteItemId,
      title: 'Concepto eliminado de la cotización',
      description: `Se eliminó el concepto ${current.description}.`
    });
    return this.getQuoteById(current.quoteId);
  }

  async updateQuoteAdjustments(quoteId: string, input: unknown): Promise<QuoteDetail> {
    const quote = await this.quotes.findById(quoteId);
    if (!quote) throw new Error('No se encontró la cotización.');
    assertQuoteCanBeEdited(quote.status);
    const validInput: QuoteAdjustmentsInput = quoteAdjustmentsSchema.parse(input);
    const totals = calculateQuoteTotals({
      items: quote.items,
      laborCost: validInput.laborCost,
      extraCost: validInput.extraCost,
      taxRate: validInput.taxRate,
      discountAmount: validInput.discountAmount,
      advancePayment: validInput.advancePayment
    });
    if (validInput.advancePayment > totals.total) {
      throw new Error('El anticipo no puede ser mayor al total de la cotización.');
    }
    await this.quotes.updateQuote(quoteId, {
      taxRate: validInput.taxRate,
      taxAmount: totals.taxAmount,
      laborCost: validInput.laborCost,
      extraCost: validInput.extraCost,
      discountAmount: validInput.discountAmount,
      advancePayment: validInput.advancePayment,
      subtotal: totals.subtotal,
      total: totals.total,
      notes: validInput.notes || null,
      status: 'PENDING',
      clientDecisionNotes: null,
      approvedAt: null,
      rejectedAt: null
    });
    await this.history.create({
      project: { connect: { id: quote.projectId } },
      action: 'UPDATED',
      entityType: 'Quote',
      entityId: quote.id,
      title: 'Ajustes de cotización actualizados',
      description: 'Se actualizaron mano de obra, costos adicionales, descuento, IVA, anticipo o notas.'
    });
    return this.getQuoteById(quoteId);
  }

  async approveQuote(quoteId: string, notes?: string): Promise<QuoteDetail> {
    const quote = await this.getQuoteById(quoteId);
    const validNotes = approveQuoteSchema.parse({ notes }).notes;
    if (quote.status === 'APPROVED') {
      throw new Error('La cotización ya está aprobada.');
    }
    if (quote.status === 'REJECTED') {
      throw new Error('Edita la cotización rechazada antes de volver a aprobarla.');
    }
    assertQuoteCanBeApproved(quote.items.length, quote.isSourceOutdated);
    const updated = await this.quotes.updateStatus(quoteId, 'APPROVED', validNotes);
    await this.projects.updateStatus(updated.projectId, 'APPROVED');
    await this.history.create({
      project: { connect: { id: updated.projectId } },
      action: 'APPROVED',
      entityType: 'Quote',
      entityId: updated.id,
      title: 'Cotización aprobada',
      description: validNotes || 'La cotización fue aprobada por el cliente.'
    });
    return this.getQuoteById(quoteId);
  }

  async rejectQuote(quoteId: string, reason: string): Promise<QuoteDetail> {
    const quote = await this.getQuoteById(quoteId);
    if (quote.status === 'APPROVED') {
      throw new Error('No se puede rechazar una cotización aprobada.');
    }
    if (quote.status === 'OUTDATED') {
      throw new Error('No se puede rechazar una cotización desactualizada.');
    }
    const validReason = validateQuoteRejectReason(rejectQuoteSchema.parse({ reason }).reason);
    const updated = await this.quotes.updateStatus(quoteId, 'REJECTED', validReason);
    await this.history.create({
      project: { connect: { id: updated.projectId } },
      action: 'REJECTED',
      entityType: 'Quote',
      entityId: updated.id,
      title: 'Cotización rechazada',
      description: validReason
    });
    return this.getQuoteById(quoteId);
  }

  async exportQuoteToExcel(quoteId: string): Promise<QuoteExportResult> {
    const quote = await this.getQuoteById(quoteId);
    if (quote.items.length === 0) throw new Error('No se puede exportar una cotización vacía.');
    const result = await this.exporter.export(quote);
    await this.quotes.updateExportedAt(quoteId, new Date(result.exportedAt));
    await this.history.create({
      project: { connect: { id: quote.projectId } },
      action: 'EXPORTED',
      entityType: 'Quote',
      entityId: quote.id,
      title: 'Cotización exportada a Excel',
      description: result.fileName
    });
    return result;
  }
}
