import { describe, expect, it } from 'vitest';
import { freeCadInputSchema } from '@shared/schemas/freecad.schema';

const validInput = {
  project: { id: 'project-1', name: 'Cocina', units: 'mm' },
  room: { layoutType: 'RECTANGULAR', widthMm: 3400, depthMm: 2800, heightMm: 2400 },
  modules: [
    {
      id: 'module-1',
      type: 'BASE_CABINET',
      name: 'Gabinete bajo',
      widthMm: 800,
      heightMm: 720,
      depthMm: 560,
      positionX: 500,
      positionY: 0,
      positionZ: 500,
      rotationY: 0,
      material: { name: 'MDF Blanco 18mm', thicknessMm: 18, colorHex: '#FFFFFF' }
    }
  ]
} as const;

describe('freeCadInputSchema', () => {
  it('accepts the independent FreeCAD DTO', () => {
    expect(freeCadInputSchema.parse(validInput).project.units).toBe('mm');
  });

  it('rejects empty modules and invalid measurements', () => {
    expect(freeCadInputSchema.safeParse({ ...validInput, modules: [] }).success).toBe(false);
    const invalid = structuredClone(validInput) as unknown as Record<string, unknown>;
    const modules = invalid.modules as Array<Record<string, unknown>>;
    modules[0]!.widthMm = -1;
    expect(freeCadInputSchema.safeParse(invalid).success).toBe(false);
  });
});
