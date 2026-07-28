import type {
  Activity,
  Alert,
  CuttingList,
  Design,
  Document,
  HistoryEntry,
  Material,
  Person,
  Quote,
  Render,
  User
} from '@prisma/client';
import {
  ActivityPriority,
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
} from '../../shared/constants/domain.enums';
import type {
  ActivityListItem,
  AlertListItem,
  ClientDetail,
  ClientListItem,
  CuttingListItem,
  DesignListItem,
  DocumentListItem,
  HistoryEntryListItem,
  MaterialListItem,
  PersonSummary,
  ProjectDetail,
  ProjectListItem,
  QuoteListItem,
  RenderListItem,
  UserListItem
} from '../../shared/types';
import type { ClientDetailRecord, ClientListRecord } from '../repositories/client.repository';
import type { ProjectDetailRecord, ProjectListRecord } from '../repositories/project.repository';
import { parseRoomSpaceJson } from './room-space.service';

export function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function toPersonSummary(person: Person): PersonSummary {
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: `${person.firstName} ${person.lastName}`.trim(),
    phone: person.phone,
    email: person.email
  };
}

function getAssignedPersonName(
  activities: Array<{ assignedUser: (User & { person: Person | null }) | null }>
): string | null {
  const person = activities.find((activity) => activity.assignedUser?.person)?.assignedUser?.person;
  return person ? `${person.firstName} ${person.lastName}`.trim() : null;
}

export function toUserListItem(user: User & { person: Person | null }): UserListItem {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as UserRole,
    isActive: user.isActive,
    person: user.person ? toPersonSummary(user.person) : null
  };
}

export function toClientListItem(client: ClientListRecord): ClientListItem {
  return {
    id: client.id,
    person: toPersonSummary(client.person),
    projectAddress: client.projectAddress,
    status: client.status as ClientStatus,
    notes: client.notes,
    projectCount: client._count.projects,
    updatedAt: client.updatedAt.toISOString()
  };
}

export function toClientDetail(client: ClientDetailRecord): ClientDetail {
  return {
    id: client.id,
    firstName: client.person.firstName,
    lastName: client.person.lastName,
    fullName: `${client.person.firstName} ${client.person.lastName}`.trim(),
    phone: client.person.phone,
    email: client.person.email,
    address: client.person.address,
    rfc: client.person.rfc,
    projectAddress: client.projectAddress,
    initialContactDate: toIso(client.initialContactDate),
    status: client.status as ClientStatus,
    notes: client.notes,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    projects: client.projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status as ProjectStatus,
      location: project.location,
      startDate: project.startDate.toISOString(),
      deliveryDate: toIso(project.deliveryDate)
    }))
  };
}

export function toProjectListItem(project: ProjectListRecord): ProjectListItem {
  return {
    id: project.id,
    clientId: project.clientId,
    name: project.name,
    description: project.description,
    location: project.location,
    status: project.status as ProjectStatus,
    clientName: `${project.client.person.firstName} ${project.client.person.lastName}`.trim(),
    startDate: project.startDate.toISOString(),
    deliveryDate: toIso(project.deliveryDate),
    mainResponsibleName: getAssignedPersonName(project.activities),
    hasRoomSpace: Boolean(parseRoomSpaceJson(project.roomSpaceJson)),
    updatedAt: project.updatedAt.toISOString()
  };
}

export function toProjectDetail(project: ProjectDetailRecord): ProjectDetail {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    location: project.location,
    status: project.status as ProjectStatus,
    startDate: project.startDate.toISOString(),
    deliveryDate: toIso(project.deliveryDate),
    roomSpace: parseRoomSpaceJson(project.roomSpaceJson),
    client: {
      id: project.client.id,
      fullName: `${project.client.person.firstName} ${project.client.person.lastName}`.trim(),
      phone: project.client.person.phone,
      email: project.client.person.email,
      projectAddress: project.client.projectAddress,
      status: project.client.status as ClientStatus
    },
    mainResponsibleName: getAssignedPersonName(project.activities),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    history: project.historyEntries.map(toHistoryEntryListItem)
  };
}

export function toDesignListItem(design: Design): DesignListItem {
  return {
    id: design.id,
    projectId: design.projectId,
    title: design.title,
    version: design.version,
    status: design.status as DesignStatus,
    isCurrent: design.isCurrent,
    updatedAt: design.updatedAt.toISOString()
  };
}

export function toMaterialListItem(material: Material): MaterialListItem {
  return {
    id: material.id,
    code: material.code,
    name: material.name,
    category: material.category,
    unit: material.unit as MaterialUnit,
    cost: material.cost,
    thicknessMm: material.thicknessMm,
    colorHex: material.colorHex,
    isActive: material.isActive
  };
}

export function toRenderListItem(render: Render): RenderListItem {
  return {
    id: render.id,
    projectId: render.projectId,
    title: render.title,
    version: render.version,
    status: render.status as RenderStatus,
    format: render.format,
    resolutionWidth: render.resolutionWidth,
    resolutionHeight: render.resolutionHeight,
    updatedAt: render.updatedAt.toISOString()
  };
}

export function toCuttingListItem(
  list: CuttingList & { _count?: { pieces: number } }
): CuttingListItem {
  return {
    id: list.id,
    projectId: list.projectId,
    version: list.version,
    status: list.status as CuttingListStatus,
    piecesCount: list._count?.pieces ?? 0,
    updatedAt: list.updatedAt.toISOString()
  };
}

export function toQuoteListItem(quote: Quote): QuoteListItem {
  return {
    id: quote.id,
    projectId: quote.projectId,
    version: quote.version,
    status: quote.status as QuoteStatus,
    subtotal: quote.subtotal,
    taxAmount: quote.taxAmount,
    laborCost: quote.laborCost,
    advancePayment: quote.advancePayment,
    total: quote.total,
    updatedAt: quote.updatedAt.toISOString()
  };
}

export function toActivityListItem(
  activity: Activity & { assignedUser?: (User & { person: Person | null }) | null }
): ActivityListItem {
  const assignedToPerson = activity.assignedUser?.person;
  return {
    id: activity.id,
    projectId: activity.projectId,
    title: activity.title,
    stage: activity.stage,
    status: activity.status as ActivityStatus,
    priority: activity.priority as ActivityPriority,
    assignedToName: assignedToPerson
      ? `${assignedToPerson.firstName} ${assignedToPerson.lastName}`.trim()
      : null,
    startDate: toIso(activity.startDate),
    dueDate: toIso(activity.dueDate)
  };
}

export function toAlertListItem(alert: Alert): AlertListItem {
  return {
    id: alert.id,
    projectId: alert.projectId,
    title: alert.title,
    message: alert.description,
    priority: alert.priority as AlertPriority,
    isRead: alert.status === 'RESOLVED' || alert.status === 'DISMISSED',
    resolvedAt: toIso(alert.resolvedAt),
    createdAt: alert.createdAt.toISOString()
  };
}

export function toDocumentListItem(document: Document): DocumentListItem {
  return {
    id: document.id,
    projectId: document.projectId,
    title: document.title,
    fileName: document.fileName,
    filePath: document.filePath,
    documentType: document.documentType as DocumentType,
    stage: document.stage,
    createdAt: document.createdAt.toISOString()
  };
}

export function toHistoryEntryListItem(entry: HistoryEntry): HistoryEntryListItem {
  return {
    id: entry.id,
    projectId: entry.projectId,
    action: entry.action as HistoryAction,
    entityType: entry.entityType,
    title: entry.title,
    description: entry.description,
    createdAt: entry.createdAt.toISOString()
  };
}
