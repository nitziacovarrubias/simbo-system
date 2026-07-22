import { create } from 'zustand';
import type {
  DesignDocument,
  DesignModuleMutationInput,
  DesignViewMode,
  ModuleTemplateItem,
  RoomSpace
} from '@shared/types';
import { markModuleCollisions } from '@renderer/modules/design-editor/utils/collision.utils';

export type EditorSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface EditorState {
  currentProjectId: string | null;
  currentDesignId: string | null;
  viewMode: DesignViewMode;
  selectedModuleId: string | null;
  modules: DesignModuleMutationInput[];
  roomSpace: RoomSpace | null;
  hasUnsavedChanges: boolean;
  validationErrors: string[];
  isAutosaving: boolean;
  saveStatus: EditorSaveStatus;
  initializeEditor: (design: DesignDocument) => void;
  addModule: (template: ModuleTemplateItem) => void;
  updateModule: (id: string, changes: Partial<DesignModuleMutationInput>) => void;
  removeModule: (id: string) => void;
  duplicateModule: (id: string) => void;
  selectModule: (id: string | null) => void;
  setViewMode: (mode: DesignViewMode) => void;
  validateCollisions: () => boolean;
  setAutosaving: (value: boolean) => void;
  markSaved: () => void;
  markSaveError: () => void;
  resetEditor: () => void;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `module-${Date.now()}-${Math.random()}`;
}

function withValidation(modules: DesignModuleMutationInput[]): DesignModuleMutationInput[] {
  return markModuleCollisions(modules);
}

const initialState = {
  currentProjectId: null,
  currentDesignId: null,
  viewMode: '3D' as DesignViewMode,
  selectedModuleId: null,
  modules: [] as DesignModuleMutationInput[],
  roomSpace: null,
  hasUnsavedChanges: false,
  validationErrors: [] as string[],
  isAutosaving: false,
  saveStatus: 'idle' as EditorSaveStatus
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,
  initializeEditor: (design) =>
    set({
      currentProjectId: design.projectId,
      currentDesignId: design.id,
      viewMode: design.viewMode,
      modules: withValidation(design.modules),
      roomSpace: design.roomSpace,
      selectedModuleId: null,
      hasUnsavedChanges: false,
      validationErrors: [],
      isAutosaving: false,
      saveStatus: 'saved'
    }),
  addModule: (template) => {
    const room = get().roomSpace;
    const modules = get().modules;
    const offset = modules.length * 120;
    const module: DesignModuleMutationInput = {
      id: createId(),
      templateId: template.id,
      type: template.type,
      displayName: template.displayName,
      positionX: (room?.widthMm ?? 3000) / 2 + offset,
      positionY: template.type === 'WALL_CABINET' ? 1500 : 0,
      positionZ: (room?.depthMm ?? 2500) / 2,
      widthMm: template.defaultWidthMm,
      heightMm: template.defaultHeightMm,
      depthMm: template.defaultDepthMm,
      rotationY: 0,
      materialId: null,
      colorHex: '#81949C',
      notes: '',
      hasCollision: false
    };
    set({
      modules: withValidation([...modules, module]),
      selectedModuleId: module.id,
      hasUnsavedChanges: true,
      saveStatus: 'idle'
    });
  },
  updateModule: (id, changes) =>
    set((state) => ({
      modules: withValidation(
        state.modules.map((module) => (module.id === id ? { ...module, ...changes } : module))
      ),
      hasUnsavedChanges: true,
      saveStatus: 'idle'
    })),
  removeModule: (id) =>
    set((state) => ({
      modules: withValidation(state.modules.filter((module) => module.id !== id)),
      selectedModuleId: state.selectedModuleId === id ? null : state.selectedModuleId,
      hasUnsavedChanges: true,
      saveStatus: 'idle'
    })),
  duplicateModule: (id) => {
    const source = get().modules.find((module) => module.id === id);
    if (!source) return;
    const duplicate = {
      ...source,
      id: createId(),
      displayName: `${source.displayName} copia`,
      positionX: source.positionX + 150,
      positionZ: source.positionZ + 150,
      hasCollision: false
    };
    set((state) => ({
      modules: withValidation([...state.modules, duplicate]),
      selectedModuleId: duplicate.id,
      hasUnsavedChanges: true,
      saveStatus: 'idle'
    }));
  },
  selectModule: (id) => set({ selectedModuleId: id }),
  setViewMode: (mode) => set({ viewMode: mode, hasUnsavedChanges: true, saveStatus: 'idle' }),
  validateCollisions: () => {
    const modules = withValidation(get().modules);
    const hasCollision = modules.some((module) => module.hasCollision);
    set({
      modules,
      validationErrors: hasCollision ? ['Hay módulos superpuestos.'] : []
    });
    return !hasCollision;
  },
  setAutosaving: (value) =>
    set({ isAutosaving: value, saveStatus: value ? 'saving' : get().saveStatus }),
  markSaved: () => set({ hasUnsavedChanges: false, isAutosaving: false, saveStatus: 'saved' }),
  markSaveError: () => set({ isAutosaving: false, saveStatus: 'error' }),
  resetEditor: () => set(initialState)
}));
