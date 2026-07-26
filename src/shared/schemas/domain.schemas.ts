import { z } from 'zod';
import { clientSchema } from './client.schema';
import { projectSchema } from './project.schema';
import { roomOpeningSchema, roomSpaceSchema } from './room-space.schema';
import {
  ActivityStatus,
  AlertPriority,
  CommentTargetType,
  CuttingListStatus,
  DesignStatus,
  DocumentType,
  HistoryAction,
  MaterialUnit,
  QuoteStatus,
  QuoteItemSourceType,
  Currency,
  RenderStatus,
  UserRole
} from '../constants/domain.enums';
import { EDGE_BANDING_OPTIONS } from '../constants/edge-banding';
import { GRAIN_DIRECTIONS } from '../constants/grain-direction';

const idSchema = z.string().min(1, 'El identificador es obligatorio.');
const optionalIdSchema = idSchema.optional().nullable();
const isoDateSchema = z.string().datetime('La fecha debe tener formato ISO.').optional().nullable();
const positiveMeasureSchema = z.number().positive('La medida debe ser mayor a cero.');
const moneySchema = z.number().min(0, 'El monto no puede ser negativo.');
const jsonStringSchema = z.string().min(2).optional().nullable();

export const personSchema = z.object({
  id: idSchema.optional(),
  firstName: z.string().min(2, 'El nombre es obligatorio.'),
  lastName: z.string().min(2, 'El apellido es obligatorio.'),
  phone: z.string().min(7).optional().nullable(),
  address: z.string().optional().nullable(),
  email: z.string().email('El correo no es válido.').optional().nullable(),
  rfc: z.string().min(12).max(13).optional().nullable()
});

export const userSchema = z.object({
  id: idSchema.optional(),
  personId: optionalIdSchema,
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres.'),
  email: z.string().email('El correo no es válido.'),
  passwordHash: z.string().min(8, 'La contraseña debe estar protegida.'),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().default(true)
});

export { clientSchema, projectSchema, roomOpeningSchema, roomSpaceSchema };

export const designSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  createdById: optionalIdSchema,
  approvedById: optionalIdSchema,
  title: z.string().min(3),
  version: z.number().int().positive().default(1),
  status: z.nativeEnum(DesignStatus).default(DesignStatus.DRAFT),
  isCurrent: z.boolean().default(true),
  roomSpaceJson: jsonStringSchema,
  designJson: z.string().min(2).default('{}'),
  notes: z.string().optional().nullable(),
  approvedAt: isoDateSchema
});

export const designModuleSchema = z.object({
  id: idSchema.optional(),
  designId: idSchema,
  templateId: optionalIdSchema,
  materialId: optionalIdSchema,
  name: z.string().min(2),
  kind: z.string().min(2),
  positionXmm: z.number().default(0),
  positionYmm: z.number().default(0),
  positionZmm: z.number().default(0),
  rotationX: z.number().default(0),
  rotationY: z.number().default(0),
  rotationZ: z.number().default(0),
  widthMm: positiveMeasureSchema,
  heightMm: positiveMeasureSchema,
  depthMm: positiveMeasureSchema,
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional().nullable()
});

export const moduleTemplateSchema = z.object({
  id: idSchema.optional(),
  code: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  defaultWidthMm: positiveMeasureSchema,
  defaultHeightMm: positiveMeasureSchema,
  defaultDepthMm: positiveMeasureSchema,
  parameterJson: z.string().default('{}'),
  isActive: z.boolean().default(true)
});

export const materialSchema = z.object({
  id: idSchema.optional(),
  code: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  unit: z.nativeEnum(MaterialUnit).default(MaterialUnit.SHEET),
  cost: moneySchema,
  thicknessMm: positiveMeasureSchema.optional().nullable(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
  texturePath: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const renderSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  designId: optionalIdSchema,
  createdById: optionalIdSchema,
  title: z.string().min(3),
  version: z.number().int().positive().default(1),
  status: z.nativeEnum(RenderStatus).default(RenderStatus.PRELIMINARY),
  filePath: z.string().optional().nullable(),
  thumbnailPath: z.string().optional().nullable(),
  format: z.string().min(2),
  resolutionWidth: z.number().int().positive(),
  resolutionHeight: z.number().int().positive(),
  sizeMb: z.number().min(0).optional().nullable(),
  viewType: z.string().optional().nullable(),
  cameraAngle: z.string().optional().nullable(),
  quality: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const cuttingListSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  designId: optionalIdSchema,
  generatedById: optionalIdSchema,
  validatedById: optionalIdSchema,
  version: z.number().int().positive().default(1),
  designVersion: z.number().int().positive().optional().nullable(),
  status: z.nativeEnum(CuttingListStatus).default(CuttingListStatus.DRAFT),
  notes: z.string().optional().nullable(),
  validationNotes: z.string().optional().nullable(),
  exportPath: z.string().optional().nullable(),
  generatedAt: isoDateSchema,
  authorizedAt: isoDateSchema,
  rejectedAt: isoDateSchema,
  exportedAt: isoDateSchema
});

export const cuttingPieceSchema = z.object({
  id: idSchema.optional(),
  cuttingListId: idSchema,
  sourceModuleId: optionalIdSchema,
  sourceModuleName: z.string().min(1),
  pieceName: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().int().positive(),
  materialId: optionalIdSchema,
  materialName: z.string().min(1),
  thicknessMm: z.number().min(0),
  widthMm: positiveMeasureSchema,
  heightMm: positiveMeasureSchema,
  depthMm: positiveMeasureSchema.optional().nullable(),
  grainDirection: z.enum(GRAIN_DIRECTIONS),
  edgeBanding: z.enum(EDGE_BANDING_OPTIONS),
  comments: z.string().optional().nullable(),
  isManual: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0)
});

