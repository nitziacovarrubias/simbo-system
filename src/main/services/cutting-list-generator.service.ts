import type { DesignModule, Material } from '@prisma/client';
import { cuttingPieceInputSchema } from '../../shared/schemas/cutting-list.schema';
import type { CuttingPieceInput } from '../../shared/types';
import { getCuttingRule } from './cutting-rules/cutting-rule.registry';

export interface CuttingListGenerationInput {
  modules: Array<DesignModule & { material: Material | null }>;
  materials: Material[];
}

export interface CuttingListGenerationResult {
  pieces: CuttingPieceInput[];
  observations: string[];
}

export class CuttingListGeneratorService {
  generate(input: CuttingListGenerationInput): CuttingListGenerationResult {
    const thinBackMaterial = input.materials
      .filter((material) => material.thicknessMm !== null && material.thicknessMm <= 6)
      .sort((left, right) => (left.thicknessMm ?? 999) - (right.thicknessMm ?? 999))[0] ?? null;

    const pieces: CuttingPieceInput[] = [];
    const observations: string[] = [];

    input.modules.forEach((module) => {
      const rule = getCuttingRule(module.kind);
      const result = rule.generate({
        module,
        defaultThicknessMm: 18,
        thinBackMaterial
      });

      result.pieces.forEach((piece) => {
        const validated = cuttingPieceInputSchema.parse({
          ...piece,
          sortOrder: pieces.length
        });
        pieces.push(validated);
      });
      observations.push(...result.observations);
    });

    return { pieces, observations };
  }
}
