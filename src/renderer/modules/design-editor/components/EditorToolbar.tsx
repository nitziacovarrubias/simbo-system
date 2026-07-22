import { Box, Focus, Minus, Plus, Square } from 'lucide-react';
import type { DesignViewMode } from '@shared/types';
import { useEditorStore } from '@renderer/stores/editor.store';

export type CameraCommandType = 'zoom-in' | 'zoom-out' | 'reset';
export interface CameraCommand {
  id: number;
  type: CameraCommandType;
}

interface EditorToolbarProps {
  onCameraCommand: (type: CameraCommandType) => void;
}

export function EditorToolbar({ onCameraCommand }: EditorToolbarProps): JSX.Element {
  const viewMode = useEditorStore((state) => state.viewMode);
  const setViewMode = useEditorStore((state) => state.setViewMode);

  const setMode = (mode: DesignViewMode): void => setViewMode(mode);

  return (
    <div className="editor-toolbar" aria-label="Controles de vista">
      <div className="view-toggle" role="group" aria-label="Vista 2D o 3D">
        <button
          className={viewMode === '2D' ? 'is-active' : ''}
          type="button"
          onClick={() => setMode('2D')}
        >
          <Square size={16} aria-hidden="true" /> 2D
        </button>
        <button
          className={viewMode === '3D' ? 'is-active' : ''}
          type="button"
          onClick={() => setMode('3D')}
        >
          <Box size={16} aria-hidden="true" /> 3D
        </button>
      </div>
      <div className="zoom-controls" role="group" aria-label="Zoom">
        <button type="button" title="Alejar" onClick={() => onCameraCommand('zoom-out')}>
          <Minus size={17} aria-hidden="true" />
        </button>
        <button type="button" title="Acercar" onClick={() => onCameraCommand('zoom-in')}>
          <Plus size={17} aria-hidden="true" />
        </button>
        <button type="button" title="Restablecer vista" onClick={() => onCameraCommand('reset')}>
          <Focus size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
