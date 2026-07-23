import { describe, expect, it } from 'vitest';
import {
  assertCuttingListCanBeAuthorized,
  assertDesignCanGenerateCuttingList,
  calculateMaterialSummary,
  getNextCuttingListVersion,
  validateRejectReason
} from '../../../../src/main/services/cutting-list.utils';

const piece = {
  sourceModuleName: 'Gabinete 1',
  pieceName: 'Lateral',
  category: 'Estructura',
  quantity: 2,
  materialId: 'material-1',
  materialName: 'MDF 18mm',
  thicknessMm: 18,
  widthMm: 560,
  heightMm: 720,
  grainDirection: 'VERTICAL' as const,
  edgeBanding: 'VISIBLE_EDGES' as const
};

describe('cutting list business helpers', () => {
  it('does not authorize an empty list', () => {
    expect(() => assertCuttingListCanBeAuthorized([], false)).toThrow('lista vacía');
  });

  it('requires a rejection reason', () => {
    expect(() => validateRejectReason('')).toThrow();
    expect(validateRejectReason('Medidas por revisar')).toBe('Medidas por revisar');
  });

  it('detects collisions before generation', () => {
    expect(() => assertDesignCanGenerateCuttingList({ modulesCount: 2, hasCollisions: true })).toThrow('superpuestos');
  });

  it('calculates totals by material', () => {
    const summary = calculateMaterialSummary([
      { ...piece, materialId: 'material-1' },
      { ...piece, materialId: 'material-1', quantity: 1 }
    ]);
    expect(summary).toHaveLength(1);
    expect(summary[0]?.totalQuantity).toBe(3);
    expect(summary[0]?.totalAreaSquareMeters).toBeCloseTo(1.21, 2);
  });

  it('increments the cutting list version', () => {
    expect(getNextCuttingListVersion(undefined)).toBe(1);
    expect(getNextCuttingListVersion(3)).toBe(4);
  });
});
