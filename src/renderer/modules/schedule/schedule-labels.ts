import { ActivityPriority } from '@shared/constants/activity-priority';
import { ActivityStage } from '@shared/constants/activity-stage';
import { ActivityStatus } from '@shared/constants/activity-status';
import { AlertPriority } from '@shared/constants/alert-priority';
import { AlertStatus } from '@shared/constants/alert-status';
import { AlertType } from '@shared/constants/alert-type';

export const ACTIVITY_STAGE_LABEL: Record<ActivityStage, string> = {
  [ActivityStage.DESIGN_REVIEW]: 'Revisión de diseño',
  [ActivityStage.QUOTATION]: 'Cotización',
  [ActivityStage.CUTTING]: 'Despiece y corte',
  [ActivityStage.PRODUCTION]: 'Producción',
  [ActivityStage.INSTALLATION]: 'Instalación',
  [ActivityStage.DELIVERY]: 'Entrega',
  [ActivityStage.CLOSURE]: 'Cierre',
  [ActivityStage.CUSTOM]: 'Personalizada'
};

export const ACTIVITY_STATUS_LABEL: Record<ActivityStatus, string> = {
  [ActivityStatus.TODO]: 'Pendiente',
  [ActivityStatus.IN_PROGRESS]: 'En proceso',
  [ActivityStatus.BLOCKED]: 'Bloqueada',
  [ActivityStatus.DONE]: 'Terminada',
  [ActivityStatus.CANCELLED]: 'Cancelada'
};

export const ACTIVITY_PRIORITY_LABEL: Record<ActivityPriority, string> = {
  [ActivityPriority.LOW]: 'Baja',
  [ActivityPriority.MEDIUM]: 'Media',
  [ActivityPriority.HIGH]: 'Alta',
  [ActivityPriority.URGENT]: 'Urgente'
};

export const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  [AlertType.DUE_SOON]: 'Fecha próxima',
  [AlertType.OVERDUE]: 'Retraso',
  [AlertType.BLOCKED_ACTIVITY]: 'Actividad bloqueada',
  [AlertType.INCIDENT]: 'Incidencia',
  [AlertType.QUOTE_OUTDATED]: 'Cotización desactualizada',
  [AlertType.CUTTING_LIST_OUTDATED]: 'Despiece desactualizado',
  [AlertType.CUSTOM]: 'Personalizada'
};

export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  [AlertStatus.OPEN]: 'Abierta',
  [AlertStatus.IN_REVIEW]: 'En revisión',
  [AlertStatus.RESOLVED]: 'Resuelta',
  [AlertStatus.DISMISSED]: 'Descartada'
};

export const ALERT_PRIORITY_LABEL: Record<AlertPriority, string> = {
  [AlertPriority.LOW]: 'Baja',
  [AlertPriority.MEDIUM]: 'Media',
  [AlertPriority.HIGH]: 'Alta',
  [AlertPriority.URGENT]: 'Urgente'
};
