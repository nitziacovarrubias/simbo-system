import type { CuttingListStatus } from '@prisma/client';
import type { CuttingPiece, MaterialCuttingSummary } from '../../shared/types';
import { cuttingPieceInputSchema, rejectCuttingListSchema } from '../../shared/schemas/cutting-list.schema';

export function calculateMaterialSummary(
  pieces: Array<Pick<CuttingPiece, 'materialId' | 'materialName' | 'thicknessMm' | 'quantity' | 'widthMm' | 'heightMm'>>
): MaterialCuttingSummary[] {
  const grouped = new Map<string, MaterialCuttingSummary>();

  pieces.forEach((piece) => {
    const key = `${piece.materialId ?? 'manual'}:${piece.materialName}:${piece.thicknessMm}`;
    const current = grouped.get(key) ?? {
      materialId: piece.materialId,
      materialName: piece.materialName,
      thicknessMm: piece.thicknessMm,
      piecesCount: 0,
      totalQuantity: 0,
      totalAreaSquareMeters: 0
    };
    current.piecesCount += 1;
    current.totalQuantity += piece.quantity;
    current.totalAreaSquareMeters += (piece.widthMm * piece.heightMm * piece.quantity) / 1_000_000;
    grouped.set(key, current);
  });

  return [...grouped.values()]
    .map((summary) => ({
      ...summary,
      totalAreaSquareMeters: Number(summary.totalAreaSquareMeters.toFixed(3))
    }))
    .sort((left, right) => left.materialName.localeCompare(right.materialName));
}

export function assertDesignCanGenerateCuttingList(input: {
  modulesCount: number;
  hasCollisions: boolean;
}): void {
  if (input.modulesCount === 0) {
    throw new Error('El diseño no tiene módulos para generar el despiece.');
  }
  if (input.hasCollisions) {
    throw new Error('No se puede generar el despiece porque el diseño tiene módulos superpuestos.');
  }
}

export function assertCuttingListCanBeEdited(status: CuttingListStatus): void {
  if (status === 'AUTHORIZED') {
    throw new Error('No se puede editar una lista autorizada.');
  }
  if (status === 'OUTDATED') {
    throw new Error('El diseño cambió después de generar esta lista. Genera una nueva versión.');
  }
}

export function assertCuttingListCanBeAuthorized(
  pieces: Array<Parameters<typeof cuttingPieceInputSchema.parse>[0]>,
  isOutdated: boolean
): void {
  if (pieces.length === 0) {
    throw new Error('No se puede autorizar una lista vacía.');
  }
  if (isOutdated) {
    throw new Error('No se puede autorizar una lista desactualizada.');
  }
  pieces.forEach((piece) => cuttingPieceInputSchema.parse(piece));
}

export function validateRejectReason(reason: string): string {
  return rejectCuttingListSchema.parse({ reason }).reason;
}

export function getNextCuttingListVersion(latestVersion: number | null | undefined): number {
  return (latestVersion ?? 0) + 1;
}
