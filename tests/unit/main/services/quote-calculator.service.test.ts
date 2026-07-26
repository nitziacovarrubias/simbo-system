import { describe, expect, it } from 'vitest';
import {
  calculatePieceAreaM2,
  calculateQuoteTotals,
  calculateSuggestedAdvance,
  calculateSuggestedLabor,
  groupCuttingPiecesByMaterial,
  validateDiscountAmount
} from '../../../../src/main/services/quote-calculator.service';

describe('quote calculator', () => {
  it('calculates area in square meters from cutting pieces', () => {
    expect(calculatePieceAreaM2(500, 700, 4)).toBe(1.4);
  });

  it('groups cutting pieces by material', () => {
    const groups = groupCuttingPiecesByMaterial([
      {
        id: 'piece-1',
        materialId: 'material-1',
        materialName: 'MDF Blanco',
        widthMm: 500,
        heightMm: 700,
        quantity: 2,
        materialCost: 800
      },
      {
        id: 'piece-2',
        materialId: 'material-1',
        materialName: 'MDF Blanco',
        widthMm: 300,
        heightMm: 500,
        quantity: 2,
        materialCost: 800
      }
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.areaM2).toBe(1);
    expect(groups[0]?.amount).toBe(800);
  });

  it('keeps the displayed item amounts consistent with the subtotal', () => {
    const groups = groupCuttingPiecesByMaterial([
      {
        id: 'piece-rounding',
        materialId: 'material-rounding',
        materialName: 'Material con decimales',
        widthMm: 333,
        heightMm: 777,
        quantity: 1,
        materialCost: 123.45
      }
    ]);
    const group = groups[0];
    expect(group).toBeDefined();

    const totals = calculateQuoteTotals({
      items: [{ quantity: group?.areaM2 ?? 0, unitPrice: group?.unitPrice ?? 0 }],
      laborCost: 0,
      extraCost: 0,
      taxRate: 0,
      discountAmount: 0,
      advancePayment: 0
    });

    expect(totals.subtotal).toBe(group?.amount);
  });

  it('calculates subtotal, IVA, extras and total in MXN', () => {
    const totals = calculateQuoteTotals({
      items: [
        { quantity: 2, unitPrice: 100 },
        { quantity: 1, unitPrice: 50 }
      ],
      laborCost: 100,
      extraCost: 50,
      taxRate: 0.16,
      discountAmount: 0,
      advancePayment: 100
    });

    expect(totals.subtotal).toBe(250);
    expect(totals.taxAmount).toBe(64);
    expect(totals.total).toBe(464);
  });

  it('applies a valid discount before calculating tax', () => {
    const totals = calculateQuoteTotals({
      items: [{ quantity: 1, unitPrice: 1000 }],
      laborCost: 200,
      extraCost: 0,
      taxRate: 0.16,
      discountAmount: 200,
      advancePayment: 0
    });

    expect(totals.taxAmount).toBe(160);
    expect(totals.total).toBe(1160);
  });

  it('does not allow a discount greater than the base total', () => {
    expect(() => validateDiscountAmount(1201, 1200)).toThrow(
      'El descuento no puede ser mayor'
    );
  });

  it('calculates the suggested thirty-five percent labor cost', () => {
    expect(calculateSuggestedLabor(1000)).toBe(350);
  });

  it('calculates the suggested fifty percent advance', () => {
    expect(calculateSuggestedAdvance(1234.56)).toBe(617.28);
  });
});
