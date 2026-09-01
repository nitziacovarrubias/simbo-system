import { ArrowLeft, CheckCircle2, Copy, Image, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { RenderCopyArtifactType, RenderSummary } from '@shared/types';
import { getErrorMessage } from '@renderer/utils/formatters';
import { CadArtifactsPanel } from './components/CadArtifactsPanel';
import { FreeCadStatusPanel } from './components/FreeCadStatusPanel';
import { RenderMetadataPanel } from './components/RenderMetadataPanel';
import { RenderVersionSelector } from './components/RenderVersionSelector';
import { useRenderImageQuery, useRenderQuery, useRendersQuery } from './hooks/useRenderQueries';
import './renders.css';

interface VersionThumbnailProps {
  render: RenderSummary;
  isCurrent: boolean;
  onSelect: (renderId: string) => void;
}

function VersionThumbnail({ render, isCurrent, onSelect }: VersionThumbnailProps): JSX.Element {
  const imageQuery = useRenderImageQuery(render.id);

  return (
    <button
      className={`render-version-thumb ${isCurrent ? 'is-current' : ''}`}
      type="button"
      onClick={() => onSelect(render.id)}
      aria-label={`Abrir versión ${render.versionNumber}`}
    >
      {imageQuery.data ? (
        <img src={imageQuery.data} alt="" />
      ) : (
        <span className="render-version-thumb-placeholder">
          <Image size={23} aria-hidden="true" />
        </span>
      )}
      <strong>v{render.versionNumber}</strong>
    </button>
  );
}

export function RenderViewerPage(): JSX.Element {
  const { projectId, renderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const renderQuery = useRenderQuery(renderId);
  const imageQuery = useRenderImageQuery(renderId);
  const rendersQuery = useRendersQuery(projectId);
  const [message, setMessage] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isGeneratingCad, setIsGeneratingCad] = useState(false);

  const refresh = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['render', renderId] }),
      queryClient.invalidateQueries({ queryKey: ['renders', projectId] }),
      queryClient.invalidateQueries({ queryKey: ['render-image', renderId] })
    ]);
  };

  const saveCopy = async (type: RenderCopyArtifactType): Promise<void> => {
    if (!renderId) return;
    setMessage('');

    try {
      const result = await window.simboApi.saveRenderCopy(renderId, type);
      setMessage(
        result.saved
          ? `Copia guardada como ${result.fileName ?? 'archivo'}.`
          : 'Se canceló el guardado de la copia.'
      );
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const generateCad = async (): Promise<void> => {
    if (!renderId) return;
    setIsGeneratingCad(true);
    setMessage('Generando modelo CAD...');

    try {
      const warnings = await window.simboApi.generateRenderCad(renderId);
      await refresh();
      setMessage(
        warnings.length > 0
          ? `CAD generado con avisos: ${warnings.join(' ')}`
          : 'Modelo CAD generado correctamente.'
      );
    } catch (error) {
      await refresh();
      setMessage(getErrorMessage(error));
    } finally {
      setIsGeneratingCad(false);
    }
  };

  const approve = async (): Promise<void> => {
    if (!renderId) return;

    try {
      await window.simboApi.approveRender(renderId, decisionNotes);
      await refresh();
      setMessage('Render aprobado.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const reject = async (): Promise<void> => {
    if (!renderId) return;

    if (decisionNotes.trim().length < 5) {
      setMessage('Escribe un motivo de al menos 5 caracteres para rechazar.');
      return;
    }

    try {
      await window.simboApi.rejectRender(renderId, decisionNotes);
      await refresh();
      setMessage('Render rechazado.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  if (renderQuery.isLoading || imageQuery.isLoading || rendersQuery.isLoading) {
    return <section className="page-panel state-card">Cargando render...</section>;
  }

  if (!projectId || !renderId || renderQuery.isError || !renderQuery.data || rendersQuery.isError) {
    return (
      <section className="page-panel state-card state-card-error">
        {getErrorMessage(renderQuery.error ?? rendersQuery.error)}
      </section>
    );
  }

  const render = renderQuery.data;
  const versions = rendersQuery.data ?? [];

  return (
    <section className="render-module-page" aria-labelledby="render-viewer-title">
      <div className="render-page-toolbar">
        <div>
          <Link className="render-back-link" to={`/projects/${projectId}/renders`}>
            <ArrowLeft size={17} aria-hidden="true" /> Volver a renders
          </Link>
          <p>Vista individual · versión {render.versionNumber}</p>
        </div>

        <div className="render-toolbar-actions">
          <button
            className="render-secondary-button"
            type="button"
            onClick={() => void saveCopy('IMAGE')}
            disabled={!render.hasImage}
          >
            <Copy size={17} aria-hidden="true" /> Guardar copia
          </button>
          <button
            className="render-primary-button"
            type="button"
            onClick={() => navigate(`/projects/${projectId}/renders/new`)}
          >
            <Image size={17} aria-hidden="true" /> Generar nueva versión
          </button>
        </div>
      </div>

      <header className="render-dark-titlebar">
        <h2 id="render-viewer-title">Render</h2>
      </header>

      <div className="render-module-content">
        <FreeCadStatusPanel />

        {message ? <div className="render-message" role="status">{message}</div> : null}

        <div className="render-viewer-layout">
          <article className="render-main-card">
            <div className="render-main-image-wrap">
              {imageQuery.data ? (
                <img src={imageQuery.data} alt={`Render ${render.title}`} />
              ) : (
                <div className="render-image-placeholder">
                  <Image size={46} aria-hidden="true" />
                  <span>La imagen no está disponible.</span>
                </div>
              )}

              <span className="render-number-badge">
                NUM. {String(render.versionNumber).padStart(2, '0')}
              </span>
            </div>

            <div className="render-main-copy">
              <span className="render-main-copy-line" aria-hidden="true" />
              <h3>{render.title}</h3>
              <p>{render.notes || 'Render generado desde la escena 3D del proyecto.'}</p>
            </div>
          </article>

          <div className="render-viewer-side">
            <RenderMetadataPanel render={render} />

            <div className="render-versions-block">
              <div className="render-versions-heading">
                <h3>Versiones</h3>
                <RenderVersionSelector
                  renders={versions}
                  currentId={render.id}
                  onSelect={(id) => navigate(`/projects/${projectId}/renders/${id}`)}
                />
              </div>

              <div className="render-version-thumbnails">
                {versions.slice(0, 4).map((version) => (
                  <VersionThumbnail
                    key={version.id}
                    render={version}
                    isCurrent={version.id === render.id}
                    onSelect={(id) => navigate(`/projects/${projectId}/renders/${id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="render-lower-panel">
          <CadArtifactsPanel
            render={render}
            isGenerating={isGeneratingCad}
            onGenerateCad={() => void generateCad()}
            onSaveCopy={(type) => void saveCopy(type)}
            onOpenLocation={() => {
              void window.simboApi
                .openRenderLocation(render.id)
                .catch((error: unknown) => setMessage(getErrorMessage(error)));
            }}
          />
        </div>

        <section className="render-decision-panel-figma" aria-labelledby="render-decision-title">
          <div>
            <p className="render-kicker">Validación</p>
            <h3 id="render-decision-title">Aprobación del render</h3>
          </div>

          <textarea
            value={decisionNotes}
            onChange={(event) => setDecisionNotes(event.target.value)}
            placeholder="Notas de aprobación o motivo de rechazo"
            rows={3}
          />

          <div className="render-decision-actions">
            <button
              className="render-primary-button"
              type="button"
              onClick={() => void approve()}
              disabled={render.status === 'GENERATING' || render.status === 'FAILED'}
            >
              <CheckCircle2 size={17} aria-hidden="true" /> Aprobar
            </button>

            <button
              className="render-danger-button"
              type="button"
              onClick={() => void reject()}
              disabled={render.status === 'GENERATING'}
            >
              <XCircle size={17} aria-hidden="true" /> Rechazar
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
