import { useMemo, useState } from 'react';
import { BellRing } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useProjectsQuery } from '@renderer/modules/projects/project.queries';
import { getErrorMessage } from '@renderer/utils/formatters';
import { AlertFilters, type AlertFilterState } from './components/AlertFilters';
import { AlertList } from './components/AlertList';
import { IncidentAlertForm } from './components/IncidentAlertForm';
import { useAlertsQuery, useCreateIncidentMutation, useDismissAlertMutation, useResolveAlertMutation } from './hooks/useAlertQueries';

export function AlertsPage(): JSX.Element {
  const { projectId } = useParams();
  const alertsQuery = useAlertsQuery(projectId);
  const projectsQuery = useProjectsQuery();
  const createIncident = useCreateIncidentMutation(projectId);
  const resolveAlert = useResolveAlertMutation(projectId);
  const dismissAlert = useDismissAlertMutation(projectId);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState<AlertFilterState>({ priority: 'ALL', status: 'ALL', type: 'ALL' });

  const filtered = useMemo(() => (alertsQuery.data ?? []).filter((alert) =>
    (filters.priority === 'ALL' || alert.priority === filters.priority) &&
    (filters.status === 'ALL' || alert.status === filters.status) &&
    (filters.type === 'ALL' || alert.type === filters.type)
  ), [alertsQuery.data, filters]);

  if (alertsQuery.isLoading || projectsQuery.isLoading) return <section className="page-panel state-card">Cargando alertas...</section>;
  const error = [alertsQuery.error, projectsQuery.error, createIncident.error, resolveAlert.error, dismissAlert.error].find(Boolean);
  const currentProject = (projectsQuery.data ?? []).find((project) => project.id === projectId);

  return (
    <section className="page-panel alerts-page" aria-labelledby="alerts-page-title">
      <div className="module-page-header">
        <div>
          <p className="page-eyebrow">Seguimiento de riesgos</p>
          <h2 id="alerts-page-title">Alertas</h2>
          <p>{currentProject ? `${currentProject.name} · ${currentProject.clientName}` : 'Alertas de todos los proyectos'}</p>
        </div>
        {projectId ? <Link className="secondary-link-button" to={`/projects/${projectId}/schedule`}><BellRing size={18} /> Volver al cronograma</Link> : null}
      </div>
      {message ? <div className="state-card success-message" role="status">{message}</div> : null}
      {error ? <div className="state-card state-card-error" role="alert">{getErrorMessage(error)}</div> : null}
      <IncidentAlertForm
        fixedProjectId={projectId}
        projects={projectsQuery.data ?? []}
        isSaving={createIncident.isPending}
        onSubmit={(targetProjectId, input) => createIncident.mutate({ targetProjectId, input }, { onSuccess: () => setMessage('La incidencia fue registrada.') })}
      />
      <div className="section-heading alert-list-heading"><div><p className="page-eyebrow">Bandeja</p><h3>Alertas registradas</h3></div><AlertFilters value={filters} onChange={setFilters} /></div>
      <AlertList
        alerts={filtered}
        isBusy={resolveAlert.isPending || dismissAlert.isPending}
        onResolve={(alertId, notes) => resolveAlert.mutate({ alertId, notes }, { onSuccess: () => setMessage('La alerta fue resuelta.') })}
        onDismiss={(alertId, notes) => dismissAlert.mutate({ alertId, notes }, { onSuccess: () => setMessage('La alerta fue descartada.') })}
      />
    </section>
  );
}

