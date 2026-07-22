import { describe, expect, it } from 'vitest';
import { prepareDesignSavePayload } from '@renderer/modules/design-editor/hooks/useDesignAutosave';

describe('prepareDesignSavePayload', () => {
  it('prepares design metadata and modules', () => {
    const payload = prepareDesignSavePayload('design-1', '2D', []);
    expect(payload).toEqual({
      designId: 'design-1',
      design: { viewMode: '2D' },
      modules: []
    });
  });
});
