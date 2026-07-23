import { useState } from 'react';
import { CheckCircle2, Download, Plus, XCircle } from 'lucide-react';

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
    <section className="cutting-list-actions" aria-label="Acciones del despiece">
      <div className="cutting-action-buttons">
        <button type="button" className="secondary-link-button" disabled={props.isReadOnly || props.isBusy} onClick={props.onAdd}><Plus size={18} />Agregar pieza manual</button>
        <button type="button" className="accent-button" disabled={!props.canAuthorize || props.isBusy} onClick={() => props.onAuthorize(notes)}><CheckCircle2 size={18} />Autorizar lista</button>
        <button type="button" className="danger-button" disabled={props.isBusy || notes.trim().length === 0} onClick={() => props.onReject(notes)}><XCircle size={18} />Rechazar lista</button>
        <button type="button" className="secondary-link-button" disabled={props.isBusy} onClick={props.onExport}><Download size={18} />Exportar Excel</button>
      </div>
      <label>
        Nota u observación
        <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="La nota es obligatoria para rechazar." />
      </label>
    </section>
  );
}
