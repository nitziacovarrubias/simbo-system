import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ClientStatus } from '@shared/constants/domain.enums';
import { clientSchema } from '@shared/schemas';
import type { ClientDetail, ClientMutationInput } from '@shared/types';
import { CLIENT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { getFormErrors, type FormErrors } from '@renderer/utils/form-errors';
import { getErrorMessage, toDateInputValue } from '@renderer/utils/formatters';
import { useClientQuery, useCreateClientMutation, useUpdateClientMutation } from './client.queries';

interface ClientFormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  rfc: string;
  projectAddress: string;
  initialContactDate: string;
  status: ClientStatus;
  notes: string;
}

interface ClientFormProps {
  title: string;
  description: string;
  initialClient?: ClientDetail;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (input: ClientMutationInput) => Promise<void>;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function createInitialState(client?: ClientDetail): ClientFormState {
  return {
    firstName: client?.firstName ?? '',
    lastName: client?.lastName ?? '',
    phone: client?.phone ?? '',
    email: client?.email ?? '',
    address: client?.address ?? '',
    rfc: client?.rfc ?? '',
    projectAddress: client?.projectAddress ?? '',
    initialContactDate: toDateInputValue(client?.initialContactDate) || todayInputValue(),
    status: client?.status ?? ClientStatus.ACTIVE,
    notes: client?.notes ?? ''
  };
}

function fieldError(errors: FormErrors, field: keyof ClientFormState): JSX.Element | null {
  return errors[field] ? <span className="field-error">{errors[field]}</span> : null;
}

export function ClientForm({
  title,
  description,
  initialClient,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit
}: ClientFormProps): JSX.Element {
  const [form, setForm] = useState<ClientFormState>(() => createInitialState(initialClient));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(createInitialState(initialClient));
  }, [initialClient]);

  function updateField<K extends keyof ClientFormState>(field: K, value: ClientFormState[K]): void {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const result = clientSchema.safeParse(form);

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
    <section className="page-panel" aria-labelledby="client-form-title">
      <div className="module-page-header">
        <div>
          <Link
            className="back-link"
            to={initialClient ? `/clients/${initialClient.id}` : '/clients'}
          >
            <ArrowLeft size={17} aria-hidden="true" /> Volver
          </Link>
          <p className="page-eyebrow">Datos del cliente</p>
          <h2 id="client-form-title">{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <form className="entity-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <fieldset className="form-section">
          <legend>Información personal</legend>
          <div className="form-grid two-columns">
            <label>
              Nombre <span aria-hidden="true">*</span>
              <input
                value={form.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                aria-invalid={Boolean(errors.firstName)}
                autoComplete="given-name"
              />
              {fieldError(errors, 'firstName')}
            </label>

            <label>
              Apellido <span aria-hidden="true">*</span>
              <input
                value={form.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                aria-invalid={Boolean(errors.lastName)}
                autoComplete="family-name"
              />
              {fieldError(errors, 'lastName')}
            </label>

            <label>
              Teléfono
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                aria-invalid={Boolean(errors.phone)}
                autoComplete="tel"
              />
              {fieldError(errors, 'phone')}
            </label>

            <label>
              Correo electrónico
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                aria-invalid={Boolean(errors.email)}
                autoComplete="email"
              />
              {fieldError(errors, 'email')}
            </label>

            <label className="span-two">
              Dirección
              <input
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                aria-invalid={Boolean(errors.address)}
                autoComplete="street-address"
              />
              {fieldError(errors, 'address')}
            </label>

            <label>
              RFC
              <input
                value={form.rfc}
                onChange={(event) => updateField('rfc', event.target.value.toUpperCase())}
                aria-invalid={Boolean(errors.rfc)}
              />
              {fieldError(errors, 'rfc')}
            </label>

            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as ClientStatus)}
              >
                {Object.values(ClientStatus).map((status) => (
                  <option key={status} value={status}>
                    {CLIENT_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Datos del proyecto</legend>
          <div className="form-grid two-columns">
            <label className="span-two">
              Dirección del proyecto
              <input
                value={form.projectAddress}
                onChange={(event) => updateField('projectAddress', event.target.value)}
                aria-invalid={Boolean(errors.projectAddress)}
              />
              {fieldError(errors, 'projectAddress')}
            </label>

            <label>
              Fecha de contacto inicial
              <input
                type="date"
                value={form.initialContactDate}
                onChange={(event) => updateField('initialContactDate', event.target.value)}
                aria-invalid={Boolean(errors.initialContactDate)}
              />
              {fieldError(errors, 'initialContactDate')}
            </label>

            <label className="span-two">
              Notas
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                aria-invalid={Boolean(errors.notes)}
              />
              {fieldError(errors, 'notes')}
            </label>
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
            to={initialClient ? `/clients/${initialClient.id}` : '/clients'}
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

export function NewClientPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createMutation = useCreateClientMutation();
  const returnTo = searchParams.get('returnTo');

  async function handleSubmit(input: ClientMutationInput): Promise<void> {
    const client = await createMutation.mutateAsync(input);
    if (returnTo?.startsWith('/')) {
      navigate(`${returnTo}?clientId=${client.id}`);
      return;
    }
    navigate(`/clients/${client.id}`);
  }

  return (
    <ClientForm
      title="Nuevo cliente"
      description="Registra la información necesaria para asociar proyectos y mantener el contacto."
      submitLabel="Guardar cliente"
      isSubmitting={createMutation.isPending}
      submitError={createMutation.isError ? getErrorMessage(createMutation.error) : undefined}
      onSubmit={handleSubmit}
    />
  );
}

export function EditClientPage(): JSX.Element {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const clientQuery = useClientQuery(clientId);
  const updateMutation = useUpdateClientMutation(clientId ?? '');

  if (clientQuery.isLoading) {
    return <section className="page-panel state-card">Cargando cliente...</section>;
  }

  if (clientQuery.isError || !clientQuery.data || !clientId) {
    return (
      <section className="page-panel">
        <div className="state-card state-card-error" role="alert">
          {getErrorMessage(clientQuery.error)}
        </div>
      </section>
    );
  }

  async function handleSubmit(input: ClientMutationInput): Promise<void> {
    await updateMutation.mutateAsync(input);
    navigate(`/clients/${clientId}`);
  }

  return (
    <ClientForm
      title="Editar cliente"
      description="Actualiza la información del cliente sin perder sus proyectos asociados."
      initialClient={clientQuery.data}
      submitLabel="Guardar cambios"
      isSubmitting={updateMutation.isPending}
      submitError={updateMutation.isError ? getErrorMessage(updateMutation.error) : undefined}
      onSubmit={handleSubmit}
    />
  );
}
