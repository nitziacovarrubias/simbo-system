import { ClientStatus, ProjectStatus } from '@shared/constants/domain.enums';
import type { RoomLayoutType } from '@shared/types';

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  [ClientStatus.ACTIVE]: 'Activo',
  [ClientStatus.INACTIVE]: 'Inactivo',
  [ClientStatus.ARCHIVED]: 'Archivado'
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Borrador',
  [ProjectStatus.DESIGN]: 'Diseño',
  [ProjectStatus.REVIEW]: 'Revisión',
  [ProjectStatus.QUOTING]: 'Cotización',
  [ProjectStatus.APPROVED]: 'Aprobado',
  [ProjectStatus.CUTTING_LIST]: 'Despiece',
  [ProjectStatus.PRODUCTION]: 'Producción',
  [ProjectStatus.INSTALLATION]: 'Instalación',
  [ProjectStatus.CLOSED]: 'Finalizado',
  [ProjectStatus.ARCHIVED]: 'Archivado'
};

export const ROOM_LAYOUT_LABEL: Record<RoomLayoutType, string> = {
  RECTANGULAR: 'Rectangular',
  L_SHAPE: 'Forma de L',
  U_SHAPE: 'Forma de U',
  CUSTOM: 'Personalizado'
};

export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = Object.values(ProjectStatus).filter(
  (status) => status !== ProjectStatus.CLOSED && status !== ProjectStatus.ARCHIVED
);
