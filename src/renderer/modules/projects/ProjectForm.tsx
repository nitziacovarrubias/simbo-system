import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProjectStatus } from '@shared/constants/domain.enums';
import { projectSchema } from '@shared/schemas';
import type { ProjectDetail, ProjectMutationInput } from '@shared/types';
import { PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { getFormErrors, type FormErrors } from '@renderer/utils/form-errors';
import { getErrorMessage, toDateInputValue } from '@renderer/utils/formatters';
import { useClientsQuery } from '@renderer/modules/clients/client.queries';
import {
  useCreateProjectMutation,
  useProjectQuery,
  useUpdateProjectMutation
} from './project.queries';

interface ProjectFormState {
  name: string;
  clientId: string;
  location: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  deliveryDate: string;
}

interface ProjectFormProps {
  title: string;
  description: string;
  initialProject?: ProjectDetail;
  defaultClientId?: string;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (input: ProjectMutationInput) => Promise<void>;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function createInitialState(project?: ProjectDetail, defaultClientId?: string): ProjectFormState {
  return {
    name: project?.name ?? '',
    clientId: project?.client.id ?? defaultClientId ?? '',
    location: project?.location ?? '',
    description: project?.description ?? '',
    status: project?.status ?? ProjectStatus.DRAFT,
    startDate: toDateInputValue(project?.startDate) || todayInputValue(),
    deliveryDate: toDateInputValue(project?.deliveryDate)
  };
}

function fieldError(errors: FormErrors, field: keyof ProjectFormState): JSX.Element | null {
  return errors[field] ? <span className="field-error">{errors[field]}</span> : null;
}

export function ProjectForm({
  title,
  description,
  initialProject,
  defaultClientId,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit
}: ProjectFormProps): JSX.Element {
  const clientsQuery = useClientsQuery();
  const [form, setForm] = useState<ProjectFormState>(() =>
    createInitialState(initialProject, defaultClientId)
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(createInitialState(initialProject, defaultClientId));
  }, [initialProject, defaultClientId]);

  function updateField<K extends keyof ProjectFormState>(
    field: K,
    value: ProjectFormState[K]
  ): void {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const result = projectSchema.safeParse(form);

    if (!result.success) {
      setErrors(getFormErrors(result.error));
      return;
    }

    setErrors({});
    try {
      await onSubmit(result.data);
    } catch {
      // La mutación muestra el mensaje de error en el formulario.
    }
  }

  return (
    <section className="page-panel" aria-labelledby="project-form-title">
      <div className="module-page-header">
        <div>
          <Link
            className="back-link"
            to={initialProject ? `/projects/${initialProject.id}` : '/projects'}
          >
            <ArrowLeft size={17} aria-hidden="true" /> Volver
          </Link>
          <p className="page-eyebrow">Información general</p>
          <h2 id="project-form-title">{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <form className="entity-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <fieldset className="form-section">
          <legend>Información general</legend>
          <div className="form-grid two-columns">
            <label className="span-two">
              Nombre del proyecto <span aria-hidden="true">*</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                aria-invalid={Boolean(errors.name)}
                autoFocus
              />
              {fieldError(errors, 'name')}
            </label>

            <label>
              Fecha de inicio <span aria-hidden="true">*</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => updateField('startDate', event.target.value)}
                aria-invalid={Boolean(errors.startDate)}
              />
              {fieldError(errors, 'startDate')}
            </label>

            <label>
              Fecha estimada de entrega
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(event) => updateField('deliveryDate', event.target.value)}
                aria-invalid={Boolean(errors.deliveryDate)}
              />
              {fieldError(errors, 'deliveryDate')}
            </label>

            <label className="span-two">
              Ubicación
              <input
                value={form.location}
                onChange={(event) => updateField('location', event.target.value)}
                aria-invalid={Boolean(errors.location)}
                placeholder="Ej. Hermosillo, Sonora"
              />
              {fieldError(errors, 'location')}
            </label>

            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as ProjectStatus)}
                disabled={!initialProject}
              >
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {PROJECT_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
              {!initialProject ? (
                <small>Los proyectos nuevos comienzan como borrador.</small>
              ) : null}
            </label>

            <label className="span-two">
              Descripción
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                aria-invalid={Boolean(errors.description)}
              />
              {fieldError(errors, 'description')}
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Datos del cliente</legend>
          <div className="client-selector-row">
            <label>
              Cliente asociado <span aria-hidden="true">*</span>
              <select
                value={form.clientId}
                onChange={(event) => updateField('clientId', event.target.value)}
                aria-invalid={Boolean(errors.clientId)}
                disabled={clientsQuery.isLoading}
              >
                <option value="">Selecciona un cliente</option>
                {(clientsQuery.data ?? []).map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.person.fullName}
                  </option>
                ))}
              </select>
              {fieldError(errors, 'clientId')}
              {clientsQuery.isError ? (
                <span className="field-error">{getErrorMessage(clientsQuery.error)}</span>
              ) : null}
            </label>

            {!initialProject ? (
              <Link
                className="secondary-link-button compact-button"
                to="/clients/new?returnTo=%2Fprojects%2Fnew"
              >
                <UserPlus size={17} aria-hidden="true" />
                Crear cliente
              </Link>
            ) : null}
          </div>
        </fieldset>

        {submitError ? (
          <div className="form-message error-message" role="alert">
            {submitError}
          </div>
        ) : null}

        <div className="form-actions">
          <Link
            className="ghost-link-button"
            to={initialProject ? `/projects/${initialProject.id}` : '/projects'}
          >
            Cancelar
          </Link>
          <button className="primary-button inline-button" type="submit" disabled={isSubmitting}>
            <Save size={18} aria-hidden="true" />
            {isSubmitting ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

export function NewProjectPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createMutation = useCreateProjectMutation();

  async function handleSubmit(input: ProjectMutationInput): Promise<void> {
    const project = await createMutation.mutateAsync(input);
    navigate(`/projects/${project.id}`);
  }

  return (
    <ProjectForm
      title="Nuevo proyecto"
      description="Captura los datos generales. Las medidas se registran después de crear el expediente."
      defaultClientId={searchParams.get('clientId') ?? undefined}
      submitLabel="Guardar proyecto"
      isSubmitting={createMutation.isPending}
      submitError={createMutation.isError ? getErrorMessage(createMutation.error) : undefined}
      onSubmit={handleSubmit}
    />
  );
}

export function EditProjectPage(): JSX.Element {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProjectQuery(projectId);
  const updateMutation = useUpdateProjectMutation(projectId ?? '');

  if (projectQuery.isLoading) {
    return <section className="page-panel state-card">Cargando proyecto...</section>;
  }

  if (projectQuery.isError || !projectQuery.data || !projectId) {
    return (
      <section className="page-panel">
        <div className="state-card state-card-error" role="alert">
          {getErrorMessage(projectQuery.error)}
        </div>
      </section>
    );
  }

  async function handleSubmit(input: ProjectMutationInput): Promise<void> {
    await updateMutation.mutateAsync(input);
    navigate(`/projects/${projectId}`);
  }

  return (
    <ProjectForm
      title="Editar proyecto"
      description="Actualiza cliente, ubicación, estado y fechas del expediente."
      initialProject={projectQuery.data}
      submitLabel="Guardar cambios"
      isSubmitting={updateMutation.isPending}
      submitError={updateMutation.isError ? getErrorMessage(updateMutation.error) : undefined}
      onSubmit={handleSubmit}
    />
  );
}
