import { useCallback, useEffect, useRef } from 'react';
import type { DesignSavePayload, DesignModuleMutationInput, DesignViewMode } from '@shared/types';
import { useEditorStore } from '@renderer/stores/editor.store';

export function prepareDesignSavePayload(
  designId: string,
  viewMode: DesignViewMode,
  modules: DesignModuleMutationInput[]
): DesignSavePayload {
  return {
    designId,
    design: { viewMode },
    modules
  };
}

export function useDesignAutosave(designId: string | null) {
  const modules = useEditorStore((state) => state.modules);
  const viewMode = useEditorStore((state) => state.viewMode);
  const hasUnsavedChanges = useEditorStore((state) => state.hasUnsavedChanges);
  const setAutosaving = useEditorStore((state) => state.setAutosaving);
  const markSaved = useEditorStore((state) => state.markSaved);
  const markSaveError = useEditorStore((state) => state.markSaveError);
  const savingRef = useRef(false);

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!designId || savingRef.current) return false;
    savingRef.current = true;
    setAutosaving(true);
    try {
      const payload = prepareDesignSavePayload(designId, viewMode, modules);
      await window.simboApi.updateDesign(payload.designId, payload.design);
      await window.simboApi.saveDesignModules(payload.designId, payload.modules);
      markSaved();
      return true;
    } catch (error) {
      console.error('Design autosave failed', error);
      markSaveError();
      return false;
    } finally {
      savingRef.current = false;
    }
  }, [designId, markSaveError, markSaved, modules, setAutosaving, viewMode]);

  useEffect(() => {
    if (!designId || !hasUnsavedChanges) return undefined;
    const timeoutId = window.setTimeout(() => void saveNow(), 900);
    return () => window.clearTimeout(timeoutId);
  }, [designId, hasUnsavedChanges, modules, saveNow, viewMode]);

  return { saveNow };
}
