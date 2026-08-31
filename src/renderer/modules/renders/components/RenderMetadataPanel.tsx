import type { RenderDetail } from '@shared/types';
import { formatDate } from '@renderer/utils/formatters';

const STATUS_LABEL: Record<RenderDetail['status'], string> = {
  GENERATING: 'Generando',
  PRELIMINARY: 'Preliminar',
  FINAL: 'Final',
  FAILED: 'Fallido',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
};
const VIEW_LABEL: Record<RenderDetail['viewType'], string> = {
  ISOMETRIC: 'Isométrica',
  FRONT: 'Frontal',
  TOP: 'Planta',
  CUSTOM: 'Personalizada'
};
const QUALITY_LABEL: Record<RenderDetail['quality'], string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  ULTRA: 'Ultra'
};

export function RenderMetadataPanel({ render }: { render: RenderDetail }): JSX.Element {
  return (
    <aside className="render-metadata-panel">
      <p className="page-eyebrow">Render No. {String(render.versionNumber).padStart(2, '0')}</p>
      <h2>{render.title}</h2>
      {render.isSourceOutdated ? <div className="render-outdated-warning">Este render está desactualizado respecto al diseño asociado.</div> : null}
      {render.failureMessage ? <div className="state-card state-card-error">{render.failureMessage}</div> : null}
      <dl className="render-metadata-list">
        <div><dt>Fecha de creación</dt><dd>{formatDate(render.createdAt)}</dd></div>
        <div><dt>Estado</dt><dd>{STATUS_LABEL[render.status]}</dd></div>
        <div><dt>Formato</dt><dd>{render.imageFormat}</dd></div>
        <div><dt>Resolución</dt><dd>{render.resolutionWidth} × {render.resolutionHeight} px</dd></div>
        <div><dt>Tamaño</dt><dd>{render.sizeMb !== null ? `${render.sizeMb.toFixed(2)} MB` : 'Sin dato'}</dd></div>
        <div><dt>Tipo de vista</dt><dd>{VIEW_LABEL[render.viewType]}</dd></div>
        <div><dt>Calidad</dt><dd>{QUALITY_LABEL[render.quality]}</dd></div>
        <div><dt>Versión</dt><dd>{render.versionNumber}</dd></div>
        <div><dt>Usuario</dt><dd>{render.createdByName ?? 'No registrado'}</dd></div>
        <div><dt>Última modificación</dt><dd>{formatDate(render.updatedAt)}</dd></div>
        <div><dt>Espacio</dt><dd>{render.roomWidthMm && render.roomDepthMm && render.roomHeightMm ? `${render.roomWidthMm} × ${render.roomDepthMm} × ${render.roomHeightMm} mm` : 'Sin datos'}</dd></div>
        <div><dt>Materiales principales</dt><dd>{render.mainMaterials.length > 0 ? render.mainMaterials.join(', ') : 'Sin materiales asignados'}</dd></div>
        <div><dt>Notas</dt><dd>{render.notes || 'Sin notas'}</dd></div>
      </dl>
    </aside>
  );
}
