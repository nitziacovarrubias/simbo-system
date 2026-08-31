import { Box, CheckCircle2, RefreshCw, TriangleAlert } from 'lucide-react';
import { useFreeCadStatusQuery } from '../hooks/useRenderQueries';

export function FreeCadStatusPanel(): JSX.Element {
  const statusQuery = useFreeCadStatusQuery();

  if (statusQuery.isLoading) {
    return (
      <aside className="freecad-status-panel" aria-live="polite">
        <Box size={20} aria-hidden="true" />
        <div>
          <strong>FreeCAD</strong>
          <p>Verificando FreeCADCmd...</p>
        </div>
      </aside>
    );
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <aside className="freecad-status-panel is-unavailable" role="status">
        <TriangleAlert size={20} aria-hidden="true" />
        <div>
          <strong>FreeCAD no disponible</strong>
          <p>No se pudo verificar la configuración de FreeCADCmd.</p>
        </div>
        <button className="icon-button" type="button" onClick={() => void statusQuery.refetch()} aria-label="Reintentar detección de FreeCAD">
          <RefreshCw size={17} aria-hidden="true" />
        </button>
      </aside>
    );
  }

  const status = statusQuery.data;
  return (
    <aside className={`freecad-status-panel ${status.available ? 'is-available' : 'is-unavailable'}`} role="status">
      {status.available ? <CheckCircle2 size={20} aria-hidden="true" /> : <TriangleAlert size={20} aria-hidden="true" />}
      <div>
        <strong>{status.available ? 'FreeCAD listo' : 'FreeCAD no configurado'}</strong>
        <p>{status.message}</p>
      </div>
      <button className="icon-button" type="button" onClick={() => void statusQuery.refetch()} aria-label="Volver a verificar FreeCAD">
        <RefreshCw size={17} aria-hidden="true" />
      </button>
    </aside>
  );
}
