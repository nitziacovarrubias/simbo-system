import { describe, expect, it } from 'vitest';
import { ActivityPriority } from '@shared/constants/activity-priority';
import { ActivityStage } from '@shared/constants/activity-stage';
import { ActivityStatus } from '@shared/constants/activity-status';
import { activitySchema } from '@shared/schemas/activity.schema';

const validActivity = {
  title: 'Corte de tableros',
  description: 'Preparar piezas para producción.',
  stage: ActivityStage.CUTTING,
  assignedUserId: null,
  assignedPersonName: 'Proveedor externo',
  startDate: '2026-07-27T12:00:00.000Z',
  dueDate: '2026-07-29T12:00:00.000Z',
  status: ActivityStatus.TODO,
  priority: ActivityPriority.HIGH,
  progressPercent: 0,
  notes: null
};

describe('activitySchema', () => {
  it('accepts a valid activity', () => {
    expect(activitySchema.safeParse(validActivity).success).toBe(true);
  });

  it('rejects a due date before the start date', () => {
    const result = activitySchema.safeParse({
      ...validActivity,
      dueDate: '2026-07-26T12:00:00.000Z'
    });
    expect(result.success).toBe(false);
  });

  it('rejects progress outside 0 to 100', () => {
    expect(activitySchema.safeParse({ ...validActivity, progressPercent: -1 }).success).toBe(false);
    expect(activitySchema.safeParse({ ...validActivity, progressPercent: 101 }).success).toBe(false);
  });
});
