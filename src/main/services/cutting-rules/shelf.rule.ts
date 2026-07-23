import type { CuttingRule } from './cutting-rule.types';
import { createPiece } from './cutting-rule.types';

export const shelfRule: CuttingRule = {
  generate(context) {
    const { module } = context;
    return {
      pieces: [
        createPiece(context, {
          pieceName: 'Repisa principal', category: 'Repisa', quantity: 1,
          widthMm: module.widthMm, heightMm: module.depthMm,
          grainDirection: 'HORIZONTAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Repisa principal. Los soportes laterales se agregan manualmente si aplican.'
        })
      ],
      observations: [`${module.name}: los soportes laterales son opcionales y no se generan automáticamente.`]
    };
  }
};