export const quoteItemSchema = z.object({
  id: idSchema.optional(),
  quoteId: idSchema.optional(),
  materialId: optionalIdSchema,
  sourceType: z.nativeEnum(QuoteItemSourceType).default(QuoteItemSourceType.CUSTOM),
  sourcePieceId: optionalIdSchema,
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: moneySchema,
  amount: moneySchema,
  comments: z.string().optional().nullable(),
  isManual: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0)
});

export const quoteSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  cuttingListId: optionalIdSchema,
  createdById: optionalIdSchema,
  version: z.number().int().positive().default(1),
  status: z.nativeEnum(QuoteStatus).default(QuoteStatus.DRAFT),
  subtotal: moneySchema.default(0),
  taxRate: z.number().min(0).max(1).default(0.16),
  taxAmount: moneySchema.default(0),
  laborCost: moneySchema.default(0),
  extraCost: moneySchema.default(0),
  discountAmount: moneySchema.default(0),
  advancePayment: moneySchema.default(0),
  total: moneySchema.default(0),
  currency: z.nativeEnum(Currency).default(Currency.MXN),
  notes: z.string().optional().nullable(),
  clientDecisionNotes: z.string().optional().nullable(),
  items: z.array(quoteItemSchema).default([])
});

export const activitySchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  assignedToId: optionalIdSchema,
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  stage: z.string().optional().nullable(),
  status: z.nativeEnum(ActivityStatus).default(ActivityStatus.PENDING),
  priority: z.nativeEnum(AlertPriority).default(AlertPriority.MEDIUM),
  startDate: isoDateSchema,
  dueDate: isoDateSchema,
  completedAt: isoDateSchema
});

export const alertSchema = z.object({
  id: idSchema.optional(),
  projectId: optionalIdSchema,
  activityId: optionalIdSchema,
  createdById: optionalIdSchema,
  title: z.string().min(2),
  message: z.string().min(5),
  priority: z.nativeEnum(AlertPriority).default(AlertPriority.MEDIUM),
  isRead: z.boolean().default(false),
  resolvedAt: isoDateSchema
});

export const documentSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  uploadedById: optionalIdSchema,
  title: z.string().min(2),
  fileName: z.string().min(2),
  filePath: z.string().min(2),
  mimeType: z.string().optional().nullable(),
  fileSize: z.number().int().min(0).optional().nullable(),
  documentType: z.nativeEnum(DocumentType).default(DocumentType.OTHER),
  stage: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const historyEntrySchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  userId: optionalIdSchema,
  action: z.nativeEnum(HistoryAction),
  entityType: z.string().min(2),
  entityId: z.string().optional().nullable(),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  beforeJson: jsonStringSchema,
  afterJson: jsonStringSchema
});

export const commentSchema = z.object({
  id: idSchema.optional(),
  projectId: idSchema,
  designId: optionalIdSchema,
  moduleId: optionalIdSchema,
  documentId: optionalIdSchema,
  userId: optionalIdSchema,
  targetType: z.nativeEnum(CommentTargetType),
  targetId: z.string().optional().nullable(),
  body: z.string().min(2),
  isResolved: z.boolean().default(false)
});

export const projectIdInputSchema = z.object({
  projectId: idSchema
});

export type UserInput = z.infer<typeof userSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type RoomSpaceInput = z.infer<typeof roomSpaceSchema>;
export type DesignInput = z.infer<typeof designSchema>;
export type DesignModuleInput = z.infer<typeof designModuleSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
export type RenderInput = z.infer<typeof renderSchema>;
export type CuttingListInput = z.infer<typeof cuttingListSchema>;
export type CuttingPieceInput = z.infer<typeof cuttingPieceSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type HistoryEntryInput = z.infer<typeof historyEntrySchema>;
