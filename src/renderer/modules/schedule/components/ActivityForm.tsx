import {
  useMemo,
  useState,
  type FormEvent
} from 'react';
import { X } from 'lucide-react';
import { ActivityPriority } from '@shared/constants/activity-priority';
import { ActivityStage } from '@shared/constants/activity-stage';
import { ActivityStatus } from '@shared/constants/activity-status';
import { activitySchema } from '@shared/schemas/activity.schema';
import type {
  ActivityInput,
  ProjectActivity,
  ScheduleResponsibleUser
} from '@shared/types';
import {
  ACTIVITY_PRIORITY_LABEL,
  ACTIVITY_STAGE_LABEL,
  ACTIVITY_STATUS_LABEL
} from '../schedule-labels';

interface ActivityFormProps {
  activity?: ProjectActivity | null;
  users: ScheduleResponsibleUser[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: ActivityInput) => void;
}

function toDateInput(value: string): string {
  return value.slice(0, 10);
}

function dateToIso(value: string): string {
  return new Date(`${value}T12:00:00`).toISOString();
}

export function ActivityForm({
  activity,
  users,
  isSaving,
  onCancel,
  onSubmit
}: ActivityFormProps): JSX.Element {
  const initial = useMemo(
    () => ({
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      stage: activity?.stage ?? ActivityStage.PRODUCTION,
      assignedUserId: activity?.assignedUserId ?? '',
      assignedPersonName:
        activity?.assignedPersonName ?? '',
      startDate: activity
        ? toDateInput(activity.startDate)
        : new Date().toISOString().slice(0, 10),
      dueDate: activity
        ? toDateInput(activity.dueDate)
        : new Date().toISOString().slice(0, 10),
      status: activity?.status ?? ActivityStatus.TODO,
      priority:
        activity?.priority ?? ActivityPriority.MEDIUM,
      progressPercent: activity?.progressPercent ?? 0,
      notes: activity?.notes ?? ''
    }),
    [activity]
  );

  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');

  const submit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setError('');

    const input: ActivityInput = {
      title: form.title,
      description: form.description || null,
      stage: form.stage,
      assignedUserId: form.assignedUserId || null,
      assignedPersonName:
        form.assignedPersonName || null,
      startDate: dateToIso(form.startDate),
      dueDate: dateToIso(form.dueDate),
      status: form.status,
      priority: form.priority,
      progressPercent:
        form.status === ActivityStatus.DONE
          ? 100
          : form.progressPercent,
      notes: form.notes || null
    };

    const validation =
      activitySchema.safeParse(input);

    if (!validation.success) {
      setError(
        validation.error.issues
          .map((issue) => issue.message)
          .join(' ')
      );
      return;
    }

    onSubmit(validation.data);
  };

  return (
    <div
      className="schedule-form-overlay"
      role="presentation"
    >
      <form
        className="schedule-activity-form"
        onSubmit={submit}
        aria-labelledby="activity-form-title"
      >
        <header className="schedule-form-header">
          <div>
            <span>Cronograma</span>
            <h3 id="activity-form-title">
              {activity
                ? 'Editar actividad'
                : 'Nueva actividad'}
            </h3>
          </div>

          <button
            className="schedule-modal-close"
            type="button"
            onClick={onCancel}
            aria-label="Cerrar formulario"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="schedule-form-grid">
          <label className="schedule-form-full">
            <span>Título</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title: event.target.value
                })
              }
            />
          </label>

          <label className="schedule-form-full">
            <span>Descripción</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value
                })
              }
            />
          </label>

          <label>
            <span>Etapa</span>
            <select
              value={form.stage}
              onChange={(event) =>
                setForm({
                  ...form,
                  stage: event.target.value as ActivityStage
                })
              }
            >
              {Object.values(ActivityStage).map(
                (stage) => (
                  <option key={stage} value={stage}>
                    {ACTIVITY_STAGE_LABEL[stage]}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>Prioridad</span>
            <select
              value={form.priority}
              onChange={(event) =>
                setForm({
                  ...form,
                  priority: event.target
                    .value as ActivityPriority
                })
              }
            >
              {Object.values(ActivityPriority).map(
                (priority) => (
                  <option key={priority} value={priority}>
                    {ACTIVITY_PRIORITY_LABEL[priority]}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>Responsable</span>
            <select
              value={form.assignedUserId}
              onChange={(event) =>
                setForm({
                  ...form,
                  assignedUserId: event.target.value
                })
              }
            >
              <option value="">
                Sin usuario asignado
              </option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Responsable externo o manual</span>
            <input
              value={form.assignedPersonName}
              onChange={(event) =>
                setForm({
                  ...form,
                  assignedPersonName: event.target.value
                })
              }
            />
          </label>

          <label>
            <span>Fecha de inicio</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  startDate: event.target.value
                })
              }
            />
          </label>

          <label>
            <span>Fecha límite</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  dueDate: event.target.value
                })
              }
            />
          </label>

          <label>
            <span>Estado</span>
            <select
              value={form.status}
              onChange={(event) => {
                const status =
                  event.target.value as ActivityStatus;

                setForm({
                  ...form,
                  status,
                  progressPercent:
                    status === ActivityStatus.DONE
                      ? 100
                      : form.progressPercent
                });
              }}
            >
              {Object.values(ActivityStatus).map(
                (status) => (
                  <option key={status} value={status}>
                    {ACTIVITY_STATUS_LABEL[status]}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>
              Avance:{' '}
              {form.status === ActivityStatus.DONE
                ? 100
                : form.progressPercent}
              %
            </span>

            <input
              className="schedule-range"
              type="range"
              min={0}
              max={100}
              step={5}
              disabled={
                form.status === ActivityStatus.DONE
              }
              value={
                form.status === ActivityStatus.DONE
                  ? 100
                  : form.progressPercent
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  progressPercent: Number(
                    event.target.value
                  )
                })
              }
            />
          </label>

          <label className="schedule-form-full">
            <span>Notas</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm({
                  ...form,
                  notes: event.target.value
                })
              }
            />
          </label>
        </div>

        {form.progressPercent === 100 &&
        form.status !== ActivityStatus.DONE ? (
          <p className="schedule-form-hint">
            El avance llegó a 100%. Se sugiere cambiar
            el estado a “Terminada”.
          </p>
        ) : null}

        {error ? (
          <div
            className="schedule-form-error"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="schedule-form-actions">
          <button
            className="schedule-cancel-button"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            className="schedule-save-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? 'Guardando...'
              : 'Guardar actividad'}
          </button>
        </div>
      </form>
    </div>
  );
}
