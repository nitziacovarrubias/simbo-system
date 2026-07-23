import type { CuttingListStatus } from '../constants/domain.enums';
import type { EdgeBanding } from '../constants/edge-banding';
import type { GrainDirection } from '../constants/grain-direction';

export interface CuttingPiece {
  id: string;
  cuttingListId: string;
  sourceModuleId: string | null;
  sourceModuleName: string;
  pieceName: string;
  category: string;
  quantity: number;
  materialId: string | null;
  materialName: string;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  depthMm: number | null;
  grainDirection: GrainDirection;
  edgeBanding: EdgeBanding;
  comments: string;
  isManual: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CuttingPieceInput {
  sourceModuleId?: string | null;
  sourceModuleName: string;
  pieceName: string;
  category: string;
  quantity: number;
  materialId?: string | null;
  materialName: string;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  depthMm?: number | null;
  grainDirection: GrainDirection;
  edgeBanding: EdgeBanding;
  comments?: string;
  sortOrder?: number;
}

export interface MaterialCuttingSummary {
  materialId: string | null;
  materialName: string;
  thicknessMm: number;
  piecesCount: number;
  totalQuantity: number;
  totalAreaSquareMeters: number;
}

export interface CuttingListSummary {
  id: string;
  projectId: string;
  designId: string | null;
  versionNumber: number;
  designVersion: number | null;
  status: CuttingListStatus;
  piecesCount: number;
  generatedAt: string;
  authorizedAt: string | null;
  rejectedAt: string | null;
  exportedAt: string | null;
  isLatestVersion: boolean;
  isDesignOutdated: boolean;
  updatedAt: string;
}

export interface CuttingListDetail extends CuttingListSummary {
  projectName: string;
  clientName: string;
  designTitle: string | null;
  designStatus: string | null;
  notes: string;
  validationNotes: string;
  exportPath: string | null;
  pieces: CuttingPiece[];
  materialSummary: MaterialCuttingSummary[];
}

export interface CuttingListExportResult {
  filePath: string;
  fileName: string;
  exportedAt: string;
}
