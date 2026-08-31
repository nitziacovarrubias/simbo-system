import { Box, Copy, FolderOpen, RefreshCw } from 'lucide-react';
import type { RenderCopyArtifactType, RenderDetail } from '@shared/types';

interface CadArtifactsPanelProps {
  render: RenderDetail;
  isGenerating: boolean;
  onGenerateCad: () => void;
  onSaveCopy: (type: RenderCopyArtifactType) => void;
  onOpenLocation: () => void;
}

export function CadArtifactsPanel({ render, isGenerating, onGenerateCad, onSaveCopy, onOpenLocation }: CadArtifactsPanelProps): JSX.Element {
  const artifacts: Array<{ type: RenderCopyArtifactType; label: string; available: boolean }> = [
    { type: 'FCSTD', label: 'FreeCAD (.FCStd)', available: render.cadArtifacts.fcstdAvailable },
    { type: 'STEP', label: 'STEP (.step)', available: render.cadArtifacts.stepAvailable },
    { type: 'STL', label: 'STL (.stl)', available: render.cadArtifacts.stlAvailable }
  ];

  return (
    <section className="cad-artifacts-panel" aria-labelledby="cad-artifacts-title">
      <div className="section-heading">
        <div>
          <p className="page-eyebrow">Motor técnico</p>
          <h3 id="cad-artifacts-title"><Box size={20} aria-hidden="true" /> Archivos CAD</h3>
        </div>
        <button className="secondary-button" type="button" onClick={onGenerateCad} disabled={isGenerating}>
          <RefreshCw size={17} aria-hidden="true" /> {isGenerating ? 'Generando modelo CAD...' : 'Generar / reintentar CAD'}
        </button>
      </div>
      <div className="cad-artifact-list">
        {artifacts.map((artifact) => (
          <div key={artifact.type} className="cad-artifact-row">
            <span>{artifact.label}</span>
            <strong>{artifact.available ? 'Disponible' : 'No disponible'}</strong>
            <button className="secondary-button" type="button" disabled={!artifact.available} onClick={() => onSaveCopy(artifact.type)}>
              <Copy size={16} aria-hidden="true" /> Guardar copia
            </button>
          </div>
        ))}
      </div>
      <button className="secondary-link-button" type="button" onClick={onOpenLocation} disabled={!render.hasImage && !render.hasCadArtifacts}>
        <FolderOpen size={17} aria-hidden="true" /> Abrir ubicación del archivo
      </button>
    </section>
  );
}
