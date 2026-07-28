import { describe, expect, it } from 'vitest';
import { ActivityStatus } from '@shared/constants/activity-status';
import { normalizeActivityProgress } from '@main/services/activity.service';

describe('normalizeActivityProgress', () => {
  it('forces 100 percent when status is DONE', () => {
    expect(normalizeActivityProgress(ActivityStatus.DONE, 35)).toEqual({
      status: ActivityStatus.DONE,
      progressPercent: 100,
      completionSuggested: false
    });
  });

  it('suggests DONE when progress reaches 100', () => {
    expect(normalizeActivityProgress(ActivityStatus.IN_PROGRESS, 100).completionSuggested).toBe(true);
  });
});
