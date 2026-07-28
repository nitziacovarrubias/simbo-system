import { describe, expect, it } from 'vitest';
import { alertResolutionSchema } from '@shared/schemas/alert.schema';

describe('alertResolutionSchema', () => {
  it('requires resolution notes', () => {
    expect(alertResolutionSchema.safeParse({ notes: '' }).success).toBe(false);
    expect(alertResolutionSchema.safeParse({ notes: 'Se confirmó la entrega.' }).success).toBe(true);
  });
});
