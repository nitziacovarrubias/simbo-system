import type { QuoteStatus } from '@shared/constants/domain.enums';
import { QUOTE_STATUS_LABELS } from '@shared/constants/quote-status';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps): JSX.Element {
  return (
    <span className={`status-pill status-${status.toLowerCase()}`}>
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}
