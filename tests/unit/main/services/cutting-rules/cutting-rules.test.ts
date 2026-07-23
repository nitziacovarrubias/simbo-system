import { describe, expect, it } from 'vitest';
import type { DesignModule, Material } from '@prisma/client';
import { baseCabinetRule } from '../../../../../src/main/services/cutting-rules/base-cabinet.rule';
import { wallCabinetRule } from '../../../../../src/main/services/cutting-rules/wall-cabinet.rule';
import { appliancePlaceholderRule } from '../../../../../src/main/services/cutting-rules/appliance-placeholder.rule';

const material: Material = {
  id: 'material-1',
  code: 'MDF-18',
  name: 'MDF 18mm',
  category: 'Madera',
  unit: 'SHEET',
  cost: 500,
  thicknessMm: 18,
  colorHex: '#ffffff',
  texturePath: null,
  supplier: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

function moduleOf(kind: string): DesignModule & { material: Material | null } {
  return {
    id: `module-${kind}`,
    designId: 'design-1',
    templateId: null,
    materialId: material.id,
    name: kind,
    kind,
    positionXmm: 0,
    positionYmm: 0,
    positionZmm: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    widthMm: 800,
    heightMm: 720,
    depthMm: 560,
    quantity: 1,
    notes: null,
    colorHex: '#ffffff',
    hasCollision: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    material
  };
}

const context = (kind: string) => ({
  module: moduleOf(kind),
  defaultThicknessMm: 18,
  thinBackMaterial: null
});

describe('cutting rules', () => {
  it('generates the expected base cabinet concepts', () => {
    const result = baseCabinetRule.generate(context('BASE_CABINET'));
    expect(result.pieces).toHaveLength(6);
    expect(result.pieces.find((piece) => piece.pieceName === 'Lateral')?.quantity).toBe(2);
    expect(result.pieces.find((piece) => piece.pieceName === 'Base')?.widthMm).toBe(764);
    expect(result.pieces.find((piece) => piece.pieceName === 'Puerta')?.widthMm).toBe(397);
  });

  it('generates the expected wall cabinet concepts', () => {
    const result = wallCabinetRule.generate(context('WALL_CABINET'));
    expect(result.pieces).toHaveLength(6);
    expect(result.pieces.some((piece) => piece.pieceName === 'Repisa interna')).toBe(true);
    expect(result.pieces.some((piece) => piece.pieceName === 'Trasera')).toBe(true);
  });

  it('does not generate wood pieces for an appliance placeholder', () => {
    const result = appliancePlaceholderRule.generate(context('APPLIANCE_PLACEHOLDER'));
    expect(result.pieces).toHaveLength(0);
    expect(result.observations[0]).toContain('no genera piezas');
  });
});
