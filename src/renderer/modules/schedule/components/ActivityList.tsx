import {
  Edit3,
  Trash2,
  UserRound
} from 'lucide-react';
import type { ProjectActivity } from '@shared/types';
import { ActivityPriority } from '@shared/constants/activity-priority';
import { ActivityStatus } from '@shared/constants/activity-status';
import { formatDate } from '@renderer/utils/formatters';
import { ActivityStatusBadge } from './ActivityStatusBadge';
import {
  ACTIVITY_PRIORITY_LABEL,
  ACTIVITY_STAGE_LABEL,
  ACTIVITY_STATUS_LABEL
} from '../schedule-labels';

interface ActivityListProps {
  activities: ProjectActivity[];
  statusFilter: 'ALL' | ActivityStatus;
  priorityFilter: 'ALL' | ActivityPriority;
  canEdit: boolean;
  onStatusFilterChange: (
    value: 'ALL' | ActivityStatus
  ) => void;
  onPriorityFilterChange: (
    value: 'ALL' | ActivityPriority
  ) => void;
  onEdit: (activity: ProjectActivity) => void;
  onDelete: (activity: ProjectActivity) => void;
}

export function ActivityList({
  activities,
  statusFilter,
  priorityFilter,
  canEdit,
  onStatusFilterChange,
  onPriorityFilterChange,
  onEdit,
  onDelete
}: ActivityListProps): JSX.Element {
  return (
    <section
      className="schedule-activity-section"
      aria-labelledby="activities-title"
    >
      <div className="schedule-list-heading">
        <div>
          <span>Plan de trabajo</span>
          <h3 id="activities-title">Actividades</h3>
        </div>

        <div className="schedule-filters">
          <label>
            <span>Estado</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(
                  event.target.value as 'ALL' | ActivityStatus
                )
              }
            >
              <option value="ALL">Todos</option>
              {Object.values(ActivityStatus).map((status) => (
                <option key={status} value={status}>
                  {ACTIVITY_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Prioridad</span>
            <select
              value={priorityFilter}
              onChange={(event) =>
                onPriorityFilterChange(
                  event.target.value as 'ALL' | ActivityPriority
                )
              }
            >
              <option value="ALL">Todas</option>
              {Object.values(ActivityPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {ACTIVITY_PRIORITY_LABEL[priority]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="schedule-empty-state">
          <h3>No hay actividades</h3>
          <p>Crea la primera actividad del cronograma.</p>
        </div>
      ) : (
        <div className="activity-card-list">
          {activities.map((activity) => {
            const responsible =
              activity.assignedUser?.fullName ??
              activity.assignedPersonName ??
              'Sin responsable';

            return (
              <article
                className={`activity-card priority-${activity.priority.toLowerCase()}`}
                key={activity.id}
              >
                <div className="activity-card-main">
                  <div className="activity-title-row">
                    <div>
                      <span className="activity-stage-label">
                        {ACTIVITY_STAGE_LABEL[activity.stage]}
                      </span>
                      <h4>{activity.title}</h4>
                    </div>

                    <ActivityStatusBadge
                      status={activity.status}
                    />
                  </div>

                  <p>
                    {activity.description ??
                      'Sin descripción'}
                  </p>

                  <div className="activity-meta-grid">
                    <span>
                      <UserRound
                        size={15}
                        aria-hidden="true"
                      />
                      {responsible}
                    </span>

                    <span>
                      Inicio: {formatDate(activity.startDate)}
                    </span>

                    <span>
                      Fecha límite: {formatDate(activity.dueDate)}
                    </span>

                    <span>
                      Prioridad:{' '}
                      {ACTIVITY_PRIORITY_LABEL[activity.priority]}
                    </span>
                  </div>

                  <div className="activity-progress-row">
                    <div className="activity-progress-track">
                      <span
                        style={{
                          width: `${activity.progressPercent}%`
                        }}
                      />
                    </div>

                    <strong>
                      {activity.progressPercent}%
                    </strong>
                  </div>

                  {activity.notes ? (
                    <p className="activity-notes">
                      {activity.notes}
                    </p>
                  ) : null}
                </div>

                {canEdit ? (
                  <div className="activity-card-actions">
                    <button
                      className="schedule-icon-button"
                      type="button"
                      onClick={() => onEdit(activity)}
                      aria-label={`Editar ${activity.title}`}
                    >
                      <Edit3 size={18} aria-hidden="true" />
                    </button>

                    <button
                      className="schedule-icon-button schedule-icon-button--danger"
                      type="button"
                      onClick={() => onDelete(activity)}
                      aria-label={`Eliminar ${activity.title}`}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
