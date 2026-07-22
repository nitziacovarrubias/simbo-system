import { z } from 'zod';

export const DESIGN_MODULE_TYPES = [
  'BASE_CABINET',
  'WALL_CABINET',
  'TALL_CABINET',
  'SHELF',
  'ISLAND',
  'APPLIANCE_PLACEHOLDER'
] as const;

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe tener formato hexadecimal, por ejemplo #F2F2F2.');

const finiteNumberSchema = z
  .number({ invalid_type_error: 'El valor debe ser numérico.' })
  .finite('El valor debe ser un número válido.');

const positiveMeasureSchema = finiteNumberSchema
  .positive('Las medidas deben ser mayores a cero.')
  .max(100_000, 'La medida excede el rango permitido.');

export const designModuleSchema = z.object({
  id: z.string().min(1, 'El módulo debe tener un identificador.'),
  templateId: z.string().min(1, 'Selecciona una plantilla de módulo.'),
  type: z.enum(DESIGN_MODULE_TYPES),
  displayName: z.string().trim().min(1, 'El nombre del módulo es obligatorio.'),
  positionX: finiteNumberSchema,
  positionY: finiteNumberSchema,
  positionZ: finiteNumberSchema,
  widthMm: positiveMeasureSchema,
  heightMm: positiveMeasureSchema,
  depthMm: positiveMeasureSchema,
  rotationY: finiteNumberSchema,
  materialId: z.string().min(1).nullable(),
  colorHex: hexColorSchema,
  notes: z.string().trim().max(2_000, 'Las notas no pueden exceder 2000 caracteres.'),
  hasCollision: z.boolean()
});

export const designModulesSchema = z
  .array(designModuleSchema)
  .max(500, 'El diseño excede 500 módulos.');

export type DesignModuleSchemaInput = z.infer<typeof designModuleSchema>;
