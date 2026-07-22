import { z } from 'zod';
import { DesignStatus } from '../constants/domain.enums';
import { roomSpaceSchema } from './room-space.schema';

export const designViewModeSchema = z.enum(['2D', '3D']);

export const createDesignSchema = z.object({
  title: z.string().trim().min(1, 'El título del diseño es obligatorio.').max(160),
  roomSpace: roomSpaceSchema,
  viewMode: designViewModeSchema.default('3D'),
  notes: z.string().trim().max(2_000).optional()
});

export const updateDesignSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    viewMode: designViewModeSchema.optional(),
    notes: z.string().trim().max(2_000).optional(),
    status: z.nativeEnum(DesignStatus).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No hay cambios de diseño para guardar.'
  });

export type CreateDesignSchemaInput = z.infer<typeof createDesignSchema>;
export type UpdateDesignSchemaInput = z.infer<typeof updateDesignSchema>;
