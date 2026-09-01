import { ArrowLeft, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { RenderSettingsInput } from '@shared/types';
import { RENDER_RESOLUTION_PRESETS } from '@shared/constants/render-options';
import { renderSettingsSchema } from '@shared/schemas/render.schema';
import { useProjectQuery } from '@renderer/modules/projects/project.queries';
import { useSessionStore } from '@renderer/stores/session.store';
import { getErrorMessage } from '@renderer/utils/formatters';
import { FreeCadStatusPanel } from './components/FreeCadStatusPanel';
import { RenderPreview, type RenderPreviewHandle } from './components/RenderPreview';
import { RenderWizard } from './components/RenderWizard';
import { useCompleteRenderMutation, usePrepareRenderMutation } from './hooks/useRenderQueries';
import './renders.css';

export function RenderEditorPage(): JSX.Element {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const projectQuery = useProjectQuery(projectId);
  const designQuery = useQuery({
    queryKey: ['design', projectId],
    queryFn: () => window.simboApi.getDesignByProjectId(projectId ?? ''),
    enabled: Boolean(projectId)
  });
  const previewRef = useRef<RenderPreviewHandle>(null);
  const [settings, setSettings] = useState<RenderSettingsInput>({
    title: 'Render del proyecto',
    resolution: 'FULL_HD',
    imageFormat: 'PNG',
    viewType: 'ISOMETRIC',
    quality: 'HIGH',
    notes: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [phase, setPhase] = useState('Generando render...');

  const designId = designQuery.data?.id ?? '';
  const prepareMutation = usePrepareRenderMutation(projectId ?? '', designId);
  const completeMutation = useCompleteRenderMutation(projectId ?? '');

  useEffect(() => {
    if (projectQuery.data && settings.title === 'Render del proyecto') {
      setSettings((current) => ({
        ...current,
        title: `Render de ${projectQuery.data?.name ?? 'proyecto'}`
      }));
    }
  }, [projectQuery.data, settings.title]);

  const generate = async (): Promise<void> => {
    setErrorMessage('');

    if (!projectId || !designQuery.data) {
      setErrorMessage('No hay un diseño disponible para generar el render.');
      return;
    }

    if (designQuery.data.modules.length === 0) {
      setErrorMessage('Agrega al menos un módulo antes de generar el render.');
      return;
    }

    if (designQuery.data.modules.some((module) => module.hasCollision)) {
      setErrorMessage('No se puede generar el render porque existen módulos superpuestos.');
      return;
    }

    const parsed = renderSettingsSchema.safeParse(settings);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Revisa la configuración del render.');
      return;
    }

    let preparedRenderId: string | null = null;
    let completionStarted = false;

    try {
      setPhase('Preparando render...');
      const prepared = await prepareMutation.mutateAsync({
        ...parsed.data,
        createdByUserId: user?.id
      });
      preparedRenderId = prepared.id;

      const preset = RENDER_RESOLUTION_PRESETS[parsed.data.resolution];
      setPhase('Generando render...');
      const imageDataUrl = await previewRef.current?.capture({
        width: preset.width,
        height: preset.height,
        imageFormat: parsed.data.imageFormat,
        quality: parsed.data.quality
      });

      if (!imageDataUrl) {
        throw new Error('No se pudo capturar la escena 3D.');
      }

      setPhase('Guardando imagen y generando modelo CAD...');
      completionStarted = true;
      const result = await completeMutation.mutateAsync({
        renderId: prepared.id,
        imageDataUrl
      });
      navigate(`/projects/${projectId}/renders/${result.render.id}`);
    } catch (error) {
      const message = getErrorMessage(error);

      if (preparedRenderId && !completionStarted) {
        try {
          await window.simboApi.failProjectRender(preparedRenderId, message);
        } catch {
          // El error original es el que se muestra al usuario.
        }
      }

      setErrorMessage(message);
    }
  };

  if (projectQuery.isLoading || designQuery.isLoading) {
    return <section className="page-panel state-card">Preparando el módulo de render...</section>;
  }

  if (!projectId || projectQuery.isError || !projectQuery.data || designQuery.isError) {
    return (
      <section className="page-panel state-card state-card-error">
        {getErrorMessage(projectQuery.error ?? designQuery.error)}
      </section>
    );
  }

  if (!designQuery.data) {
    return (
      <section className="render-requirements-card">
        <h2>Generación de render</h2>
        <p>Primero crea y guarda un diseño 2D/3D para este proyecto.</p>
        <Link className="render-primary-button" to={`/projects/${projectId}/design`}>
          Abrir editor de diseño
        </Link>
      </section>
    );
  }

  const design = designQuery.data;
  const hasCollision = design.modules.some((module) => module.hasCollision);
  const isGenerating = prepareMutation.isPending || completeMutation.isPending;

  return (
    <section className="render-module-page" aria-labelledby="render-editor-title">
      <div className="render-page-toolbar">
        <div>
          <Link className="render-back-link" to={`/projects/${projectId}/renders`}>
            <ArrowLeft size={17} aria-hidden="true" /> Volver a renders
          </Link>
          <p>Proyecto: {projectQuery.data.name}</p>
        </div>
      </div>

      <header className="render-dark-titlebar">
        <h2 id="render-editor-title">Generar render</h2>
      </header>

      <div className="render-module-content">
        <FreeCadStatusPanel />

        {hasCollision ? (
          <div className="render-figma-warning" role="alert">
            <TriangleAlert size={18} aria-hidden="true" />
            No se puede generar el render porque existen módulos superpuestos.
          </div>
        ) : null}

        <div className="render-editor-layout">
          <div className="render-editor-preview-column">
            <RenderPreview
              ref={previewRef}
              design={design}
              viewType={settings.viewType}
              quality={settings.quality}
            />
            <p className="render-preview-note">
              La captura incluye únicamente la escena 3D: espacio, módulos, materiales básicos, cámara e iluminación.
            </p>
          </div>

          <RenderWizard
            value={settings}
            onChange={setSettings}
            onCancel={() => navigate(`/projects/${projectId}/renders`)}
            onGenerate={() => void generate()}
            isGenerating={isGenerating}
            generationLabel={phase}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </section>
  );
}
