import type { ProjectProgressReport } from '@shared/types';

interface ProjectProgressPanelProps {
  report: ProjectProgressReport;
}

export function ProjectProgressPanel({
  report
}: ProjectProgressPanelProps): JSX.Element {
  const metrics = [
    ['Total', report.totalActivities],
    ['Pendientes', report.pendingActivities],
    ['En proceso', report.inProgressActivities],
    ['Bloqueadas', report.blockedActivities],
    ['Terminadas', report.completedActivities],
    ['Alertas abiertas', report.openAlerts],
    ['Alertas urgentes', report.urgentAlerts],
    ['Vencidas', report.overdueActivities]
  ] as const;

  return (
    <section
      className="schedule-progress-panel"
      aria-labelledby="project-progress-title"
    >
      <div className="schedule-progress-heading">
        <div>
          <span>Avance general</span>
          <h3 id="project-progress-title">
            Progreso del proyecto
          </h3>
        </div>

        <strong>
          {report.overallProgressPercent}%
        </strong>
      </div>

      <div
        className="schedule-progress-track"
        role="progressbar"
        aria-label="Avance general del proyecto"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={report.overallProgressPercent}
      >
        <span
          style={{
            width: `${report.overallProgressPercent}%`
          }}
        />
      </div>

      <div className="schedule-metric-grid">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
