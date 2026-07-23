import { z } from 'zod';
import { EDGE_BANDING_OPTIONS } from '../constants/edge-banding';
import { GRAIN_DIRECTIONS } from '../constants/grain-direction';

const nullableIdSchema = z.string().min(1).nullable().optional();

export const cuttingPieceInputSchema = z.object({
  sourceModuleId: nullableIdSchema,
  sourceModuleName: z.string().trim().min(1, 'El módulo de origen es obligatorio.'),
  pieceName: z.string().trim().min(1, 'El nombre de la pieza es obligatorio.'),
  category: z.string().trim().min(1, 'La categoría es obligatoria.'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
  materialId: nullableIdSchema,
  materialName: z.string().trim().min(1, 'El material es obligatorio.'),
  thicknessMm: z.coerce.number().min(0, 'El espesor no puede ser negativo.'),
  widthMm: z.coerce.number().positive('El ancho debe ser mayor a cero.'),
  heightMm: z.coerce.number().positive('El alto debe ser mayor a cero.'),
  depthMm: z.coerce.number().positive('La profundidad debe ser mayor a cero.').nullable().optional(),
  grainDirection: z.enum(GRAIN_DIRECTIONS),
  edgeBanding: z.enum(EDGE_BANDING_OPTIONS),
  comments: z.string().trim().max(1000).optional().default(''),
  sortOrder: z.coerce.number().int().min(0).optional().default(0)
});

export const updateCuttingPieceSchema = cuttingPieceInputSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  'Debes modificar al menos un campo.'
);

export const rejectCuttingListSchema = z.object({
  reason: z.string().trim().min(1, 'Debes ingresar un motivo para rechazar la lista.')
});

export const authorizeCuttingListSchema = z.object({
  notes: z.string().trim().max(1000).optional().default('')
});

export type CuttingPieceInputSchema = z.infer<typeof cuttingPieceInputSchema>;
export type UpdateCuttingPieceInputSchema = z.infer<typeof updateCuttingPieceSchema>;
