import { CheckCircle2, FileSpreadsheet, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';

interface QuoteActionsProps {
  isReadOnly: boolean;
  canApprove: boolean;
  canExport: boolean;
  isBusy: boolean;
  onAdd: () => void;
  onApprove: (notes: string) => void;
  onReject: (reason: string) => void;
  onExport: () => void;
}

export function QuoteActions({
  isReadOnly,
  canApprove,
  canExport,
  isBusy,
  onAdd,
  onApprove,
  onReject,
  onExport
}: QuoteActionsProps): JSX.Element {
  const [decisionNote, setDecisionNote] = useState('');

  return (
    <section className="quote-actions-card" aria-label="Acciones de cotización">
      <label>
        Nota de aprobación o motivo de rechazo
        <textarea
          rows={3}
          value={decisionNote}
          onChange={(event) => setDecisionNote(event.target.value)}
          placeholder="El motivo es obligatorio al rechazar."
        />
      </label>

      <div className="quote-action-buttons">
        <button type="button" className="secondary-button" disabled={isReadOnly || isBusy} onClick={onAdd}>
          <Plus size={18} aria-hidden="true" /> Agregar concepto
        </button>
        <button
          type="button"
          className="success-button"
          disabled={!canApprove || isBusy}
          onClick={() => onApprove(decisionNote)}
        >
          <CheckCircle2 size={18} aria-hidden="true" /> Aprobar cotización
        </button>
        <button
          type="button"
          className="danger-button"
          disabled={isReadOnly || isBusy || !decisionNote.trim()}
          onClick={() => onReject(decisionNote)}
        >
          <XCircle size={18} aria-hidden="true" /> Rechazar cotización
        </button>
        <button type="button" className="secondary-button" disabled={!canExport || isBusy} onClick={onExport}>
          <FileSpreadsheet size={18} aria-hidden="true" /> Exportar Excel
        </button>
      </div>
    </section>
  );
}
