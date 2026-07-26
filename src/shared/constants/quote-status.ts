export { QuoteStatus } from './domain.enums';

export const QUOTE_STATUS_LABELS = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  OUTDATED: 'Desactualizada'
} as const;
