import { describe, expect, it } from 'vitest';
import { QuoteItemSourceType } from '../../../../src/shared/constants/domain.enums';
import {
  quoteAdjustmentsSchema,
  quoteItemInputSchema,
  rejectQuoteSchema
} from '../../../../src/shared/schemas/quote.schema';

describe('quote schemas', () => {
  it('validates required quote item fields and positive quantity', () => {
    expect(() =>
      quoteItemInputSchema.parse({
        sourceType: QuoteItemSourceType.CUSTOM,
        description: '',
        quantity: 0,
        unit: '',
        unitPrice: -1
      })
    ).toThrow();
  });

  it('accepts only the supported tax rates', () => {
    expect(() =>
      quoteAdjustmentsSchema.parse({
        taxRate: 0.1,
        laborCost: 0,
        extraCost: 0,
        discountAmount: 0,
        advancePayment: 0
      })
    ).toThrow();
  });

  it('requires a rejection reason', () => {
    expect(() => rejectQuoteSchema.parse({ reason: ' ' })).toThrow();
  });
});
