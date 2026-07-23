import type { CuttingRule } from './cutting-rule.types';
import { createBackPiece, createPiece, innerWidth } from './cutting-rule.types';

export const islandRule: CuttingRule = {
  generate(context) {
    const { module } = context;
    const thickness = module.material?.thicknessMm ?? context.defaultThicknessMm;
    const internalWidth = innerWidth(module.widthMm, thickness);
    return {
      pieces: [
        createPiece(context, { pieceName: 'Lateral', category: 'Estructura', quantity: 2, widthMm: module.depthMm, heightMm: module.heightMm, grainDirection: 'VERTICAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Laterales de isla.' }),
        createPiece(context, { pieceName: 'Frente', category: 'Frente', quantity: 2, widthMm: internalWidth / 2, heightMm: Math.max(module.heightMm - 20, 1), grainDirection: 'VERTICAL', edgeBanding: 'ALL', comments: 'Frentes iniciales de la isla.' }),
        createPiece(context, { pieceName: 'Cubierta', category: 'Cubierta', quantity: 1, widthMm: module.widthMm, heightMm: module.depthMm, grainDirection: 'HORIZONTAL', edgeBanding: 'ALL', comments: 'Cubierta aproximada; validar volados y material final.' }),
        createPiece(context, { pieceName: 'Base', category: 'Estructura', quantity: 1, widthMm: internalWidth, heightMm: module.depthMm, grainDirection: 'HORIZONTAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Base de isla.' }),
        createPiece(context, { pieceName: 'División interna', category: 'División', quantity: 1, widthMm: Math.max(module.depthMm - thickness, 1), heightMm: Math.max(module.heightMm - thickness, 1), grainDirection: 'VERTICAL', edgeBanding: 'VISIBLE_EDGES', comments: 'División interna opcional.' }),
        createBackPiece(context, { pieceName: 'Panel trasero', category: 'Trasera', quantity: 1, widthMm: module.widthMm, heightMm: module.heightMm, grainDirection: 'HORIZONTAL', edgeBanding: 'VISIBLE_EDGES', comments: 'Panel trasero de la isla.' })
      ],
      observations: []
    };
  }
};
