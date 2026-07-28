import { AlertTriangle, BellRing, CalendarPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProjectSchedule } from '@shared/types';
import { PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';

interface ScheduleHeaderProps {
  schedule: ProjectSchedule;
  canEdit: boolean;
  isGeneratingAlerts: boolean;
  onNewActivity: () => void;
  onGenerateAlerts: () => void;
}

export function ScheduleHeader({
  schedule,
  canEdit,
  isGeneratingAlerts,
  onNewActivity,
  onGenerateAlerts
}: ScheduleHeaderProps): JSX.Element {
  return (
    <>
      <div className="module-page-header schedule-page-header">
        <div>
          <p className="page-eyebrow">Producción y seguimiento</p>
          <h2 id="schedule-page-title">Cronograma</h2>
          <p>
            <strong>{schedule.project.name}</strong> · {schedule.project.clientName}
          </p>
          <span className={`status-pill status-${schedule.project.status.toLowerCase()}`}>
            {PROJECT_STATUS_LABEL[schedule.project.status]}
          </span>
        </div>
        <div className="schedule-header-actions">
          <Link className="secondary-link-button" to={`/projects/${schedule.project.id}/alerts`}>
            <BellRing size={18} aria-hidden="true" /> Ver alertas
          </Link>
          <button
            className="secondary-button"
            type="button"
            onClick={onGenerateAlerts}
            disabled={isGeneratingAlerts}
          >
            <BellRing size={18} aria-hidden="true" />
            {isGeneratingAlerts ? 'Generando...' : 'Generar alertas'}
          </button>
          <button className="accent-button" type="button" onClick={onNewActivity} disabled={!canEdit}>
            <CalendarPlus size={18} aria-hidden="true" /> Nueva actividad
          </button>
        </div>
      </div>

      {!schedule.project.hasApprovedQuote ? (
        <div className="outdated-warning" role="status">
          <AlertTriangle size={18} aria-hidden="true" />
          Este proyecto aún no tiene una cotización aprobada. Puedes planear actividades, pero no debería pasar a producción.
        </div>
      ) : null}

      {schedule.project.isReadOnly ? (
        <div className="authorized-lock" role="status">
          El proyecto está cerrado o archivado. El cronograma se muestra en modo solo lectura.
        </div>
      ) : null}
    </>
  );
}
