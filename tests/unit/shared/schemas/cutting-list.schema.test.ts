import { describe, expect, it } from 'vitest';
import { cuttingPieceInputSchema, rejectCuttingListSchema } from '../../../../src/shared/schemas/cutting-list.schema';

const validPiece = {
  sourceModuleName: 'Gabinete 1',
  pieceName: 'Lateral',
  category: 'Estructura',
  quantity: 2,
  materialName: 'MDF 18mm',
  thicknessMm: 18,
  widthMm: 560,
  heightMm: 720,
  grainDirection: 'VERTICAL',
  edgeBanding: 'VISIBLE_EDGES'
};

describe('cutting list schemas', () => {
  it('accepts a valid cutting piece', () => {
    expect(cuttingPieceInputSchema.parse(validPiece).quantity).toBe(2);
  });

  it('rejects non-positive dimensions and quantities', () => {
    expect(() => cuttingPieceInputSchema.parse({ ...validPiece, quantity: 0 })).toThrow();
    expect(() => cuttingPieceInputSchema.parse({ ...validPiece, widthMm: -1 })).toThrow();
  });

  it('requires a rejection reason', () => {
    expect(() => rejectCuttingListSchema.parse({ reason: ' ' })).toThrow();
  });
});
