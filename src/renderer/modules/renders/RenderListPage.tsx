import { ArrowLeft, Image, Plus, TriangleAlert } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { RenderSummary } from '@shared/types';
import { useProjectQuery } from '@renderer/modules/projects/project.queries';
import { getErrorMessage } from '@renderer/utils/formatters';
import { FreeCadStatusPanel } from './components/FreeCadStatusPanel';
import { useRenderImageQuery, useRendersQuery } from './hooks/useRenderQueries';
import './renders.css';

const STATUS_LABEL = {
  GENERATING: 'Generando',
  PRELIMINARY: 'Preliminar',
  FINAL: 'Final',
  FAILED: 'Fallido',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
} as const;

interface RenderShowcaseCardProps {
  projectId: string;
  render: RenderSummary;
}

function RenderShowcaseCard({ projectId, render }: RenderShowcaseCardProps): JSX.Element {
  const imageQuery = useRenderImageQuery(render.id);
  const navigate = useNavigate();

  return (
    <article className="render-showcase-card">
      <button
        className="render-showcase-preview"
        type="button"
        onClick={() => navigate(`/projects/${projectId}/renders/${render.id}`)}
        aria-label={`Abrir ${render.title}`}
      >
        {imageQuery.data ? (
          <img src={imageQuery.data} alt={render.title} />
        ) : (
          <div className="render-showcase-placeholder">
            <Image size={44} aria-hidden="true" />
            <span>Vista no disponible</span>
          </div>
        )}

        <span className="render-number-badge">
          NUM. {String(render.versionNumber).padStart(2, '0')}
        </span>
      </button>

      <div className="render-showcase-copy">
        <div className="render-showcase-accent" aria-hidden="true" />

        <div>
          <p className="render-showcase-status">
            {STATUS_LABEL[render.status]}
            {render.isLatestVersion ? ' · Última versión' : ''}
          </p>
          <h3>{render.title}</h3>
          <p>
            {render.resolutionWidth} × {render.resolutionHeight} · {render.imageFormat}
          </p>
        </div>

        <div className="render-showcase-flags" aria-label="Estado del render">
          {render.isSourceOutdated ? <span className="is-warning">Desactualizado</span> : null}
          {render.hasCadArtifacts ? <span>CAD disponible</span> : null}
        </div>

        <Link className="render-text-link" to={`/projects/${projectId}/renders/${render.id}`}>
          Mostrar
        </Link>
      </div>
    </article>
  );
}

export function RenderListPage(): JSX.Element {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProjectQuery(projectId);
  const rendersQuery = useRendersQuery(projectId);

  if (projectQuery.isLoading || rendersQuery.isLoading) {
    return <section className="page-panel state-card">Cargando renders...</section>;
  }

  if (!projectId || projectQuery.isError || !projectQuery.data || rendersQuery.isError) {
    return (
      <section className="page-panel state-card state-card-error">
        {getErrorMessage(projectQuery.error ?? rendersQuery.error)}
      </section>
    );
  }

  const renders = rendersQuery.data ?? [];
  const projectBlocked = ['CLOSED', 'ARCHIVED'].includes(projectQuery.data.status);

  return (
    <section className="render-module-page" aria-labelledby="render-list-title">
      <div className="render-page-toolbar">
        <div>
          <Link className="render-back-link" to={`/projects/${projectId}`}>
            <ArrowLeft size={17} aria-hidden="true" /> Volver al proyecto
          </Link>
          <p>Proyecto: {projectQuery.data.name}</p>
        </div>

        <button
          className="render-primary-button"
          type="button"
          onClick={() => navigate(`/projects/${projectId}/renders/new`)}
          disabled={projectBlocked}
        >
          <Plus size={18} aria-hidden="true" /> Generar nueva versión
        </button>
      </div>

      <header className="render-dark-titlebar">
        <h2 id="render-list-title">Render</h2>
      </header>

      <div className="render-module-content">
        <FreeCadStatusPanel />

        {projectBlocked ? (
          <div className="render-figma-warning" role="alert">
            <TriangleAlert size={18} aria-hidden="true" />
            El proyecto está cerrado o archivado. Puedes consultar versiones anteriores, pero no generar nuevas.
          </div>
        ) : null}

        {renders.length === 0 ? (
          <div className="render-empty-state-figma">
            <Image size={46} aria-hidden="true" />
            <h3>Todavía no hay renders</h3>
            <p>
              Genera una imagen desde el diseño 3D y, si FreeCAD está disponible, SIMBO creará también los artefactos CAD.
            </p>
            <button
              className="render-primary-button"
              type="button"
              onClick={() => navigate(`/projects/${projectId}/renders/new`)}
              disabled={projectBlocked}
            >
              <Plus size={18} aria-hidden="true" /> Generar render
            </button>
          </div>
        ) : (
          <div className="render-showcase-grid">
            {renders.map((render) => (
              <RenderShowcaseCard key={render.id} projectId={projectId} render={render} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
