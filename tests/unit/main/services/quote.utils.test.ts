import { describe, expect, it } from 'vitest';
import {
  assertQuoteCanBeApproved,
  getNextQuoteVersion,
  isQuoteSourceOutdated,
  validateQuoteRejectReason
} from '../../../../src/main/services/quote.utils';

describe('quote business rules', () => {
  it('increments quote versions without replacing older versions', () => {
    expect(getNextQuoteVersion()).toBe(1);
    expect(getNextQuoteVersion(3)).toBe(4);
  });

  it('does not approve an empty quote', () => {
    expect(() => assertQuoteCanBeApproved(0, false)).toThrow(
      'No se puede aprobar una cotización vacía.'
    );
  });

  it('requires a reason to reject a quote', () => {
    expect(() => validateQuoteRejectReason('   ')).toThrow(
      'El motivo de rechazo es obligatorio.'
    );
    expect(validateQuoteRejectReason(' Precio fuera de presupuesto ')).toBe(
      'Precio fuera de presupuesto'
    );
  });

  it('marks the quote outdated when its cutting list changes', () => {
    expect(isQuoteSourceOutdated('PENDING', 'OUTDATED')).toBe(true);
    expect(isQuoteSourceOutdated('OUTDATED', 'AUTHORIZED')).toBe(true);
    expect(isQuoteSourceOutdated('PENDING', 'AUTHORIZED')).toBe(false);
  });
});
