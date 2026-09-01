import {
  AlertTriangle,
  BellRing,
  CalendarPlus
} from 'lucide-react';
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
      <header className="schedule-header">
        <div className="schedule-header__main">
          <div>
            <span>Producción y seguimiento</span>
            <h2 id="schedule-page-title">Cronograma</h2>

            <div className="schedule-header__project">
              <strong>{schedule.project.name}</strong>
              <span>{schedule.project.clientName}</span>

              <span
                className={`schedule-project-status schedule-project-status--${schedule.project.status.toLowerCase()}`}
              >
                {PROJECT_STATUS_LABEL[schedule.project.status]}
              </span>
            </div>
          </div>

          <div className="schedule-header-actions">
            <Link
              className="schedule-header-button schedule-header-button--ghost"
              to={`/projects/${schedule.project.id}/alerts`}
            >
              <BellRing size={18} aria-hidden="true" />
              Ver alertas
            </Link>

            <button
              className="schedule-header-button schedule-header-button--ghost"
              type="button"
              onClick={onGenerateAlerts}
              disabled={isGeneratingAlerts}
            >
              <BellRing size={18} aria-hidden="true" />
              {isGeneratingAlerts
                ? 'Generando...'
                : 'Generar alertas'}
            </button>

            <button
              className="schedule-header-button schedule-header-button--accent"
              type="button"
              onClick={onNewActivity}
              disabled={!canEdit}
            >
              <CalendarPlus size={18} aria-hidden="true" />
              Nueva actividad
            </button>
          </div>
        </div>
      </header>

      {!schedule.project.hasApprovedQuote ? (
        <div className="schedule-banner schedule-banner--warning" role="status">
          <AlertTriangle size={18} aria-hidden="true" />
          Este proyecto aún no tiene una cotización aprobada. Puedes planear
          actividades, pero no debería pasar a producción.
        </div>
      ) : null}

      {schedule.project.isReadOnly ? (
        <div className="schedule-banner schedule-banner--readonly" role="status">
          El proyecto está cerrado o archivado. El cronograma se muestra en
          modo solo lectura.
        </div>
      ) : null}
    </>
  );
}
