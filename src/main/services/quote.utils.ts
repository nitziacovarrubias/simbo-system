export type QuoteStatusValue = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'OUTDATED';

export function getNextQuoteVersion(latestVersion?: number | null): number {
  return (latestVersion ?? 0) + 1;
}

export function assertQuoteCanBeApproved(itemsCount: number, isSourceOutdated: boolean): void {
  if (itemsCount <= 0) {
    throw new Error('No se puede aprobar una cotización vacía.');
  }
  if (isSourceOutdated) {
    throw new Error('No se puede aprobar una cotización desactualizada.');
  }
}

export function validateQuoteRejectReason(reason: string): string {
  const validReason = reason.trim();
  if (!validReason) {
    throw new Error('El motivo de rechazo es obligatorio.');
  }
  return validReason;
}

export function isQuoteSourceOutdated(
  quoteStatus: QuoteStatusValue,
  cuttingListStatus?: string | null
): boolean {
  return quoteStatus === 'OUTDATED' || cuttingListStatus === 'OUTDATED';
}
