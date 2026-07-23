import type { DesignModule, Material } from '@prisma/client';
import type { CuttingPieceInput } from '../../../shared/types';

export interface CuttingRuleContext {
  module: DesignModule & { material: Material | null };
  defaultThicknessMm: number;
  thinBackMaterial: Material | null;
}

export interface CuttingRuleResult {
  pieces: CuttingPieceInput[];
  observations: string[];
}

export interface CuttingRule {
  generate(context: CuttingRuleContext): CuttingRuleResult;
}

export function createPiece(
  context: CuttingRuleContext,
  input: Omit<CuttingPieceInput, 'sourceModuleId' | 'sourceModuleName' | 'materialId' | 'materialName' | 'thicknessMm'> & {
    materialId?: string | null;
    materialName?: string;
    thicknessMm?: number;
  }
): CuttingPieceInput {
  const material = context.module.material;
  return {
    ...input,
    sourceModuleId: context.module.id,
    sourceModuleName: context.module.name,
    materialId: input.materialId === undefined ? material?.id ?? null : input.materialId,
    materialName: input.materialName ?? material?.name ?? 'Material sin asignar',
    thicknessMm: input.thicknessMm ?? material?.thicknessMm ?? context.defaultThicknessMm
  };
}

export function createBackPiece(
  context: CuttingRuleContext,
  input: Omit<CuttingPieceInput, 'sourceModuleId' | 'sourceModuleName' | 'materialId' | 'materialName' | 'thicknessMm'>
): CuttingPieceInput {
  const backMaterial = context.thinBackMaterial;
  return createPiece(context, {
    ...input,
    materialId: backMaterial?.id ?? null,
    materialName: backMaterial?.name ?? 'MDF delgado sugerido',
    thicknessMm: backMaterial?.thicknessMm ?? 3
  });
}

export function innerWidth(widthMm: number, thicknessMm: number): number {
  const value = widthMm - 2 * thicknessMm;
  if (value <= 0) {
    throw new Error('El ancho del módulo no permite descontar los laterales.');
  }
  return value;
}
