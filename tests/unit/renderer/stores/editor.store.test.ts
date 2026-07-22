import { beforeEach, describe, expect, it } from 'vitest';
import { useEditorStore } from '@renderer/stores/editor.store';
import type { ModuleTemplateItem } from '@shared/types';

const template: ModuleTemplateItem = {
  id: 'template-1',
  code: 'BASE-CABINET-001',
  type: 'BASE_CABINET',
  displayName: 'Gabinete bajo',
  category: 'Cocina',
  defaultWidthMm: 800,
  defaultHeightMm: 720,
  defaultDepthMm: 560,
  isActive: true
};

beforeEach(() => useEditorStore.getState().resetEditor());

describe('editor store', () => {
  it('adds and updates a module', () => {
    useEditorStore.getState().addModule(template);
    const module = useEditorStore.getState().modules[0];
    expect(module?.displayName).toBe('Gabinete bajo');
    if (!module) throw new Error('Module was not created');
    useEditorStore.getState().updateModule(module.id, { widthMm: 900 });
    expect(useEditorStore.getState().modules[0]?.widthMm).toBe(900);
  });

  it('duplicates and removes modules', () => {
    useEditorStore.getState().addModule(template);
    const original = useEditorStore.getState().modules[0];
    if (!original) throw new Error('Module was not created');
    useEditorStore.getState().duplicateModule(original.id);
    expect(useEditorStore.getState().modules).toHaveLength(2);
    useEditorStore.getState().removeModule(original.id);
    expect(useEditorStore.getState().modules).toHaveLength(1);
  });
});
