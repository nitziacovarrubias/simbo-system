import { z } from 'zod';

export const ROOM_LAYOUT_TYPES = ['RECTANGULAR', 'L_SHAPE', 'U_SHAPE', 'CUSTOM'] as const;

const positiveMeasureSchema = z
  .number({ invalid_type_error: 'La medida debe ser numérica.' })
  .finite('La medida debe ser un número válido.')
  .positive('Las medidas deben ser mayores a cero.')
  .max(100_000, 'La medida excede el rango permitido.');

const optionalPositiveMeasureSchema = z
  .number({ invalid_type_error: 'La medida debe ser numérica.' })
  .finite('La medida debe ser un número válido.')
  .positive('Las medidas deben ser mayores a cero.')
  .max(10_000, 'La medida excede el rango permitido.')
  .optional()
  .nullable();

export const roomOpeningSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, 'El nombre de la abertura es obligatorio.'),
  type: z.enum(['DOOR', 'WINDOW', 'OTHER']).default('OTHER'),
  wall: z.string().trim().optional(),
  widthMm: positiveMeasureSchema,
  heightMm: positiveMeasureSchema.optional(),
  positionMm: z
    .number({ invalid_type_error: 'La posición debe ser numérica.' })
    .finite('La posición debe ser un número válido.')
    .min(0, 'La posición no puede ser negativa.')
});

export const roomSpaceSchema = z
  .object({
    layoutType: z.enum(ROOM_LAYOUT_TYPES, {
      required_error: 'Selecciona un tipo de plano.'
    }),
    widthMm: positiveMeasureSchema,
    depthMm: positiveMeasureSchema,
    heightMm: positiveMeasureSchema,
    wallThicknessMm: optionalPositiveMeasureSchema,
    notes: z.string().trim().max(2_000, 'Las notas no pueden exceder 2000 caracteres.').optional(),
    openings: z.array(roomOpeningSchema).default([]),
    createdAt: z.string().datetime('La fecha de creación no es válida.').optional(),
    updatedAt: z.string().datetime('La fecha de actualización no es válida.').optional()
  })
  .superRefine((value, context) => {
    if (
      value.wallThicknessMm !== null &&
      value.wallThicknessMm !== undefined &&
      value.wallThicknessMm * 2 >= Math.min(value.widthMm, value.depthMm)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wallThicknessMm'],
        message: 'El grosor del muro debe ser menor que la mitad del espacio.'
      });
    }

    for (const [index, opening] of value.openings.entries()) {
      if (opening.positionMm + opening.widthMm > Math.max(value.widthMm, value.depthMm)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['openings', index, 'positionMm'],
          message: 'La abertura debe quedar dentro de las dimensiones del espacio.'
        });
      }
    }
  });

export type RoomSpaceSchemaInput = z.infer<typeof roomSpaceSchema>;
