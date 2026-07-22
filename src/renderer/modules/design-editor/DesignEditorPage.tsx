import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DesignStatus } from '@shared/constants/domain.enums';
import { getErrorMessage } from '@renderer/utils/formatters';
import { useProjectQuery } from '@renderer/modules/projects/project.queries';
import { useEditorStore } from '@renderer/stores/editor.store';
import { DesignWizardSidebar } from './components/DesignWizardSidebar';
import { ModuleCatalog } from './components/ModuleCatalog';
import { SelectedModulePanel } from './components/SelectedModulePanel';
import { DesignCanvas } from './components/DesignCanvas';
import { EditorToolbar, type CameraCommandType } from './components/EditorToolbar';
import { EditorStatusBar } from './components/EditorStatusBar';
import { useDesignAutosave } from './hooks/useDesignAutosave';

export function DesignEditorPage(): JSX.Element {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectQuery = useProjectQuery(projectId);
  const designQuery = useQuery({
    queryKey: ['design', projectId],
    queryFn: () => window.simboApi.getDesignByProjectId(projectId ?? ''),
    enabled: Boolean(projectId && projectQuery.data?.roomSpace)
  });
  const templatesQuery = useQuery({
    queryKey: ['module-templates'],
    queryFn: () => window.simboApi.getModuleTemplates()
  });
  const materialsQuery = useQuery({
    queryKey: ['design-materials'],
    queryFn: () => window.simboApi.getMaterials()
  });

  const initializeEditor = useEditorStore((state) => state.initializeEditor);
  const resetEditor = useEditorStore((state) => state.resetEditor);
  const currentDesignId = useEditorStore((state) => state.currentDesignId);
  const validateCollisions = useEditorStore((state) => state.validateCollisions);
  const [cameraCommand, setCameraCommand] = useState({ id: 0, type: 'reset' as CameraCommandType });
  const [pageMessage, setPageMessage] = useState('');
  const creatingRef = useRef(false);
  const { saveNow } = useDesignAutosave(currentDesignId);

  useEffect(() => () => resetEditor(), [resetEditor]);

  useEffect(() => {
    if (designQuery.data && designQuery.data.id !== currentDesignId) {
      initializeEditor(designQuery.data);
    }
  }, [currentDesignId, designQuery.data, initializeEditor]);

  useEffect(() => {
    const project = projectQuery.data;
    if (
      !projectId ||
      !project?.roomSpace ||
      designQuery.isLoading ||
      designQuery.data !== null ||
      creatingRef.current
    ) {
      return;
    }

    creatingRef.current = true;
    void window.simboApi
      .createDesign(projectId, {
        title: `Diseño de ${project.name}`,
        roomSpace: project.roomSpace,
        viewMode: '3D',
        notes: 'Diseño preliminar creado desde las medidas del proyecto.'
      })
      .then((design) => {
        initializeEditor(design);
        queryClient.setQueryData(['design', projectId], design);
      })
      .catch((error: unknown) => setPageMessage(getErrorMessage(error)))
      .finally(() => {
        creatingRef.current = false;
      });
  }, [designQuery.data, designQuery.isLoading, initializeEditor, projectId, projectQuery.data, queryClient]);

  const runCameraCommand = (type: CameraCommandType): void =>
    setCameraCommand((current) => ({ id: current.id + 1, type }));

  const finishDesign = async (): Promise<void> => {
    setPageMessage('');
    if (!validateCollisions()) {
      setPageMessage('Hay módulos superpuestos. Corrige su posición antes de finalizar.');
      return;
    }
    const saved = await saveNow();
    if (!saved || !currentDesignId) {
      setPageMessage('No se pudo guardar el diseño antes de finalizar.');
      return;
    }
    await window.simboApi.updateDesign(currentDesignId, { status: DesignStatus.IN_REVIEW });
    setPageMessage('Diseño finalizado y disponible para revisión.');
    window.setTimeout(() => navigate(`/projects/${projectId}`), 700);
  };

  if (projectQuery.isLoading) {
    return <section className="page-panel state-card">Cargando editor de diseño...</section>;
  }

  if (projectQuery.isError || !projectQuery.data || !projectId) {
    return <section className="page-panel state-card state-card-error">{getErrorMessage(projectQuery.error)}</section>;
  }

  if (!projectQuery.data.roomSpace) {
    return (
      <section className="page-panel design-requirements-card">
        <h2>Editor de diseño</h2>
        <p>Primero captura las medidas del espacio antes de iniciar el diseño.</p>
        <Link className="accent-button" to={`/projects/${projectId}`}>Volver al proyecto</Link>
      </section>
    );
  }

  if (designQuery.isError) {
    return (
      <section className="page-panel state-card state-card-error">
        {getErrorMessage(designQuery.error)}
      </section>
    );
  }

  if (pageMessage && !currentDesignId) {
    return <section className="page-panel state-card state-card-error">{pageMessage}</section>;
  }

  if (!currentDesignId || templatesQuery.isLoading || materialsQuery.isLoading) {
    return <section className="page-panel state-card">Preparando espacio, catálogo y materiales...</section>;
  }

  if (templatesQuery.isError || materialsQuery.isError) {
    return (
      <section className="page-panel state-card state-card-error">
        {getErrorMessage(templatesQuery.error ?? materialsQuery.error)}
      </section>
    );
  }

  return (
    <section className="design-editor-page" aria-labelledby="design-editor-title">
      <header className="design-editor-header">
        <div>
          <Link className="back-link" to={`/projects/${projectId}`}>
            <ArrowLeft size={17} aria-hidden="true" /> Volver al proyecto
          </Link>
          <p className="page-eyebrow">Proyecto: {projectQuery.data.name}</p>
          <h2 id="design-editor-title">Editor de diseño</h2>
        </div>
        <div className="design-editor-header-actions">
          <button className="secondary-link-button" type="button" onClick={() => void saveNow()}>
            <Save size={17} aria-hidden="true" /> Guardar diseño
          </button>
          <button className="accent-button" type="button" onClick={() => void finishDesign()}>
            <CheckCircle2 size={17} aria-hidden="true" /> Finalizar diseño
          </button>
        </div>
      </header>

      {pageMessage ? <div className="editor-page-message" role="alert">{pageMessage}</div> : null}

      <div className="design-editor-layout">
        <DesignWizardSidebar />
        <main className="design-workspace">
          <EditorToolbar onCameraCommand={runCameraCommand} />
          <DesignCanvas cameraCommand={cameraCommand} />
          <EditorStatusBar />
        </main>
        <aside className="design-properties-column">
          <ModuleCatalog templates={templatesQuery.data ?? []} />
          <SelectedModulePanel materials={materialsQuery.data ?? []} />
        </aside>
      </div>
    </section>
  );
}
