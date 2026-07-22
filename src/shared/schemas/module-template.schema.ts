import { z } from 'zod';
import { DESIGN_MODULE_TYPES } from './design-module.schema';

export const moduleTemplateSchema = z.object({
  id: z.string().min(1),
  code: z.string().trim().min(1),
  type: z.enum(DESIGN_MODULE_TYPES),
  displayName: z.string().trim().min(1),
  category: z.string().trim().min(1),
  defaultWidthMm: z.number().finite().positive(),
  defaultHeightMm: z.number().finite().positive(),
  defaultDepthMm: z.number().finite().positive(),
  isActive: z.boolean()
});
