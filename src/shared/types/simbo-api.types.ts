import type {
  ActivityListItem,
  AlertListItem,
  AppInfo,
  ClientListItem,
  CuttingListItem,
  DashboardSummary,
  DatabaseStatus,
  DesignListItem,
  DocumentListItem,
  HistoryEntryListItem,
  MaterialListItem,
  ProjectListItem,
  QuoteListItem,
  RenderListItem,
  UserListItem,
} from './domain.types';

export interface SimboApi {
  getAppInfo: () => Promise<AppInfo>;
  getDatabaseStatus: () => Promise<DatabaseStatus>;
  getDashboardSummary: () => Promise<DashboardSummary>;
  listUsers: () => Promise<UserListItem[]>;
  listClients: () => Promise<ClientListItem[]>;
  listProjects: () => Promise<ProjectListItem[]>;
  listDesignsByProject: (projectId: string) => Promise<DesignListItem[]>;
  listMaterials: () => Promise<MaterialListItem[]>;
  listRendersByProject: (projectId: string) => Promise<RenderListItem[]>;
  listCuttingListsByProject: (projectId: string) => Promise<CuttingListItem[]>;
  listQuotesByProject: (projectId: string) => Promise<QuoteListItem[]>;
  listActivitiesByProject: (projectId: string) => Promise<ActivityListItem[]>;
  listAlertsByProject: (projectId: string) => Promise<AlertListItem[]>;
  listDocumentsByProject: (projectId: string) => Promise<DocumentListItem[]>;
  listHistoryByProject: (projectId: string) => Promise<HistoryEntryListItem[]>;
}
