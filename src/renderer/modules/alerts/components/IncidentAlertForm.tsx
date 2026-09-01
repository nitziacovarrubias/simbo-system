import {
  useState,
  type FormEvent
} from 'react';
import { BellPlus } from 'lucide-react';
import { AlertPriority } from '@shared/constants/alert-priority';
import { incidentAlertSchema } from '@shared/schemas/alert.schema';
import type {
  IncidentAlertInput,
  ProjectListItem
} from '@shared/types';
import { ALERT_PRIORITY_LABEL } from '@renderer/modules/schedule/schedule-labels';

interface IncidentAlertFormProps {
  fixedProjectId?: string;
  projects: ProjectListItem[];
  isSaving: boolean;
  onSubmit: (
    projectId: string,
    input: IncidentAlertInput
  ) => void;
}

function dateToIso(
  value: string
): string | null {
  return value
    ? new Date(
        `${value}T12:00:00`
      ).toISOString()
    : null;
}

export function IncidentAlertForm({
  fixedProjectId,
  projects,
  isSaving,
  onSubmit
}: IncidentAlertFormProps): JSX.Element {
  const [projectId, setProjectId] = useState(
    fixedProjectId ??
      projects[0]?.id ??
      ''
  );

  const [title, setTitle] =
    useState('');
  const [description, setDescription] =
    useState('');
  const [priority, setPriority] =
    useState(AlertPriority.MEDIUM);
  const [dueDate, setDueDate] =
    useState('');
  const [error, setError] =
    useState('');

  const submit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    if (!projectId) {
      setError(
        'Selecciona un proyecto.'
      );
      return;
    }

    const validation =
      incidentAlertSchema.safeParse({
        title,
        description,
        priority,
        dueDate: dateToIso(dueDate)
      });

    if (!validation.success) {
      setError(
        validation.error.issues
          .map(
            (issue) =>
              issue.message
          )
          .join(' ')
      );
      return;
    }

    setError('');

    onSubmit(
      projectId,
      validation.data
    );
  };

  return (
    <form
      className="incident-alert-form"
      onSubmit={submit}
      aria-labelledby="incident-form-title"
    >
      <div className="incident-alert-form__heading">
        <div>
          <span>Registro manual</span>
          <h3 id="incident-form-title">
            Nueva incidencia
          </h3>
          <p>
            Registra un riesgo o problema que necesite
            seguimiento dentro del proyecto.
          </p>
        </div>

        <BellPlus
          size={34}
          aria-hidden="true"
        />
      </div>

      <div className="incident-alert-grid">
        {!fixedProjectId ? (
          <label>
            <span>Proyecto</span>

            <select
              value={projectId}
              onChange={(event) =>
                setProjectId(
                  event.target.value
                )
              }
            >
              <option value="">
                Selecciona
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                )
              )}
            </select>
          </label>
        ) : null}

        <label>
          <span>Prioridad</span>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target
                  .value as AlertPriority
              )
            }
          >
            {Object.values(
              AlertPriority
            ).map((item) => (
              <option
                key={item}
                value={item}
              >
                {
                  ALERT_PRIORITY_LABEL[
                    item
                  ]
                }
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>
            Fecha límite opcional
          </span>

          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(
                event.target.value
              )
            }
          />
        </label>

        <label className="incident-alert-full">
          <span>Título</span>

          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
          />
        </label>

        <label className="incident-alert-full">
          <span>Descripción</span>

          <textarea
            rows={4}
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
          />
        </label>
      </div>

      {error ? (
        <div
          className="alerts-message alerts-message--error"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="incident-alert-actions">
        <button
          className="incident-alert-submit"
          type="submit"
          disabled={isSaving}
        >
          <BellPlus
            size={17}
            aria-hidden="true"
          />
          {isSaving
            ? 'Registrando...'
            : 'Registrar incidencia'}
        </button>
      </div>
    </form>
  );
}
