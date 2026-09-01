import { useEffect, useMemo, useState } from 'react';
import { HardHat, PackageOpen, Save } from 'lucide-react';
import type {
  QuoteAdjustmentsInput,
  QuoteDetail
} from '@shared/types';

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

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
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
    const base =
      quote.subtotal +
      input.laborCost +
      input.extraCost;

    const discount = input.discountAmount;
    const taxable = Math.max(
      base - Math.min(discount, base),
      0
    );

    const tax = taxable * input.taxRate;
    const total = taxable + tax;

    const distributionBase =
      quote.subtotal + input.laborCost;

    return {
      base,
      tax,
      total,
      materialRatio:
        distributionBase > 0
          ? quote.subtotal / distributionBase
          : 0,
      laborRatio:
        distributionBase > 0
          ? input.laborCost / distributionBase
          : 0,
      isDiscountInvalid: discount > base,
      isAdvanceInvalid: input.advancePayment > total
    };
  }, [input, quote.subtotal]);

  return (
    <section
      className="quote-summary-panel"
      aria-labelledby="quote-summary-title"
    >
      <div className="quote-summary-kpis">
        <article className="quote-main-total">
          <span>Subtotal</span>
          <strong>
            {formatMoney(quote.subtotal, quote.currency)}
          </strong>
        </article>

        <article className="quote-distribution-card">
          <PackageOpen size={31} aria-hidden="true" />

          <div>
            <span>Gasto en materiales</span>
            <strong>{formatPercent(preview.materialRatio)}</strong>
          </div>
        </article>

        <article className="quote-distribution-card">
          <HardHat size={31} aria-hidden="true" />

          <div>
            <span>Gasto en personal</span>
            <strong>{formatPercent(preview.laborRatio)}</strong>
          </div>
        </article>
      </div>

      <div className="quote-summary-body">
        <div className="quote-summary-adjustments">
          <div className="quote-summary-heading">
            <div>
              <span>Ajustes</span>
              <h3 id="quote-summary-title">
                Costos y condiciones
              </h3>
            </div>
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
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    laborCost: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label>
              Costos adicionales
              <small>
                Instalación, transporte, herrajes, acabados u otros.
              </small>
              <input
                type="number"
                min="0"
                step="0.01"
                value={input.extraCost}
                disabled={isReadOnly}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    extraCost: Number(event.target.value)
                  }))
                }
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
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    discountAmount: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label>
              IVA
              <select
                value={input.taxRate}
                disabled={isReadOnly}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    taxRate: Number(event.target.value)
                  }))
                }
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
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    advancePayment: Number(event.target.value)
                  }))
                }
              />
            </label>

            <label className="quote-summary-full">
              Notas
              <textarea
                rows={4}
                value={input.notes ?? ''}
                disabled={isReadOnly}
                onChange={(event) =>
                  setInput((current) => ({
                    ...current,
                    notes: event.target.value
                  }))
                }
              />
            </label>
          </div>

          {preview.isDiscountInvalid ? (
            <div
              className="quote-message quote-message--error"
              role="alert"
            >
              El descuento no puede ser mayor al subtotal, mano de obra
              y costos adicionales.
            </div>
          ) : null}

          {preview.isAdvanceInvalid ? (
            <div
              className="quote-message quote-message--error"
              role="alert"
            >
              El anticipo no puede ser mayor al total de la cotización.
            </div>
          ) : null}

          <button
            type="button"
            className="quote-save-button"
            disabled={
              isReadOnly ||
              isSaving ||
              preview.isDiscountInvalid ||
              preview.isAdvanceInvalid
            }
            onClick={() => onSave(input)}
          >
            <Save size={18} aria-hidden="true" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        <div className="quote-totals-card">
          <div className="quote-totals-card__heading">
            <span>Concepto</span>
            <span>Total</span>
          </div>

          <dl className="quote-total-list">
            <div>
              <dt>Subtotal</dt>
              <dd>
                {formatMoney(
                  quote.subtotal,
                  quote.currency
                )}
              </dd>
            </div>

            <div>
              <dt>Mano de obra</dt>
              <dd>
                {formatMoney(
                  input.laborCost,
                  quote.currency
                )}
              </dd>
            </div>

            <div>
              <dt>Costos adicionales</dt>
              <dd>
                {formatMoney(
                  input.extraCost,
                  quote.currency
                )}
              </dd>
            </div>

            <div>
              <dt>Descuento</dt>
              <dd>
                -{formatMoney(
                  input.discountAmount,
                  quote.currency
                )}
              </dd>
            </div>

            <div>
              <dt>IVA ({Math.round(input.taxRate * 100)}%)</dt>
              <dd>
                {formatMoney(
                  preview.tax,
                  quote.currency
                )}
              </dd>
            </div>

            <div className="quote-grand-total">
              <dt>Total con IVA</dt>
              <dd>
                {formatMoney(
                  preview.total,
                  quote.currency
                )}
              </dd>
            </div>

            <div>
              <dt>Anticipo</dt>
              <dd>
                {formatMoney(
                  input.advancePayment,
                  quote.currency
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
