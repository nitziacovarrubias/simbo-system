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
  UserListItem
} from './domain.types';
import type { ClientDetail, ClientMutationInput } from './client.types';
import type { ProjectDetail, ProjectMutationInput } from './project.types';
import type { RoomSpaceInput } from './room-space.types';

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
  listMaterials: () => Promise<MaterialListItem[]>;
  listRendersByProject: (projectId: string) => Promise<RenderListItem[]>;
  listCuttingListsByProject: (projectId: string) => Promise<CuttingListItem[]>;
  listQuotesByProject: (projectId: string) => Promise<QuoteListItem[]>;
  listActivitiesByProject: (projectId: string) => Promise<ActivityListItem[]>;
  listAlertsByProject: (projectId: string) => Promise<AlertListItem[]>;
  listDocumentsByProject: (projectId: string) => Promise<DocumentListItem[]>;
  listHistoryByProject: (projectId: string) => Promise<HistoryEntryListItem[]>;
}
