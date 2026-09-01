import { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import type { ProjectActivity } from '@shared/types';
import { ActivityPriority } from '@shared/constants/activity-priority';
import { ActivityStatus } from '@shared/constants/activity-status';
import { useProjectsQuery } from '@renderer/modules/projects/project.queries';
import { useSessionStore } from '@renderer/stores/session.store';
import { getErrorMessage } from '@renderer/utils/formatters';
import { ActivityForm } from './components/ActivityForm';
import { ActivityList } from './components/ActivityList';
import { ProjectClosingPanel } from './components/ProjectClosingPanel';
import { ProjectProgressPanel } from './components/ProjectProgressPanel';
import { ScheduleHeader } from './components/ScheduleHeader';
import { UpcomingDeadlinesPanel } from './components/UpcomingDeadlinesPanel';
import {
  useArchiveProjectMutation,
  useCloseProjectMutation,
  useCreateActivityMutation,
  useDeleteActivityMutation,
  useGenerateProjectAlertsMutation,
  useScheduleQuery,
  useUpdateActivityMutation
} from './hooks/useScheduleQueries';

import './schedule.css';

function ScheduleProjectSelection(): JSX.Element {
  const projectsQuery = useProjectsQuery();

  if (projectsQuery.isLoading) {
    return (
      <section className="page-panel state-card">
        Cargando proyectos...
      </section>
    );
  }

  if (projectsQuery.isError) {
    return (
      <section className="page-panel state-card state-card-error">
        {getErrorMessage(projectsQuery.error)}
      </section>
    );
  }

  return (
    <section
      className="schedule-selection-page"
      aria-labelledby="schedule-selection-title"
    >
      <header className="schedule-selection-header">
        <p>Producción y seguimiento</p>
        <h2 id="schedule-selection-title">Cronograma</h2>
        <span>
          Selecciona un proyecto para consultar y administrar sus actividades.
        </span>
      </header>

      <div className="schedule-project-grid">
        {(projectsQuery.data ?? []).map((project) => (
          <article className="schedule-project-card" key={project.id}>
            <div className="schedule-project-card__icon">
              <CalendarDays size={26} aria-hidden="true" />
            </div>

            <div className="schedule-project-card__copy">
              <h3>{project.name}</h3>
              <p>{project.clientName}</p>
            </div>

            <Link
              className="schedule-project-card__link"
              to={`/projects/${project.id}/schedule`}
            >
              Abrir cronograma
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SchedulePage(): JSX.Element {
  const { projectId } = useParams();
  const currentUser = useSessionStore((state) => state.user);
  const scheduleQuery = useScheduleQuery(projectId);

  const [editingActivity, setEditingActivity] =
    useState<ProjectActivity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<'ALL' | ActivityStatus>('ALL');
  const [priorityFilter, setPriorityFilter] =
    useState<'ALL' | ActivityPriority>('ALL');
  const [message, setMessage] = useState('');

  const createMutation = useCreateActivityMutation(projectId ?? '');
  const updateMutation = useUpdateActivityMutation(projectId ?? '');
  const deleteMutation = useDeleteActivityMutation(projectId ?? '');
  const generateAlertsMutation =
    useGenerateProjectAlertsMutation(projectId ?? '');
  const closeMutation = useCloseProjectMutation(projectId ?? '');
  const archiveMutation = useArchiveProjectMutation(projectId ?? '');

  const filteredActivities = useMemo(() => {
    const activities = scheduleQuery.data?.activities ?? [];

    return activities.filter(
      (activity) =>
        (statusFilter === 'ALL' || activity.status === statusFilter) &&
        (priorityFilter === 'ALL' || activity.priority === priorityFilter)
    );
  }, [priorityFilter, scheduleQuery.data?.activities, statusFilter]);

  if (!projectId) {
    return <ScheduleProjectSelection />;
  }

  if (scheduleQuery.isLoading) {
    return (
      <section className="page-panel state-card">
        Cargando cronograma...
      </section>
    );
  }

  if (
    scheduleQuery.isError ||
    !scheduleQuery.data ||
    !currentUser
  ) {
    return (
      <section className="page-panel state-card state-card-error">
        {getErrorMessage(scheduleQuery.error)}
      </section>
    );
  }

  const schedule = scheduleQuery.data;
  const canEdit = !schedule.project.isReadOnly;

  const error = [
    createMutation.error,
    updateMutation.error,
    deleteMutation.error,
    generateAlertsMutation.error,
    closeMutation.error,
    archiveMutation.error
  ].find(Boolean);

  return (
    <section
      className="schedule-page"
      aria-labelledby="schedule-page-title"
    >
      <ScheduleHeader
        schedule={schedule}
        canEdit={canEdit}
        isGeneratingAlerts={generateAlertsMutation.isPending}
        onNewActivity={() => {
          setEditingActivity(null);
          setShowForm(true);
        }}
        onGenerateAlerts={() => {
          setMessage('');

          generateAlertsMutation.mutate(undefined, {
            onSuccess: (result) =>
              setMessage(
                result.createdCount === 0
                  ? 'No se generaron alertas nuevas.'
                  : `Se generaron ${result.createdCount} alerta(s).`
              )
          });
        }}
      />

      <div className="schedule-content">
        {message ? (
          <div
            className="schedule-message schedule-message--success"
            role="status"
          >
            {message}
          </div>
        ) : null}

        {error ? (
          <div
            className="schedule-message schedule-message--error"
            role="alert"
          >
            {getErrorMessage(error)}
          </div>
        ) : null}

        <ProjectProgressPanel report={schedule.report} />

        <UpcomingDeadlinesPanel report={schedule.report} />

        <ActivityList
          activities={filteredActivities}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          canEdit={canEdit}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onEdit={(activity) => {
            setEditingActivity(activity);
            setShowForm(true);
          }}
          onDelete={(activity) => {
            if (
              !window.confirm(
                `¿Eliminar la actividad “${activity.title}”?`
              )
            ) {
              return;
            }

            deleteMutation.mutate(activity.id, {
              onSuccess: () =>
                setMessage('La actividad fue eliminada.')
            });
          }}
        />

        <ProjectClosingPanel
          schedule={schedule}
          currentRole={currentUser.role}
          isClosing={closeMutation.isPending}
          isArchiving={archiveMutation.isPending}
          onClose={(reason, confirmOpenActivities) =>
            closeMutation.mutate(
              {
                actorRole: currentUser.role,
                confirmOpenActivities,
                reason
              },
              {
                onSuccess: () =>
                  setMessage('Proyecto cerrado correctamente.')
              }
            )
          }
          onArchive={() =>
            archiveMutation.mutate(
              {
                actorRole: currentUser.role,
                notes:
                  'Proyecto archivado desde el módulo de cronograma.'
              },
              {
                onSuccess: () =>
                  setMessage('Proyecto archivado correctamente.')
              }
            )
          }
        />
      </div>

      {showForm ? (
        <ActivityForm
          activity={editingActivity}
          users={schedule.responsibleUsers}
          isSaving={
            createMutation.isPending || updateMutation.isPending
          }
          onCancel={() => setShowForm(false)}
          onSubmit={(input) => {
            if (editingActivity) {
              updateMutation.mutate(
                {
                  activityId: editingActivity.id,
                  input
                },
                {
                  onSuccess: () => {
                    setShowForm(false);
                    setMessage(
                      'La actividad fue actualizada.'
                    );
                  }
                }
              );
            } else {
              createMutation.mutate(input, {
                onSuccess: () => {
                  setShowForm(false);
                  setMessage('La actividad fue creada.');
                }
              });
            }
          }}
        />
      ) : null}
    </section>
  );
}
