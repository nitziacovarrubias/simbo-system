import type { QuoteSummary } from '@shared/types';
import { QUOTE_STATUS_LABELS } from '@shared/constants/quote-status';

interface QuoteVersionSelectorProps {
  quotes: QuoteSummary[];
  selectedId: string;
  onChange: (quoteId: string) => void;
}

export function QuoteVersionSelector({
  quotes,
  selectedId,
  onChange
}: QuoteVersionSelectorProps): JSX.Element {
  return (
    <label className="quote-version-selector">
      <span>Versión de cotización</span>

      <select
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
      >
        {quotes.map((quote) => (
          <option key={quote.id} value={quote.id}>
            Versión {quote.versionNumber} ·{' '}
            {QUOTE_STATUS_LABELS[quote.status]}
          </option>
        ))}
      </select>
    </label>
  );
}
