import type {
  AppInfo,
  ClientListItem,
  DashboardSummary,
  DatabaseStatus,
  DesignListItem,
  DocumentListItem,
  HistoryEntryListItem,
  MaterialListItem,
  ProjectListItem,
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
import type {
  QuoteAdjustmentsInput,
  QuoteDetail,
  QuoteExportResult,
  QuoteItemInput,
  QuoteSummary
} from './quote.types';

import type { ActivityInput, ActivityUpdateInput, ProjectActivity } from './activity.types';
import type { GenerateProjectAlertsResult, IncidentAlertInput, ProjectAlert } from './alert.types';
import type { ProjectProgressReport } from './project-progress.types';
import type {
  ArchiveProjectInput,
  CloseProjectInput,
  ProjectClosingResult,
  ProjectSchedule
} from './schedule.types';

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
  getQuotesByProjectId: (projectId: string) => Promise<QuoteSummary[]>;
  getQuoteById: (quoteId: string) => Promise<QuoteDetail>;
  generateQuote: (projectId: string, cuttingListId?: string) => Promise<QuoteDetail>;
  updateQuoteItem: (quoteItemId: string, input: Partial<QuoteItemInput>) => Promise<QuoteDetail>;
  addQuoteItem: (quoteId: string, input: QuoteItemInput) => Promise<QuoteDetail>;
  removeQuoteItem: (quoteItemId: string) => Promise<QuoteDetail>;
  updateQuoteAdjustments: (quoteId: string, input: QuoteAdjustmentsInput) => Promise<QuoteDetail>;
  approveQuote: (quoteId: string, notes?: string) => Promise<QuoteDetail>;
  rejectQuote: (quoteId: string, reason: string) => Promise<QuoteDetail>;
  exportQuoteToExcel: (quoteId: string) => Promise<QuoteExportResult>;
  getScheduleByProjectId: (projectId: string) => Promise<ProjectSchedule>;
  createActivity: (projectId: string, input: ActivityInput) => Promise<ProjectActivity>;
  updateActivity: (activityId: string, input: ActivityUpdateInput) => Promise<ProjectActivity>;
  deleteActivity: (activityId: string) => Promise<{ id: string; projectId: string }>;
  generateProjectAlerts: (projectId: string) => Promise<GenerateProjectAlertsResult>;
  getAlertsByProjectId: (projectId: string) => Promise<ProjectAlert[]>;
  getAllAlerts: () => Promise<ProjectAlert[]>;
  createIncidentAlert: (projectId: string, input: IncidentAlertInput) => Promise<ProjectAlert>;
  resolveAlert: (alertId: string, notes: string) => Promise<ProjectAlert>;
  dismissAlert: (alertId: string, notes: string) => Promise<ProjectAlert>;
  getProjectProgressReport: (projectId: string) => Promise<ProjectProgressReport>;
  closeProject: (projectId: string, input: CloseProjectInput) => Promise<ProjectClosingResult>;
  archiveProject: (projectId: string, input: ArchiveProjectInput) => Promise<ProjectClosingResult>;
  listDocumentsByProject: (projectId: string) => Promise<DocumentListItem[]>;
  listHistoryByProject: (projectId: string) => Promise<HistoryEntryListItem[]>;
}
