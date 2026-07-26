import { describe, expect, it } from 'vitest';
import { QuoteExportService } from '../../../../src/main/services/quote-export.service';
import type { QuoteDetail } from '../../../../src/shared/types';
import { Currency, QuoteItemSourceType, QuoteStatus } from '../../../../src/shared/constants/domain.enums';

const quote: QuoteDetail = {
  id: 'quote-1',
  projectId: 'project-1',
  cuttingListId: 'cutting-1',
  versionNumber: 2,
  status: QuoteStatus.PENDING,
  subtotal: 1000,
  taxAmount: 216,
  laborCost: 300,
  extraCost: 50,
  discountAmount: 0,
  advancePayment: 783,
  total: 1566,
  currency: Currency.MXN,
  itemsCount: 1,
  generatedAt: '2026-07-23T00:00:00.000Z',
  approvedAt: null,
  rejectedAt: null,
  exportedAt: null,
  isLatestVersion: true,
  isSourceOutdated: false,
  updatedAt: '2026-07-23T00:00:00.000Z',
  projectName: 'Cocina demo',
  projectStatus: 'QUOTING',
  clientName: 'Cliente Demo',
  clientPhone: '+52 662 000 0000',
  clientEmail: 'cliente@example.com',
  projectAddress: 'Hermosillo, Sonora',
  cuttingListVersion: 1,
  cuttingListStatus: 'AUTHORIZED',
  taxRate: 0.16,
  notes: 'Vigencia de 15 días.',
  clientDecisionNotes: '',
  generationWarnings: [],
  items: [
    {
      id: 'item-1',
      quoteId: 'quote-1',
      materialId: 'material-1',
      sourceType: QuoteItemSourceType.MATERIAL,
      sourcePieceId: null,
      description: 'MDF Blanco',
      quantity: 2,
      unit: 'm²',
      unitPrice: 500,
      amount: 1000,
      comments: 'Precio de prueba',
      isManual: false,
      sortOrder: 1,
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z'
    }
  ]
};

describe('QuoteExportService', () => {
  it('builds a workbook with quote concepts and totals', () => {
    const workbook = new QuoteExportService('/tmp').buildWorkbook(quote);
    const sheet = workbook.getWorksheet('Cotización');

    expect(sheet).toBeDefined();
    expect(sheet?.getCell('A1').value).toBe('SIMBO · Cotización');
    expect(sheet?.rowCount).toBeGreaterThan(15);
  });
});
