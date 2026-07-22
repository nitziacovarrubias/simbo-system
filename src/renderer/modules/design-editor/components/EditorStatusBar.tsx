import { AlertTriangle, CheckCircle2, LoaderCircle, Save } from 'lucide-react';
import { useEditorStore } from '@renderer/stores/editor.store';

export function EditorStatusBar(): JSX.Element {
  const saveStatus = useEditorStore((state) => state.saveStatus);
  const hasCollisions = useEditorStore((state) =>
    state.modules.some((module) => module.hasCollision)
  );

  return (
    <footer className="editor-status-bar" aria-live="polite">
      <span>
        {saveStatus === 'saving' ? (
          <LoaderCircle className="spin" size={16} aria-hidden="true" />
        ) : null}
        {saveStatus === 'saved' ? <CheckCircle2 size={16} aria-hidden="true" /> : null}
        {saveStatus === 'error' ? <AlertTriangle size={16} aria-hidden="true" /> : null}
        {saveStatus === 'idle' ? <Save size={16} aria-hidden="true" /> : null}
        {saveStatus === 'saving'
          ? 'Guardando...'
          : saveStatus === 'saved'
            ? 'Diseño guardado'
            : saveStatus === 'error'
              ? 'Error al guardar'
              : 'Cambios pendientes'}
      </span>
      {hasCollisions ? (
        <span className="collision-status">
          <AlertTriangle size={16} aria-hidden="true" /> Hay módulos superpuestos
        </span>
      ) : (
        <span>Sin superposiciones</span>
      )}
    </footer>
  );
}
