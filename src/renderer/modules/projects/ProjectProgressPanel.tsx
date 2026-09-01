import type { ProjectProgressReport } from '@shared/types';
import './projects.css';

interface ProjectProgressPanelProps {
  report: ProjectProgressReport;
}

export function ProjectProgressPanel({ report }: ProjectProgressPanelProps): JSX.Element {
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
    <section className="project-progress-panel" aria-labelledby="project-progress-title">
      <div className="project-progress-heading">
        <div>
          <p>Reporte básico</p>
          <h3 id="project-progress-title">AVANCE DEL PROYECTO</h3>
        </div>
        <strong>{report.overallProgressPercent}%</strong>
      </div>
      <div
        className="project-progress-track"
        role="progressbar"
        aria-label="Avance general del proyecto"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={report.overallProgressPercent}
      >
        <span style={{ width: `${report.overallProgressPercent}%` }} />
      </div>
      <div className="project-progress-metrics">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
