import type { ClientStatus, ProjectStatus } from '../constants/domain.enums';

export interface ClientMutationInput {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  rfc?: string;
  projectAddress?: string;
  initialContactDate?: string;
  status: ClientStatus;
  notes?: string;
}

export interface ClientProjectSummary {
  id: string;
  name: string;
  status: ProjectStatus;
  location: string | null;
  startDate: string;
  deliveryDate: string | null;
}

export interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  rfc: string | null;
  projectAddress: string | null;
  initialContactDate: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  projects: ClientProjectSummary[];
}
