import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Pencil,
  Plus,
  XCircle
} from 'lucide-react';

interface CuttingListActionsProps {
  isReadOnly: boolean;
  canAuthorize: boolean;
  isBusy: boolean;
  onAdd: () => void;
  onAuthorize: (notes: string) => void;
  onReject: (reason: string) => void;
  onExport: () => void;
}

export function CuttingListActions(props: CuttingListActionsProps): JSX.Element {
  const [notes, setNotes] = useState('');

  return (
    <section
      className="cutting-list-actions"
      aria-label="Acciones del despiece"
    >
      <div className="cutting-list-actions__primary">
        <button
          type="button"
          className="cutting-outline-button"
          disabled={props.isReadOnly || props.isBusy}
          onClick={props.onAdd}
        >
          <Pencil size={18} aria-hidden="true" />
          Editar / agregar pieza
        </button>

        <button
          type="button"
          className="cutting-export-button"
          disabled={props.isBusy}
          onClick={props.onExport}
        >
          <Download size={18} aria-hidden="true" />
          Descargar (.XLS)
        </button>
      </div>

      <label className="cutting-validation-note">
        <span>Nota u observación</span>
        <textarea
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="La nota es obligatoria para rechazar."
        />
      </label>

      <div className="cutting-list-actions__validation">
        <button
          type="button"
          className="cutting-add-button"
          disabled={props.isReadOnly || props.isBusy}
          onClick={props.onAdd}
        >
          <Plus size={17} aria-hidden="true" />
          Agregar pieza manual
        </button>

        <button
          type="button"
          className="cutting-reject-button"
          disabled={props.isBusy || notes.trim().length === 0}
          onClick={() => props.onReject(notes)}
        >
          <XCircle size={17} aria-hidden="true" />
          Rechazar lista
        </button>

        <button
          type="button"
          className="cutting-authorize-button"
          disabled={!props.canAuthorize || props.isBusy}
          onClick={() => props.onAuthorize(notes)}
        >
          <CheckCircle2 size={17} aria-hidden="true" />
          Autorizar lista
        </button>
      </div>
    </section>
  );
}
