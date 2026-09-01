import { Archive, LockKeyhole } from 'lucide-react';
import type { ProjectSchedule } from '@shared/types';
import { UserRole } from '@shared/constants/roles';
import './projects.css';

interface ProjectClosingPanelProps {
  schedule: ProjectSchedule;
  currentRole: UserRole;
  isClosing: boolean;
  isArchiving: boolean;
  onClose: (reason: string | null, confirmOpenActivities: boolean) => void;
  onArchive: () => void;
}

export function ProjectClosingPanel({
  schedule,
  currentRole,
  isClosing,
  isArchiving,
  onClose,
  onArchive
}: ProjectClosingPanelProps): JSX.Element {
  const isSupervisor = currentRole === UserRole.SUPERVISOR;
  const isClosed = schedule.project.status === 'CLOSED';
  const isArchived = schedule.project.status === 'ARCHIVED';

  const requestClose = (): void => {
    if (!window.confirm('¿Estás segura de cerrar este proyecto? Esta acción lo enviará al historial.')) return;
    const hasOpenActivities =
      schedule.report.pendingActivities + schedule.report.inProgressActivities + schedule.report.blockedActivities > 0;
    if (!hasOpenActivities) {
      onClose(null, false);
      return;
    }
    if (!window.confirm('El proyecto tiene actividades pendientes. ¿Deseas cerrarlo de todas formas?')) return;
    const reason = window.prompt('Escribe el motivo para cerrar con actividades pendientes:');
    if (!reason?.trim()) return;
    onClose(reason.trim(), true);
  };

  return (
    <section className="project-closing-panel" aria-labelledby="project-closing-title">
      <div>
        <p>Finalización</p>
        <h3 id="project-closing-title">CIERRE DE PROYECTO</h3>
        <span>Solo un supervisor puede cerrar y archivar el expediente.</span>
      </div>
      <div className="project-closing-actions">
        {!isClosed && !isArchived ? (
          <button type="button" disabled={!isSupervisor || isClosing} onClick={requestClose}>
            <LockKeyhole size={18} aria-hidden="true" /> {isClosing ? 'Cerrando...' : 'Cerrar proyecto'}
          </button>
        ) : null}
        {isClosed ? (
          <button type="button" disabled={!isSupervisor || isArchiving} onClick={onArchive}>
            <Archive size={18} aria-hidden="true" /> {isArchiving ? 'Archivando...' : 'Archivar proyecto'}
          </button>
        ) : null}
        {isArchived ? <span className="project-archived-badge">Proyecto archivado</span> : null}
      </div>
    </section>
  );
}
