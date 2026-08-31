import { describe, expect, it } from 'vitest';
import { renderSettingsSchema } from '@shared/schemas/render.schema';

const validInput = {
  title: 'Cocina paneles blancos',
  resolution: 'FULL_HD',
  imageFormat: 'PNG',
  viewType: 'ISOMETRIC',
  quality: 'HIGH',
  notes: 'Vista principal.'
} as const;

describe('renderSettingsSchema', () => {
  it('accepts the supported render configuration', () => {
    expect(renderSettingsSchema.parse(validInput)).toMatchObject(validInput);
  });

  it('rejects unsupported formats and empty titles', () => {
    expect(renderSettingsSchema.safeParse({ ...validInput, imageFormat: 'EXR' }).success).toBe(false);
    expect(renderSettingsSchema.safeParse({ ...validInput, title: ' ' }).success).toBe(false);
  });
});
