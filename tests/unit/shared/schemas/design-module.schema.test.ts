import { describe, expect, it } from 'vitest';
import { editorDesignModuleSchema, hexColorSchema } from '@shared/schemas';

const validModule = {
  id: 'module-1',
  templateId: 'template-1',
  type: 'BASE_CABINET' as const,
  displayName: 'Gabinete bajo',
  positionX: 500,
  positionY: 0,
  positionZ: 500,
  widthMm: 800,
  heightMm: 720,
  depthMm: 560,
  rotationY: 0,
  materialId: null,
  colorHex: '#F2F2F2',
  notes: '',
  hasCollision: false
};

describe('design module schema', () => {
  it('accepts positive dimensions', () => {
    expect(editorDesignModuleSchema.safeParse(validModule).success).toBe(true);
  });

  it('rejects zero dimensions', () => {
    expect(editorDesignModuleSchema.safeParse({ ...validModule, widthMm: 0 }).success).toBe(false);
  });

  it('validates hexadecimal colors', () => {
    expect(hexColorSchema.safeParse('#293241').success).toBe(true);
    expect(hexColorSchema.safeParse('293241').success).toBe(false);
  });
});
