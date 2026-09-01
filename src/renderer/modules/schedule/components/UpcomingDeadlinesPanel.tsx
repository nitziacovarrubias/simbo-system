import {
  CalendarClock,
  TriangleAlert
} from 'lucide-react';
import type { ProjectProgressReport } from '@shared/types';
import { formatDate } from '@renderer/utils/formatters';

interface UpcomingDeadlinesPanelProps {
  report: ProjectProgressReport;
}

export function UpcomingDeadlinesPanel({
  report
}: UpcomingDeadlinesPanelProps): JSX.Element {
  return (
    <section className="schedule-deadline-grid">
      <article className="schedule-info-card">
        <div className="schedule-info-card__heading">
          <CalendarClock size={20} aria-hidden="true" />
          <h3>Próximas fechas</h3>
        </div>

        {report.upcomingDeadlines.length === 0 ? (
          <p className="schedule-empty-copy">
            No hay actividades que venzan en los próximos 3 días.
          </p>
        ) : (
          <ul className="compact-schedule-list">
            {report.upcomingDeadlines.map((activity) => (
              <li key={activity.id}>
                <strong>{activity.title}</strong>
                <span>{formatDate(activity.dueDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="schedule-info-card schedule-info-card--metric">
        <div className="schedule-info-card__heading">
          <TriangleAlert size={20} aria-hidden="true" />
          <h3>Actividades vencidas</h3>
        </div>

        <strong className="schedule-large-metric">
          {report.overdueActivities}
        </strong>

        <p>
          Actividad(es) abiertas con fecha límite superada.
        </p>
      </article>

      <article className="schedule-info-card">
        <div className="schedule-info-card__heading">
          <h3>Últimas incidencias</h3>
        </div>

        {report.latestIncidents.length === 0 ? (
          <p className="schedule-empty-copy">
            No hay incidencias registradas.
          </p>
        ) : (
          <ul className="compact-schedule-list">
            {report.latestIncidents.map((alert) => (
              <li key={alert.id}>
                <strong>{alert.title}</strong>
                <span>{alert.projectName}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
