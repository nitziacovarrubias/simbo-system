import type {
  ActivityListItem,
  AlertListItem,
  AppInfo,
  ClientListItem,
  DashboardSummary,
  DatabaseStatus,
  DesignListItem,
  DocumentListItem,
  HistoryEntryListItem,
  MaterialListItem,
  ProjectListItem,
  QuoteListItem,
  RenderListItem,
  UserListItem
} from './domain.types';
import type { ClientDetail, ClientMutationInput } from './client.types';
import type {
  CreateDesignInput,
  DesignDocument,
  DesignMaterialItem,
  DesignModuleMutationInput,
  ModuleTemplateItem,
  UpdateDesignInput
} from './design.types';
import type { ProjectDetail, ProjectMutationInput } from './project.types';
import type { RoomSpaceInput } from './room-space.types';
import type {
  CuttingListDetail,
  CuttingListExportResult,
  CuttingListSummary,
  CuttingPieceInput
} from './cutting-list.types';

export interface SimboApi {
  getAppInfo: () => Promise<AppInfo>;
  getDatabaseStatus: () => Promise<DatabaseStatus>;
  getDashboardSummary: () => Promise<DashboardSummary>;
  listUsers: () => Promise<UserListItem[]>;
  listClients: () => Promise<ClientListItem[]>;
  getClientById: (clientId: string) => Promise<ClientDetail>;
  createClient: (input: ClientMutationInput) => Promise<ClientDetail>;
  updateClient: (clientId: string, input: ClientMutationInput) => Promise<ClientDetail>;
  listProjects: () => Promise<ProjectListItem[]>;
  getProjectById: (projectId: string) => Promise<ProjectDetail>;
  createProject: (input: ProjectMutationInput) => Promise<ProjectDetail>;
  updateProject: (projectId: string, input: ProjectMutationInput) => Promise<ProjectDetail>;
  saveProjectRoomSpace: (projectId: string, input: RoomSpaceInput) => Promise<ProjectDetail>;
  listDesignsByProject: (projectId: string) => Promise<DesignListItem[]>;
  getDesignByProjectId: (projectId: string) => Promise<DesignDocument | null>;
  createDesign: (projectId: string, input: CreateDesignInput) => Promise<DesignDocument>;
  updateDesign: (designId: string, input: UpdateDesignInput) => Promise<DesignDocument>;
  saveDesignModules: (
    designId: string,
    modules: DesignModuleMutationInput[]
  ) => Promise<DesignDocument>;
  getModuleTemplates: () => Promise<ModuleTemplateItem[]>;
  getMaterials: () => Promise<DesignMaterialItem[]>;
  listMaterials: () => Promise<MaterialListItem[]>;
  listRendersByProject: (projectId: string) => Promise<RenderListItem[]>;
  getCuttingListsByProjectId: (projectId: string) => Promise<CuttingListSummary[]>;
  getCuttingListById: (cuttingListId: string) => Promise<CuttingListDetail>;
  generateCuttingList: (projectId: string, designId: string) => Promise<CuttingListDetail>;
  updateCuttingPiece: (pieceId: string, input: Partial<CuttingPieceInput>) => Promise<CuttingListDetail>;
  addManualCuttingPiece: (cuttingListId: string, input: CuttingPieceInput) => Promise<CuttingListDetail>;
  removeCuttingPiece: (pieceId: string) => Promise<CuttingListDetail>;
  authorizeCuttingList: (cuttingListId: string, notes?: string) => Promise<CuttingListDetail>;
  rejectCuttingList: (cuttingListId: string, reason: string) => Promise<CuttingListDetail>;
  exportCuttingListToExcel: (cuttingListId: string) => Promise<CuttingListExportResult>;
  listQuotesByProject: (projectId: string) => Promise<QuoteListItem[]>;
  listActivitiesByProject: (projectId: string) => Promise<ActivityListItem[]>;
  listAlertsByProject: (projectId: string) => Promise<AlertListItem[]>;
  listDocumentsByProject: (projectId: string) => Promise<DocumentListItem[]>;
  listHistoryByProject: (projectId: string) => Promise<HistoryEntryListItem[]>;
}
