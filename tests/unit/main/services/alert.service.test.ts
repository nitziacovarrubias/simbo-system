import { describe, expect, it } from 'vitest';
import { ActivityStatus } from '@shared/constants/activity-status';
import { AlertType } from '@shared/constants/alert-type';
import {
  getAutomaticAlertCandidate,
  shouldCreateAutomaticAlert
} from '@main/services/alert.service';

const now = new Date('2026-07-26T12:00:00.000Z');

describe('automatic project alerts', () => {
  it('generates DUE_SOON for an activity due within 3 days', () => {
    const candidate = getAutomaticAlertCandidate(
      {
        title: 'Empaque de muebles',
        status: ActivityStatus.TODO,
        dueDate: new Date('2026-07-28T12:00:00.000Z')
      },
      now
    );
    expect(candidate?.type).toBe(AlertType.DUE_SOON);
  });

  it('generates OVERDUE for an expired activity', () => {
    const candidate = getAutomaticAlertCandidate(
      {
        title: 'Confirmación de materiales',
        status: ActivityStatus.IN_PROGRESS,
        dueDate: new Date('2026-07-25T12:00:00.000Z')
      },
      now
    );
    expect(candidate?.type).toBe(AlertType.OVERDUE);
  });

  it('does not create a duplicate when an open alert already exists', () => {
    expect(shouldCreateAutomaticAlert(true)).toBe(false);
    expect(shouldCreateAutomaticAlert(false)).toBe(true);
  });
});
