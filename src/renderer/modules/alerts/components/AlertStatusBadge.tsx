import type { AlertStatus } from '@shared/constants/alert-status';
import { ALERT_STATUS_LABEL } from '@renderer/modules/schedule/schedule-labels';

interface AlertStatusBadgeProps {
  status: AlertStatus;
}

export function AlertStatusBadge({
  status
}: AlertStatusBadgeProps): JSX.Element {
  return (
    <span
      className={`alert-status-badge alert-status-${status.toLowerCase()}`}
    >
      {ALERT_STATUS_LABEL[status]}
    </span>
  );
}
