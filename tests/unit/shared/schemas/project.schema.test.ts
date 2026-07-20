import { describe, expect, it } from 'vitest';
import { projectSchema } from '../../../../src/shared/schemas/project.schema';
import { ProjectStatus } from '../../../../src/shared/constants/domain.enums';

describe('projectSchema', () => {
  it('validates project dates in chronological order', () => {
    const result = projectSchema.safeParse({
      name: 'Cocina residencial',
      clientId: 'client-1',
      location: 'Hermosillo',
      status: ProjectStatus.DRAFT,
      startDate: '2026-07-19',
      deliveryDate: '2026-08-19'
    });

    expect(result.success).toBe(true);
  });

  it('rejects deliveryDate before startDate', () => {
    const result = projectSchema.safeParse({
      name: 'Cocina residencial',
      clientId: 'client-1',
      status: ProjectStatus.DRAFT,
      startDate: '2026-08-19',
      deliveryDate: '2026-07-19'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('no puede ser anterior');
    }
  });
});
