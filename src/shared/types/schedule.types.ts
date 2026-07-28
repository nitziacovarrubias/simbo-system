import type { ProjectStatus } from '../constants/domain.enums';
import type { UserRole } from '../constants/roles';
import type { ProjectActivity } from './activity.types';
import type { ProjectProgressReport } from './project-progress.types';

export interface ScheduleResponsibleUser {
  id: string;
  fullName: string;
  role: UserRole;
}

export interface ProjectSchedule {
  project: {
    id: string;
    name: string;
    clientName: string;
    status: ProjectStatus;
    deliveryDate: string | null;
    hasApprovedQuote: boolean;
    isReadOnly: boolean;
  };
  activities: ProjectActivity[];
  responsibleUsers: ScheduleResponsibleUser[];
  report: ProjectProgressReport;
}

export interface CloseProjectInput {
  actorRole: UserRole;
  confirmOpenActivities: boolean;
  reason?: string | null;
}

export interface ArchiveProjectInput {
  actorRole: UserRole;
  notes?: string | null;
}

export interface ProjectClosingResult {
  projectId: string;
  status: ProjectStatus;
  closedAt: string | null;
  archivedAt: string | null;
}
