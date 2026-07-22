import { z } from 'zod';
import { MaterialUnit } from '../constants/domain.enums';
import { hexColorSchema } from './design-module.schema';

export const materialSchema = z.object({
  id: z.string().min(1),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  unit: z.nativeEnum(MaterialUnit),
  costPerUnit: z.number().finite().min(0),
  thicknessMm: z.number().finite().positive().nullable(),
  colorHex: hexColorSchema,
  textureName: z.string().trim().min(1).nullable(),
  isActive: z.boolean()
});
