import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import type { QuoteAdjustmentsInput, QuoteDetail } from '@shared/types';

interface QuoteSummaryPanelProps {
  quote: QuoteDetail;
  isReadOnly: boolean;
  isSaving: boolean;
  onSave: (input: QuoteAdjustmentsInput) => void;
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency
  }).format(value);
}

export function QuoteSummaryPanel({
  quote,
  isReadOnly,
  isSaving,
  onSave
}: QuoteSummaryPanelProps): JSX.Element {
  const [input, setInput] = useState<QuoteAdjustmentsInput>({
    laborCost: quote.laborCost,
    extraCost: quote.extraCost,
    discountAmount: quote.discountAmount,
    taxRate: quote.taxRate,
    advancePayment: quote.advancePayment,
    notes: quote.notes
  });

  useEffect(() => {
    setInput({
      laborCost: quote.laborCost,
      extraCost: quote.extraCost,
      discountAmount: quote.discountAmount,
      taxRate: quote.taxRate,
      advancePayment: quote.advancePayment,
      notes: quote.notes
    });
  }, [quote]);

  const preview = useMemo(() => {
    const base = quote.subtotal + input.laborCost + input.extraCost;
    const discount = input.discountAmount;
    const taxable = Math.max(base - Math.min(discount, base), 0);
    const tax = taxable * input.taxRate;
    return {
      base,
      tax,
      total: taxable + tax,
      isDiscountInvalid: discount > base,
      isAdvanceInvalid: input.advancePayment > taxable + tax
    };
  }, [input, quote.subtotal]);

  return (
    <aside className="quote-summary-panel" aria-labelledby="quote-summary-title">
      <div className="quote-summary-heading">
        <div>
          <p className="page-eyebrow">Panel de totales</p>
          <h3 id="quote-summary-title">Resumen</h3>
        </div>
        <strong>{formatMoney(preview.total, quote.currency)}</strong>
      </div>

      <div className="quote-summary-fields">
        <label>
          Mano de obra
          <input
            type="number"
            min="0"
            step="0.01"
            value={input.laborCost}
            disabled={isReadOnly}
            onChange={(event) => setInput((current) => ({ ...current, laborCost: Number(event.target.value) }))}
          />
        </label>
        <label>
          Costos adicionales
          <small>Instalación, transporte, herrajes, acabados u otros.</small>
          <input
            type="number"
            min="0"
            step="0.01"
            value={input.extraCost}
            disabled={isReadOnly}
            onChange={(event) => setInput((current) => ({ ...current, extraCost: Number(event.target.value) }))}
          />
        </label>
        <label>
          Descuento
          <input
            type="number"
            min="0"
            step="0.01"
            value={input.discountAmount}
            disabled={isReadOnly}
            onChange={(event) => setInput((current) => ({ ...current, discountAmount: Number(event.target.value) }))}
          />
        </label>
        <label>
          IVA
          <select
            value={input.taxRate}
            disabled={isReadOnly}
            onChange={(event) => setInput((current) => ({ ...current, taxRate: Number(event.target.value) }))}
          >
            <option value={0}>0%</option>
            <option value={0.08}>8%</option>
            <option value={0.16}>16%</option>
          </select>
        </label>
        <label>
          Anticipo
          <input
            type="number"
            min="0"
            step="0.01"
            value={input.advancePayment}
            disabled={isReadOnly}
            onChange={(event) => setInput((current) => ({ ...current, advancePayment: Number(event.target.value) }))}
          />
        </label>
        <label className="full-width">
          Notas
          <textarea
            rows={4}
            value={input.notes ?? ''}
            disabled={isReadOnly}
            onChange={(event) => setInput((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>
      </div>


      {preview.isDiscountInvalid ? (
        <div className="state-card state-card-error" role="alert">
          El descuento no puede ser mayor al subtotal, mano de obra y costos adicionales.
        </div>
      ) : null}
      {preview.isAdvanceInvalid ? (
        <div className="state-card state-card-error" role="alert">
          El anticipo no puede ser mayor al total de la cotización.
        </div>
      ) : null}

      <dl className="quote-total-list">
        <div><dt>Subtotal</dt><dd>{formatMoney(quote.subtotal, quote.currency)}</dd></div>
        <div><dt>Mano de obra</dt><dd>{formatMoney(input.laborCost, quote.currency)}</dd></div>
        <div><dt>Costos adicionales</dt><dd>{formatMoney(input.extraCost, quote.currency)}</dd></div>
        <div><dt>Descuento</dt><dd>-{formatMoney(input.discountAmount, quote.currency)}</dd></div>
        <div><dt>IVA</dt><dd>{formatMoney(preview.tax, quote.currency)}</dd></div>
        <div className="quote-grand-total"><dt>Total</dt><dd>{formatMoney(preview.total, quote.currency)}</dd></div>
        <div><dt>Anticipo</dt><dd>{formatMoney(input.advancePayment, quote.currency)}</dd></div>
      </dl>

      <button
        type="button"
        className="accent-button quote-save-button"
        disabled={isReadOnly || isSaving || preview.isDiscountInvalid || preview.isAdvanceInvalid}
        onClick={() => onSave(input)}
      >
        <Save size={18} aria-hidden="true" />
        {isSaving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </aside>
  );
}
