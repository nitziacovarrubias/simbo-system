import { useMemo, useState } from 'react';
import { BellRing } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useProjectsQuery } from '@renderer/modules/projects/project.queries';
import { getErrorMessage } from '@renderer/utils/formatters';
import {
  AlertFilters,
  type AlertFilterState
} from './components/AlertFilters';
import { AlertList } from './components/AlertList';
import { IncidentAlertForm } from './components/IncidentAlertForm';
import {
  useAlertsQuery,
  useCreateIncidentMutation,
  useDismissAlertMutation,
  useResolveAlertMutation
} from './hooks/useAlertQueries';

import './alerts.css';

export function AlertsPage(): JSX.Element {
  const { projectId } = useParams();
  const alertsQuery = useAlertsQuery(projectId);
  const projectsQuery = useProjectsQuery();
  const createIncident = useCreateIncidentMutation(projectId);
  const resolveAlert = useResolveAlertMutation(projectId);
  const dismissAlert = useDismissAlertMutation(projectId);

  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState<AlertFilterState>({
    priority: 'ALL',
    status: 'ALL',
    type: 'ALL'
  });

  const filtered = useMemo(
    () =>
      (alertsQuery.data ?? []).filter(
        (alert) =>
          (filters.priority === 'ALL' ||
            alert.priority === filters.priority) &&
          (filters.status === 'ALL' ||
            alert.status === filters.status) &&
          (filters.type === 'ALL' ||
            alert.type === filters.type)
      ),
    [alertsQuery.data, filters]
  );

  if (alertsQuery.isLoading || projectsQuery.isLoading) {
    return (
      <section className="page-panel state-card">
        Cargando alertas...
      </section>
    );
  }

  const error = [
    alertsQuery.error,
    projectsQuery.error,
    createIncident.error,
    resolveAlert.error,
    dismissAlert.error
  ].find(Boolean);

  const currentProject = (projectsQuery.data ?? []).find(
    (project) => project.id === projectId
  );

  const allAlerts = alertsQuery.data ?? [];
  const openCount = allAlerts.filter(
    (alert) =>
      alert.status === 'OPEN' ||
      alert.status === 'IN_REVIEW'
  ).length;

  const urgentCount = allAlerts.filter(
    (alert) =>
      alert.priority === 'URGENT' &&
      (alert.status === 'OPEN' ||
        alert.status === 'IN_REVIEW')
  ).length;

  const resolvedCount = allAlerts.filter(
    (alert) => alert.status === 'RESOLVED'
  ).length;

  return (
    <section
      className="alerts-page"
      aria-labelledby="alerts-page-title"
    >
      <header className="alerts-header">
        <div>
          <span>Seguimiento de riesgos</span>
          <h2 id="alerts-page-title">Alertas</h2>
          <p>
            {currentProject
              ? `${currentProject.name} · ${currentProject.clientName}`
              : 'Alertas de todos los proyectos'}
          </p>
        </div>

        {projectId ? (
          <Link
            className="alerts-header-link"
            to={`/projects/${projectId}/schedule`}
          >
            <BellRing size={18} aria-hidden="true" />
            Volver al cronograma
          </Link>
        ) : null}
      </header>

      <div className="alerts-content">
        {message ? (
          <div
            className="alerts-message alerts-message--success"
            role="status"
          >
            {message}
          </div>
        ) : null}

        {error ? (
          <div
            className="alerts-message alerts-message--error"
            role="alert"
          >
            {getErrorMessage(error)}
          </div>
        ) : null}

        <section className="alerts-summary-grid">
          <article>
            <span>Abiertas</span>
            <strong>{openCount}</strong>
          </article>

          <article>
            <span>Urgentes</span>
            <strong>{urgentCount}</strong>
          </article>

          <article>
            <span>Resueltas</span>
            <strong>{resolvedCount}</strong>
          </article>

          <article>
            <span>Total</span>
            <strong>{allAlerts.length}</strong>
          </article>
        </section>

        <IncidentAlertForm
          fixedProjectId={projectId}
          projects={projectsQuery.data ?? []}
          isSaving={createIncident.isPending}
          onSubmit={(targetProjectId, input) =>
            createIncident.mutate(
              { targetProjectId, input },
              {
                onSuccess: () =>
                  setMessage(
                    'La incidencia fue registrada.'
                  )
              }
            )
          }
        />

        <section
          className="alerts-inbox"
          aria-labelledby="alerts-list-title"
        >
          <div className="alerts-list-heading">
            <div>
              <span>Bandeja</span>
              <h3 id="alerts-list-title">
                Alertas registradas
              </h3>
              <p>
                {filtered.length} alerta(s) según los filtros actuales.
              </p>
            </div>

            <AlertFilters
              value={filters}
              onChange={setFilters}
            />
          </div>

          <AlertList
            alerts={filtered}
            isBusy={
              resolveAlert.isPending ||
              dismissAlert.isPending
            }
            onResolve={(alertId, notes) =>
              resolveAlert.mutate(
                { alertId, notes },
                {
                  onSuccess: () =>
                    setMessage(
                      'La alerta fue resuelta.'
                    )
                }
              )
            }
            onDismiss={(alertId, notes) =>
              dismissAlert.mutate(
                { alertId, notes },
                {
                  onSuccess: () =>
                    setMessage(
                      'La alerta fue descartada.'
                    )
                }
              )
            }
          />
        </section>
      </div>
    </section>
  );
}
