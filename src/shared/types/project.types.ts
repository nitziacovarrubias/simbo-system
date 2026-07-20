import type { ClientStatus, ProjectStatus } from '../constants/domain.enums';
import type { HistoryEntryListItem } from './domain.types';
import type { RoomSpace } from './room-space.types';

export interface ProjectMutationInput {
  name: string;
  clientId: string;
  location?: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  deliveryDate?: string;
}

export interface ProjectClientSummary {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  projectAddress: string | null;
  status: ClientStatus;
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: ProjectStatus;
  startDate: string;
  deliveryDate: string | null;
  roomSpace: RoomSpace | null;
  client: ProjectClientSummary;
  mainResponsibleName: string | null;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntryListItem[];
}
