import { CalendarClock, TriangleAlert } from 'lucide-react';
import type { ProjectProgressReport } from '@shared/types';
import { formatDate } from '@renderer/utils/formatters';

interface UpcomingDeadlinesPanelProps {
  report: ProjectProgressReport;
}

export function UpcomingDeadlinesPanel({ report }: UpcomingDeadlinesPanelProps): JSX.Element {
  return (
    <section className="schedule-deadline-grid">
      <article className="detail-card">
        <h3><CalendarClock size={18} aria-hidden="true" /> Próximas fechas</h3>
        {report.upcomingDeadlines.length === 0 ? (
          <p>No hay actividades que venzan en los próximos 3 días.</p>
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
      <article className="detail-card">
        <h3><TriangleAlert size={18} aria-hidden="true" /> Actividades vencidas</h3>
        <strong className="large-metric">{report.overdueActivities}</strong>
        <p>Actividad(es) abiertas con fecha límite superada.</p>
      </article>
      <article className="detail-card">
        <h3>Últimas incidencias</h3>
        {report.latestIncidents.length === 0 ? (
          <p>No hay incidencias registradas.</p>
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
