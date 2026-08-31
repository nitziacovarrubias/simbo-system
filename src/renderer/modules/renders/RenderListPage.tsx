import { ArrowLeft, Image, Plus, TriangleAlert } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProjectQuery } from '@renderer/modules/projects/project.queries';
import { getErrorMessage } from '@renderer/utils/formatters';
import { FreeCadStatusPanel } from './components/FreeCadStatusPanel';
import { useRendersQuery } from './hooks/useRenderQueries';

const STATUS_LABEL = {
  GENERATING: 'Generando',
  PRELIMINARY: 'Preliminar',
  FINAL: 'Final',
  FAILED: 'Fallido',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
} as const;

export function RenderListPage(): JSX.Element {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProjectQuery(projectId);
  const rendersQuery = useRendersQuery(projectId);

  if (projectQuery.isLoading || rendersQuery.isLoading) {
    return <section className="page-panel state-card">Cargando renders...</section>;
  }
  if (!projectId || projectQuery.isError || !projectQuery.data || rendersQuery.isError) {
    return <section className="page-panel state-card state-card-error">{getErrorMessage(projectQuery.error ?? rendersQuery.error)}</section>;
  }

  const renders = rendersQuery.data ?? [];
  const projectBlocked = ['CLOSED', 'ARCHIVED'].includes(projectQuery.data.status);

  return (
    <section className="page-panel render-list-page" aria-labelledby="render-list-title">
      <header className="module-page-header">
        <div>
          <Link className="back-link" to={`/projects/${projectId}`}><ArrowLeft size={17} aria-hidden="true" /> Volver al proyecto</Link>
          <p className="page-eyebrow">Proyecto: {projectQuery.data.name}</p>
          <h2 id="render-list-title">Renders y generación CAD</h2>
        </div>
        <button className="accent-button" type="button" onClick={() => navigate(`/projects/${projectId}/renders/new`)} disabled={projectBlocked}>
          <Plus size={18} aria-hidden="true" /> Generar nueva versión
        </button>
      </header>

      <FreeCadStatusPanel />
      {projectBlocked ? <div className="render-outdated-warning"><TriangleAlert size={17} aria-hidden="true" /> El proyecto está cerrado o archivado. Puedes consultar versiones anteriores, pero no generar nuevas.</div> : null}

      {renders.length === 0 ? (
        <div className="state-card render-empty-state">
          <Image size={32} aria-hidden="true" />
          <h3>Todavía no hay renders</h3>
          <p>Genera una imagen desde el diseño 3D y, si FreeCAD está disponible, SIMBO creará también los artefactos CAD.</p>
        </div>
      ) : (
        <div className="render-card-grid">
          {renders.map((render) => (
            <button key={render.id} className="render-card" type="button" onClick={() => navigate(`/projects/${projectId}/renders/${render.id}`)}>
              <div className="render-card-icon"><Image size={25} aria-hidden="true" /></div>
              <div>
                <p className="page-eyebrow">Versión {render.versionNumber}</p>
                <h3>{render.title}</h3>
                <p>{render.resolutionWidth} × {render.resolutionHeight} · {render.imageFormat} · {STATUS_LABEL[render.status]}</p>
                <div className="render-card-flags">
                  {render.isLatestVersion ? <span>Última versión</span> : null}
                  {render.isSourceOutdated ? <span className="is-warning">Desactualizado</span> : null}
                  {render.hasCadArtifacts ? <span>CAD disponible</span> : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
