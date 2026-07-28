import type { AlertPriority } from '../constants/alert-priority';
import type { AlertStatus } from '../constants/alert-status';
import type { AlertType } from '../constants/alert-type';

export interface ProjectAlert {
  id: string;
  projectId: string;
  projectName: string;
  activityId: string | null;
  activityTitle: string | null;
  title: string;
  description: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  dueDate: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentAlertInput {
  title: string;
  description: string;
  priority: AlertPriority;
  dueDate?: string | null;
}

export interface AlertResolutionInput {
  notes: string;
}

export interface GenerateProjectAlertsResult {
  createdCount: number;
  alerts: ProjectAlert[];
}
