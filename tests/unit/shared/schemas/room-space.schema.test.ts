import { describe, expect, it } from 'vitest';
import { roomSpaceSchema } from '../../../../src/shared/schemas/room-space.schema';

describe('roomSpaceSchema', () => {
  it('accepts positive and coherent measures', () => {
    const result = roomSpaceSchema.safeParse({
      layoutType: 'L_SHAPE',
      widthMm: 3400,
      depthMm: 2800,
      heightMm: 2400,
      wallThicknessMm: 120,
      openings: []
    });

    expect(result.success).toBe(true);
  });

  it('rejects zero and negative measures', () => {
    const result = roomSpaceSchema.safeParse({
      layoutType: 'RECTANGULAR',
      widthMm: 0,
      depthMm: -10,
      heightMm: 2400,
      openings: []
    });

    expect(result.success).toBe(false);
  });

  it('rejects an incoherent wall thickness', () => {
    const result = roomSpaceSchema.safeParse({
      layoutType: 'RECTANGULAR',
      widthMm: 1000,
      depthMm: 1000,
      heightMm: 2400,
      wallThicknessMm: 600,
      openings: []
    });

    expect(result.success).toBe(false);
  });
});
