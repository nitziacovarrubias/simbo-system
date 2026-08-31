import { ArrowLeft, CheckCircle2, Copy, Image, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { RenderCopyArtifactType } from '@shared/types';
import { getErrorMessage } from '@renderer/utils/formatters';
import { CadArtifactsPanel } from './components/CadArtifactsPanel';
import { FreeCadStatusPanel } from './components/FreeCadStatusPanel';
import { RenderMetadataPanel } from './components/RenderMetadataPanel';
import { RenderVersionSelector } from './components/RenderVersionSelector';
import { useRenderImageQuery, useRenderQuery, useRendersQuery } from './hooks/useRenderQueries';

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
      setMessage(result.saved ? `Copia guardada como ${result.fileName ?? 'archivo'}.` : 'Se canceló el guardado de la copia.');
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
      setMessage(warnings.length > 0 ? `CAD generado con avisos: ${warnings.join(' ')}` : 'Modelo CAD generado correctamente.');
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
    return <section className="page-panel state-card state-card-error">{getErrorMessage(renderQuery.error ?? rendersQuery.error)}</section>;
  }

  const render = renderQuery.data;
  return (
    <section className="page-panel render-viewer-page" aria-labelledby="render-viewer-title">
      <header className="module-page-header">
        <div>
          <Link className="back-link" to={`/projects/${projectId}/renders`}><ArrowLeft size={17} aria-hidden="true" /> Volver a renders</Link>
          <p className="page-eyebrow">Vista individual</p>
          <h2 id="render-viewer-title">Render v{render.versionNumber}</h2>
        </div>
        <div className="project-module-actions">
          <button className="secondary-button" type="button" onClick={() => void saveCopy('IMAGE')} disabled={!render.hasImage}><Copy size={17} aria-hidden="true" /> Guardar copia</button>
          <button className="accent-button" type="button" onClick={() => navigate(`/projects/${projectId}/renders/new`)}><Image size={17} aria-hidden="true" /> Generar nueva versión</button>
        </div>
      </header>

      <FreeCadStatusPanel />
      {message ? <div className="editor-page-message" role="status">{message}</div> : null}

      <div className="render-viewer-layout">
        <div className="render-image-panel">
          {imageQuery.data ? <img src={imageQuery.data} alt={`Render ${render.title}`} /> : <div className="render-image-placeholder">La imagen no está disponible.</div>}
          <RenderVersionSelector renders={rendersQuery.data ?? []} currentId={render.id} onSelect={(id) => navigate(`/projects/${projectId}/renders/${id}`)} />
        </div>
        <RenderMetadataPanel render={render} />
      </div>

      <CadArtifactsPanel
        render={render}
        isGenerating={isGeneratingCad}
        onGenerateCad={() => void generateCad()}
        onSaveCopy={(type) => void saveCopy(type)}
        onOpenLocation={() => { void window.simboApi.openRenderLocation(render.id).catch((error: unknown) => setMessage(getErrorMessage(error))); }}
      />

      <section className="render-decision-panel" aria-labelledby="render-decision-title">
        <div>
          <p className="page-eyebrow">Validación</p>
          <h3 id="render-decision-title">Aprobación del render</h3>
        </div>
        <textarea value={decisionNotes} onChange={(event) => setDecisionNotes(event.target.value)} placeholder="Notas de aprobación o motivo de rechazo" rows={3} />
        <div className="project-module-actions">
          <button className="accent-button" type="button" onClick={() => void approve()} disabled={render.status === 'GENERATING' || render.status === 'FAILED'}><CheckCircle2 size={17} aria-hidden="true" /> Aprobar</button>
          <button className="danger-button" type="button" onClick={() => void reject()} disabled={render.status === 'GENERATING'}><XCircle size={17} aria-hidden="true" /> Rechazar</button>
        </div>
      </section>
    </section>
  );
}
