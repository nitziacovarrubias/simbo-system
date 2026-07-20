import type {
  ActivityStatus,
  AlertPriority,
  ClientStatus,
  CuttingListStatus,
  DesignStatus,
  DocumentType,
  HistoryAction,
  MaterialUnit,
  ProjectStatus,
  QuoteStatus,
  RenderStatus,
  UserRole
} from '../constants/domain.enums';

export interface AppInfo {
  name: string;
  version: string;
  environment: string;
}

export interface DatabaseStatus {
  isConnected: boolean;
  provider: 'sqlite';
  message: string;
  checkedAt: string;
  databaseUrlMasked: string;
}

export interface DashboardSummary {
  clientsCount: number;
  activeProjectsCount: number;
  pendingQuotesCount: number;
  pendingCuttingListsCount: number;
  openAlertsCount: number;
  upcomingActivitiesCount: number;
}

export interface PersonSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  person: PersonSummary | null;
}

export interface ClientListItem {
  id: string;
  person: PersonSummary;
  projectAddress: string | null;
  status: ClientStatus;
  notes: string | null;
  projectCount: number;
  updatedAt: string;
}

export interface ProjectListItem {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  location: string | null;
  status: ProjectStatus;
  clientName: string;
  startDate: string;
  deliveryDate: string | null;
  mainResponsibleName: string | null;
  hasRoomSpace: boolean;
  updatedAt: string;
}

export interface DesignListItem {
  id: string;
  projectId: string;
  title: string;
  version: number;
  status: DesignStatus;
  isCurrent: boolean;
  updatedAt: string;
}

export interface MaterialListItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: MaterialUnit;
  cost: number;
  thicknessMm: number | null;
  colorHex: string | null;
  isActive: boolean;
}

export interface RenderListItem {
  id: string;
  projectId: string;
  title: string;
  version: number;
  status: RenderStatus;
  format: string;
  resolutionWidth: number;
  resolutionHeight: number;
  updatedAt: string;
}

export interface CuttingListItem {
  id: string;
  projectId: string;
  version: number;
  status: CuttingListStatus;
  piecesCount: number;
  updatedAt: string;
}

export interface QuoteListItem {
  id: string;
  projectId: string;
  version: number;
  status: QuoteStatus;
  subtotal: number;
  taxAmount: number;
  laborCost: number;
  advancePayment: number;
  total: number;
  updatedAt: string;
}

export interface ActivityListItem {
  id: string;
  projectId: string;
  title: string;
  stage: string | null;
  status: ActivityStatus;
  priority: AlertPriority;
  assignedToName: string | null;
  startDate: string | null;
  dueDate: string | null;
}

export interface AlertListItem {
  id: string;
  projectId: string | null;
  title: string;
  message: string;
  priority: AlertPriority;
  isRead: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

export interface DocumentListItem {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  filePath: string;
  documentType: DocumentType;
  stage: string | null;
  createdAt: string;
}

export interface HistoryEntryListItem {
  id: string;
  projectId: string;
  action: HistoryAction;
  entityType: string;
  title: string;
  description: string | null;
  createdAt: string;
}
