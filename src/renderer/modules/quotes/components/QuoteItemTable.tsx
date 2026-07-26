import { Pencil, Trash2 } from 'lucide-react';
import type { QuoteItem } from '@shared/types';
import { QUOTE_ITEM_SOURCE_TYPE_LABELS } from '@shared/constants/quote-item-source-type';

interface QuoteItemTableProps {
  items: QuoteItem[];
  currency: string;
  isReadOnly: boolean;
  isRemoving: boolean;
  onEdit: (item: QuoteItem) => void;
  onRemove: (itemId: string) => void;
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency
  }).format(value);
}

export function QuoteItemTable({
  items,
  currency,
  isReadOnly,
  isRemoving,
  onEdit,
  onRemove
}: QuoteItemTableProps): JSX.Element {
  return (
    <div className="quote-table-wrap">
      <table className="quote-item-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Concepto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Precio unitario</th>
            <th>Importe</th>
            <th>Comentarios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={9}>La cotización todavía no tiene conceptos.</td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  <strong>{item.description}</strong>
                  {item.isManual ? <small className="manual-tag">Manual</small> : null}
                </td>
                <td>{QUOTE_ITEM_SOURCE_TYPE_LABELS[item.sourceType]}</td>
                <td>{item.quantity.toLocaleString('es-MX', { maximumFractionDigits: 3 })}</td>
                <td>{item.unit}</td>
                <td>{formatMoney(item.unitPrice, currency)}</td>
                <td><strong>{formatMoney(item.amount, currency)}</strong></td>
                <td>{item.comments || 'Sin comentarios'}</td>
                <td>
                  <div className="table-action-group">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Editar ${item.description}`}
                      disabled={isReadOnly}
                      onClick={() => onEdit(item)}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      aria-label={`Eliminar ${item.description}`}
                      disabled={isReadOnly || isRemoving}
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
