import type {
  Activity,
  Alert,
  Client,
  CuttingList,
  Design,
  Document,
  HistoryEntry,
  Material,
  Person,
  Project,
  Quote,
  Render,
  User,
} from '@prisma/client';
import {
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
  UserRole,
} from '../../shared/constants/domain.enums';
import type {
  ActivityListItem,
  AlertListItem,
  ClientListItem,
  CuttingListItem,
  DesignListItem,
  DocumentListItem,
  HistoryEntryListItem,
  MaterialListItem,
  PersonSummary,
  ProjectListItem,
  QuoteListItem,
  RenderListItem,
  UserListItem,
} from '../../shared/types';

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
    email: person.email,
  };
}

export function toUserListItem(user: User & { person: Person | null }): UserListItem {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as UserRole,
    isActive: user.isActive,
    person: user.person ? toPersonSummary(user.person) : null,
  };
}

export function toClientListItem(client: Client & { person: Person; _count: { projects: number } }): ClientListItem {
  return {
    id: client.id,
    person: toPersonSummary(client.person),
    projectAddress: client.projectAddress,
    status: client.status as ClientStatus,
    notes: client.notes,
    projectCount: client._count.projects,
    updatedAt: client.updatedAt.toISOString(),
  };
}

export function toProjectListItem(
  project: Project & { client: Client & { person: Person } },
): ProjectListItem {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    location: project.location,
    status: project.status as ProjectStatus,
    clientName: `${project.client.person.firstName} ${project.client.person.lastName}`.trim(),
    deliveryDate: toIso(project.deliveryDate),
    updatedAt: project.updatedAt.toISOString(),
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
    updatedAt: design.updatedAt.toISOString(),
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
    isActive: material.isActive,
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
    updatedAt: render.updatedAt.toISOString(),
  };
}

export function toCuttingListItem(list: CuttingList & { _count?: { pieces: number } }): CuttingListItem {
  return {
    id: list.id,
    projectId: list.projectId,
    version: list.version,
    status: list.status as CuttingListStatus,
    piecesCount: list._count?.pieces ?? 0,
    updatedAt: list.updatedAt.toISOString(),
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
    updatedAt: quote.updatedAt.toISOString(),
  };
}

export function toActivityListItem(
  activity: Activity & { assignedTo?: (User & { person: Person | null }) | null },
): ActivityListItem {
  const assignedToPerson = activity.assignedTo?.person;
  return {
    id: activity.id,
    projectId: activity.projectId,
    title: activity.title,
    stage: activity.stage,
    status: activity.status as ActivityStatus,
    priority: activity.priority as AlertPriority,
    assignedToName: assignedToPerson ? `${assignedToPerson.firstName} ${assignedToPerson.lastName}`.trim() : null,
    startDate: toIso(activity.startDate),
    dueDate: toIso(activity.dueDate),
  };
}

export function toAlertListItem(alert: Alert): AlertListItem {
  return {
    id: alert.id,
    projectId: alert.projectId,
    title: alert.title,
    message: alert.message,
    priority: alert.priority as AlertPriority,
    isRead: alert.isRead,
    resolvedAt: toIso(alert.resolvedAt),
    createdAt: alert.createdAt.toISOString(),
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
    createdAt: document.createdAt.toISOString(),
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
    createdAt: entry.createdAt.toISOString(),
  };
}
