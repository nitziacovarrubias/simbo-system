import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { QuoteItem, QuoteItemInput } from '@shared/types';
import { QuoteItemSourceType } from '@shared/constants/domain.enums';
import { QUOTE_ITEM_SOURCE_TYPE_LABELS } from '@shared/constants/quote-item-source-type';

interface QuoteItemFormProps {
  item: QuoteItem | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: QuoteItemInput) => void;
}

const initialInput: QuoteItemInput = {
  sourceType: QuoteItemSourceType.CUSTOM,
  description: '',
  quantity: 1,
  unit: 'Pieza',
  unitPrice: 0,
  comments: '',
  sortOrder: 0
};

export function QuoteItemForm({
  item,
  isSaving,
  onCancel,
  onSubmit
}: QuoteItemFormProps): JSX.Element {
  const [input, setInput] =
    useState<QuoteItemInput>(initialInput);

  const [error, setError] = useState('');

  useEffect(() => {
    setError('');

    if (item) {
      setInput({
        materialId: item.materialId,
        sourceType: item.sourceType,
        sourcePieceId: item.sourcePieceId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        comments: item.comments,
        sortOrder: item.sortOrder
      });
    } else {
      setInput(initialInput);
    }
  }, [item]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();
    setError('');

    if (!input.description.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    if (input.quantity <= 0 || input.unitPrice < 0) {
      setError(
        'La cantidad debe ser mayor que cero y el precio no puede ser negativo.'
      );
      return;
    }

    onSubmit(input);
  }

  return (
    <div className="quote-form-backdrop" role="presentation">
      <form
        className="quote-item-form"
        onSubmit={handleSubmit}
      >
        <header>
          <div>
            <span>Conceptos de cotización</span>
            <h3>
              {item
                ? 'Editar concepto'
                : 'Agregar concepto'}
            </h3>
          </div>

          <button
            type="button"
            className="quote-modal-close"
            aria-label="Cerrar"
            onClick={onCancel}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {error ? (
          <div
            className="quote-message quote-message--error"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="quote-form-grid">
          <label>
            Tipo
            <select
              value={input.sourceType}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  sourceType: event.target
                    .value as QuoteItemSourceType
                }))
              }
            >
              {Object.values(QuoteItemSourceType).map(
                (type) => (
                  <option key={type} value={type}>
                    {QUOTE_ITEM_SOURCE_TYPE_LABELS[type]}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="quote-form-full">
            Descripción
            <input
              value={input.description}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              required
            />
          </label>

          <label>
            Cantidad
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={input.quantity}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  quantity: Number(event.target.value)
                }))
              }
              required
            />
          </label>

          <label>
            Unidad
            <input
              value={input.unit}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  unit: event.target.value
                }))
              }
              required
            />
          </label>

          <label>
            Precio unitario
            <input
              type="number"
              min="0"
              step="0.01"
              value={input.unitPrice}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  unitPrice: Number(event.target.value)
                }))
              }
              required
            />
          </label>

          <label className="quote-form-full">
            Comentarios
            <textarea
              rows={3}
              value={input.comments ?? ''}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  comments: event.target.value
                }))
              }
            />
          </label>
        </div>

        <div className="quote-form-actions">
          <button
            type="button"
            className="quote-secondary-button"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="quote-approve-button"
            disabled={isSaving}
          >
            {isSaving
              ? 'Guardando...'
              : 'Guardar concepto'}
          </button>
        </div>
      </form>
    </div>
  );
}
