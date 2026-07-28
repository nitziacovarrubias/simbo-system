import type { UserRole } from '../constants/roles';
import type { ActivityPriority } from '../constants/activity-priority';
import type { ActivityStage } from '../constants/activity-stage';
import type { ActivityStatus } from '../constants/activity-status';

export interface ActivityAssignee {
  id: string;
  fullName: string;
  role: UserRole;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  stage: ActivityStage;
  assignedUserId: string | null;
  assignedPersonName: string | null;
  assignedUser: ActivityAssignee | null;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  progressPercent: number;
  notes: string | null;
  completionSuggested: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityInput {
  title: string;
  description?: string | null;
  stage: ActivityStage;
  assignedUserId?: string | null;
  assignedPersonName?: string | null;
  startDate: string;
  dueDate: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  progressPercent: number;
  notes?: string | null;
}

export type ActivityUpdateInput = Partial<ActivityInput>;
