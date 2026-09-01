import { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Link2,
  XCircle
} from 'lucide-react';
import { AlertStatus } from '@shared/constants/alert-status';
import type { ProjectAlert } from '@shared/types';
import { formatDate } from '@renderer/utils/formatters';
import {
  ALERT_PRIORITY_LABEL,
  ALERT_TYPE_LABEL
} from '@renderer/modules/schedule/schedule-labels';
import { AlertStatusBadge } from './AlertStatusBadge';

interface AlertCardProps {
  alert: ProjectAlert;
  isBusy: boolean;
  onResolve: (
    alertId: string,
    notes: string
  ) => void;
  onDismiss: (
    alertId: string,
    notes: string
  ) => void;
}

export function AlertCard({
  alert,
  isBusy,
  onResolve,
  onDismiss
}: AlertCardProps): JSX.Element {
  const [notes, setNotes] = useState('');

  const isOpen =
    alert.status === AlertStatus.OPEN ||
    alert.status === AlertStatus.IN_REVIEW;

  return (
    <article
      className={`alert-card alert-priority-${alert.priority.toLowerCase()}`}
    >
      <div className="alert-card-header">
        <div>
          <span className="alert-type-label">
            {ALERT_TYPE_LABEL[alert.type]}
          </span>

          <h3>{alert.title}</h3>
        </div>

        <AlertStatusBadge
          status={alert.status}
        />
      </div>

      <p className="alert-card-description">
        {alert.description}
      </p>

      <div className="alert-meta-grid">
        <span>
          <strong>Proyecto:</strong>{' '}
          {alert.projectName}
        </span>

        <span>
          <strong>Prioridad:</strong>{' '}
          {ALERT_PRIORITY_LABEL[alert.priority]}
        </span>

        {alert.activityTitle ? (
          <span>
            <Link2
              size={15}
              aria-hidden="true"
            />
            {alert.activityTitle}
          </span>
        ) : null}

        {alert.dueDate ? (
          <span>
            <CalendarClock
              size={15}
              aria-hidden="true"
            />
            {formatDate(alert.dueDate)}
          </span>
        ) : null}
      </div>

      {alert.resolutionNotes ? (
        <div className="alert-resolution-note">
          <strong>
            Nota de resolución
          </strong>
          <p>{alert.resolutionNotes}</p>
        </div>
      ) : null}

      {isOpen ? (
        <div className="alert-resolution-form">
          <label>
            <span>
              Nota de resolución
            </span>

            <textarea
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Escribe qué se hizo o por qué se descarta"
            />
          </label>

          <div>
            <button
              className="alert-resolve-button"
              type="button"
              disabled={
                isBusy ||
                notes.trim().length < 3
              }
              onClick={() =>
                onResolve(
                  alert.id,
                  notes.trim()
                )
              }
            >
              <CheckCircle2
                size={17}
                aria-hidden="true"
              />
              Resolver
            </button>

            <button
              className="alert-dismiss-button"
              type="button"
              disabled={
                isBusy ||
                notes.trim().length < 3
              }
              onClick={() =>
                onDismiss(
                  alert.id,
                  notes.trim()
                )
              }
            >
              <XCircle
                size={17}
                aria-hidden="true"
              />
              Descartar
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
