import type { RenderStatus } from '../constants/domain.enums';
import type {
  RenderImageFormat,
  RenderQuality,
  RenderResolutionPreset,
  RenderViewType
} from '../constants/render-options';
import type { DesignModuleType } from './design.types';
import type { RoomLayoutType } from './room-space.types';

export interface FreeCadStatus {
  available: boolean;
  executablePath: string | null;
  version: string | null;
  message: string;
}

export interface RenderSettingsInput {
  title: string;
  resolution: RenderResolutionPreset;
  imageFormat: RenderImageFormat;
  viewType: RenderViewType;
  quality: RenderQuality;
  notes?: string;
  createdByUserId?: string;
}

export interface RenderSummary {
  id: string;
  projectId: string;
  designId: string | null;
  title: string;
  versionNumber: number;
  status: RenderStatus;
  imageFormat: RenderImageFormat;
  resolutionWidth: number;
  resolutionHeight: number;
  viewType: RenderViewType;
  quality: RenderQuality;
  generatedAt: string | null;
  updatedAt: string;
  hasImage: boolean;
  hasCadArtifacts: boolean;
  isLatestVersion: boolean;
  isSourceOutdated: boolean;
}

export interface CadArtifacts {
  renderId: string;
  fcstdAvailable: boolean;
  stepAvailable: boolean;
  stlAvailable: boolean;
}

export interface RenderDetail extends RenderSummary {
  projectName: string;
  designVersion: number | null;
  designUpdatedAt: string | null;
  notes: string;
  sizeMb: number | null;
  failureMessage: string | null;
  createdByName: string | null;
  createdAt: string;
  roomWidthMm: number | null;
  roomDepthMm: number | null;
  roomHeightMm: number | null;
  mainMaterials: string[];
  cadArtifacts: CadArtifacts;
}

export interface RenderGenerationResult {
  render: RenderDetail;
  warnings: string[];
}

export type RenderCopyArtifactType = 'IMAGE' | 'FCSTD' | 'STEP' | 'STL';

export interface RenderCopyResult {
  saved: boolean;
  fileName: string | null;
}

export interface FreeCadMaterialInput {
  name: string;
  thicknessMm: number;
  colorHex: string;
}

export interface FreeCadModuleInput {
  id: string;
  type: DesignModuleType;
  name: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationY: number;
  material: FreeCadMaterialInput;
}

export interface FreeCadInput {
  project: {
    id: string;
    name: string;
    units: 'mm';
  };
  room: {
    layoutType: RoomLayoutType;
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  modules: FreeCadModuleInput[];
}

export interface FreeCadOutput {
  success: boolean;
  files: {
    fcstd: string;
    step: string;
    stl: string;
    obj: string | null;
  };
  warnings: string[];
  generatedAt: string;
}
