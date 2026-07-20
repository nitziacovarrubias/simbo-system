import { describe, expect, it } from 'vitest';
import { roomSpaceSchema, cuttingPieceSchema, userSchema } from '../../../../src/shared/schemas';
import { UserRole } from '../../../../src/shared/constants/domain.enums';

describe('domain schemas', () => {
  it('validates a valid room space', () => {
    const result = roomSpaceSchema.safeParse({
      layoutType: 'RECTANGULAR',
      widthMm: 3400,
      depthMm: 2800,
      heightMm: 2400,
      wallThicknessMm: 120,
      openings: []
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative cutting piece measures', () => {
    const result = cuttingPieceSchema.safeParse({
      cuttingListId: 'cutting-list-1',
      name: 'Lateral gabinete bajo',
      widthMm: -550,
      heightMm: 700,
      quantity: 1,
    });

    expect(result.success).toBe(false);
  });

  it('validates user role values', () => {
    const result = userSchema.safeParse({
      username: 'architect',
      email: 'arquitecto@bois.mx',
      passwordHash: 'demo-password-hash',
      role: UserRole.ARCHITECT,
      isActive: true,
    });

    expect(result.success).toBe(true);
  });
});
