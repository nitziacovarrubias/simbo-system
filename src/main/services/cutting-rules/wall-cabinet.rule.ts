import type { CuttingRule } from './cutting-rule.types';
import { createBackPiece, createPiece, innerWidth } from './cutting-rule.types';

export const wallCabinetRule: CuttingRule = {
  generate(context) {
    const { module } = context;
    const thickness = module.material?.thicknessMm ?? context.defaultThicknessMm;
    const internalWidth = innerWidth(module.widthMm, thickness);

    return {
      pieces: [
        createPiece(context, { pieceName: 'Lateral', category: 'Estructura', quantity: 2, widthMm: module.depthMm, heightMm: module.heightMm, grainDirection: 'VERTICAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Laterales de alacena.' }),
        createPiece(context, { pieceName: 'Base', category: 'Estructura', quantity: 1, widthMm: internalWidth, heightMm: module.depthMm, grainDirection: 'HORIZONTAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Base de alacena.' }),
        createPiece(context, { pieceName: 'Tapa superior', category: 'Estructura', quantity: 1, widthMm: internalWidth, heightMm: module.depthMm, grainDirection: 'HORIZONTAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Tapa superior de alacena.' }),
        createBackPiece(context, { pieceName: 'Trasera', category: 'Trasera', quantity: 1, widthMm: module.widthMm, heightMm: module.heightMm, grainDirection: 'VERTICAL', edgeBanding: 'NONE', comments: 'Material delgado sugerido.' }),
        createPiece(context, { pieceName: 'Repisa interna', category: 'Repisa', quantity: 1, widthMm: internalWidth, heightMm: Math.max(module.depthMm - 20, 1), grainDirection: 'HORIZONTAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Repisa interna.' }),
        createPiece(context, { pieceName: 'Puerta', category: 'Frente', quantity: 2, widthMm: module.widthMm / 2 - 3, heightMm: Math.max(module.heightMm - 20, 1), grainDirection: 'VERTICAL', edgeBanding: 'ALL', comments: 'Par de puertas.' })
      ],
      observations: []
    };
  }
};
