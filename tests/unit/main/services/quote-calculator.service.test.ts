import { describe, expect, it } from 'vitest';
import { calculateQuoteTotals } from '../../../../src/main/services/quote-calculator.service';

describe('calculateQuoteTotals', () => {
  it('calculates subtotal, IVA and total in MXN', () => {
    const totals = calculateQuoteTotals({
      items: [
        { quantity: 2, unitPrice: 100 },
        { quantity: 1, unitPrice: 50 },
      ],
      laborCost: 100,
      taxRate: 0.16,
      discountAmount: 0,
      advancePayment: 100,
    });

    expect(totals.subtotal).toBe(250);
    expect(totals.taxAmount).toBe(56);
    expect(totals.total).toBe(406);
  });

  it('does not calculate negative taxable base', () => {
    const totals = calculateQuoteTotals({
      items: [{ quantity: 1, unitPrice: 100 }],
      laborCost: 0,
      taxRate: 0.16,
      discountAmount: 500,
      advancePayment: 0,
    });

    expect(totals.taxAmount).toBe(0);
    expect(totals.total).toBe(0);
  });
});
