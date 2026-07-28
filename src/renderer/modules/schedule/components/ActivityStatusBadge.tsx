import type { ActivityStatus } from '@shared/constants/activity-status';
import { ACTIVITY_STATUS_LABEL } from '../schedule-labels';

interface ActivityStatusBadgeProps {
  status: ActivityStatus;
}

export function ActivityStatusBadge({ status }: ActivityStatusBadgeProps): JSX.Element {
  return (
    <span className={`schedule-badge schedule-status-${status.toLowerCase()}`}>
      {ACTIVITY_STATUS_LABEL[status]}
    </span>
  );
}
