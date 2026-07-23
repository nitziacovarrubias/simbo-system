import { describe, expect, it } from 'vitest';
import { CuttingListExportService } from '../../../../src/main/services/cutting-list-export.service';
import type { CuttingListDetail } from '../../../../src/shared/types';

const list: CuttingListDetail = {
  id: 'list-1', projectId: 'project-1', designId: 'design-1', versionNumber: 1,
  designVersion: 1, status: 'PENDING_VALIDATION', piecesCount: 1,
  generatedAt: new Date('2026-07-22T12:00:00.000Z').toISOString(),
  authorizedAt: null, rejectedAt: null, exportedAt: null, isLatestVersion: true,
  isDesignOutdated: false, updatedAt: new Date().toISOString(), projectName: 'Cocina demo',
  clientName: 'Cliente demo', designTitle: 'Diseño 1', designStatus: 'DRAFT', notes: '',
  validationNotes: '', exportPath: null,
  pieces: [{
    id: 'piece-1', cuttingListId: 'list-1', sourceModuleId: 'module-1', sourceModuleName: 'Gabinete bajo',
    pieceName: 'Lateral', category: 'Estructura', quantity: 2, materialId: 'material-1',
    materialName: 'MDF 18mm', thicknessMm: 18, widthMm: 560, heightMm: 720,
    depthMm: null, grainDirection: 'VERTICAL', edgeBanding: 'VISIBLE_EDGES', comments: '',
    isManual: false, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }],
  materialSummary: [{
    materialId: 'material-1', materialName: 'MDF 18mm', thicknessMm: 18,
    piecesCount: 1, totalQuantity: 2, totalAreaSquareMeters: 0.806
  }]
};

describe('CuttingListExportService', () => {
  it('builds a workbook with detail and material summary sheets', () => {
    const workbook = new CuttingListExportService('/tmp').buildWorkbook(list);
    expect(workbook.getWorksheet('Despiece')).toBeDefined();
    expect(workbook.getWorksheet('Resumen materiales')).toBeDefined();
    expect(workbook.getWorksheet('Despiece')?.getCell('A1').value).toContain('SIMBO');
  });
});
