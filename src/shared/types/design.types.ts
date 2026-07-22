import type { DesignStatus, MaterialUnit } from '../constants/domain.enums';
import type { RoomSpace, RoomSpaceInput } from './room-space.types';

export type DesignViewMode = '2D' | '3D';

export type DesignModuleType =
  'BASE_CABINET' | 'WALL_CABINET' | 'TALL_CABINET' | 'SHELF' | 'ISLAND' | 'APPLIANCE_PLACEHOLDER';

export interface DesignModuleItem {
  id: string;
  templateId: string;
  type: DesignModuleType;
  displayName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  rotationY: number;
  materialId: string | null;
  colorHex: string;
  notes: string;
  hasCollision: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DesignModuleMutationInput = Omit<DesignModuleItem, 'createdAt' | 'updatedAt'>;

export interface DesignDocument {
  id: string;
  projectId: string;
  title: string;
  version: number;
  status: DesignStatus;
  isCurrent: boolean;
  roomSpace: RoomSpace;
  viewMode: DesignViewMode;
  notes: string;
  modules: DesignModuleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignInput {
  title: string;
  roomSpace: RoomSpaceInput;
  viewMode: DesignViewMode;
  notes?: string;
}

export interface UpdateDesignInput {
  title?: string;
  viewMode?: DesignViewMode;
  notes?: string;
  status?: DesignStatus;
}

export interface ModuleTemplateItem {
  id: string;
  code: string;
  type: DesignModuleType;
  displayName: string;
  category: string;
  defaultWidthMm: number;
  defaultHeightMm: number;
  defaultDepthMm: number;
  isActive: boolean;
}

export interface DesignMaterialItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: MaterialUnit;
  costPerUnit: number;
  thicknessMm: number | null;
  colorHex: string;
  textureName: string | null;
  isActive: boolean;
}

export interface DesignSavePayload {
  designId: string;
  design: UpdateDesignInput;
  modules: DesignModuleMutationInput[];
}
