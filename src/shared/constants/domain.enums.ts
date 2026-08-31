export enum UserRole {
  ARCHITECT = 'ARCHITECT',
  SUPERVISOR = 'SUPERVISOR',
  COLLABORATOR = 'COLLABORATOR',
  RESPONSIBLE = 'RESPONSIBLE',
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  DESIGN = 'DESIGN',
  REVIEW = 'REVIEW',
  QUOTING = 'QUOTING',
  APPROVED = 'APPROVED',
  CUTTING_LIST = 'CUTTING_LIST',
  PRODUCTION = 'PRODUCTION',
  INSTALLATION = 'INSTALLATION',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum DesignStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OUTDATED = 'OUTDATED',
}

export enum RenderStatus {
  GENERATING = 'GENERATING',
  PRELIMINARY = 'PRELIMINARY',
  FINAL = 'FINAL',
  FAILED = 'FAILED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CuttingListStatus {
  DRAFT = 'DRAFT',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  AUTHORIZED = 'AUTHORIZED',
  REJECTED = 'REJECTED',
  OUTDATED = 'OUTDATED',
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OUTDATED = 'OUTDATED',
}

export enum QuoteItemSourceType {
  MATERIAL = 'MATERIAL',
  LABOR = 'LABOR',
  EXTRA = 'EXTRA',
  DISCOUNT = 'DISCOUNT',
  CUSTOM = 'CUSTOM',
}

export enum Currency {
  MXN = 'MXN',
  USD = 'USD',
}

export { ActivityStage } from './activity-stage';
export { ActivityStatus } from './activity-status';
export { ActivityPriority } from './activity-priority';
export { AlertType } from './alert-type';
export { AlertPriority } from './alert-priority';
export { AlertStatus } from './alert-status';


export enum DocumentType {
  MEASUREMENTS = 'MEASUREMENTS',
  QUOTE = 'QUOTE',
  CONTRACT = 'CONTRACT',
  CUTTING_LIST = 'CUTTING_LIST',
  PLAN = 'PLAN',
  RENDER = 'RENDER',
  DELIVERY_CERTIFICATE = 'DELIVERY_CERTIFICATE',
  OTHER = 'OTHER',
}

export enum MaterialUnit {
  BOARD = 'BOARD',
  SHEET = 'SHEET',
  LINEAR_METER = 'LINEAR_METER',
  SQUARE_METER = 'SQUARE_METER',
  PIECE = 'PIECE',
}

export enum HistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  COMMENTED = 'COMMENTED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  EXPORTED = 'EXPORTED',
}

export enum CommentTargetType {
  PROJECT = 'PROJECT',
  DESIGN = 'DESIGN',
  DESIGN_MODULE = 'DESIGN_MODULE',
  RENDER = 'RENDER',
  CUTTING_LIST = 'CUTTING_LIST',
  QUOTE = 'QUOTE',
  ACTIVITY = 'ACTIVITY',
  DOCUMENT = 'DOCUMENT',
}
