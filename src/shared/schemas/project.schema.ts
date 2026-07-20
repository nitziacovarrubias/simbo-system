import { z } from 'zod';
import { ProjectStatus } from '../constants/domain.enums';

function optionalTrimmedString(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(maxLength).optional()
  );
}

const requiredDateSchema = z
  .string({ required_error: 'La fecha de inicio es obligatoria.' })
  .min(1, 'La fecha de inicio es obligatoria.')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'La fecha de inicio no es válida.');

const optionalDateSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'La fecha de entrega no es válida.')
    .optional()
);

export const projectSchema = z
  .object({
    name: z.string().trim().min(3, 'El nombre del proyecto es obligatorio.').max(160),
    clientId: z.string().min(1, 'Selecciona un cliente.'),
    location: optionalTrimmedString(250),
    description: optionalTrimmedString(2_000),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.DRAFT),
    startDate: requiredDateSchema,
    deliveryDate: optionalDateSchema
  })
  .superRefine((value, context) => {
    if (value.deliveryDate && new Date(value.deliveryDate) < new Date(value.startDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryDate'],
        message: 'La fecha de entrega no puede ser anterior a la fecha de inicio.'
      });
    }
  });

export type ProjectSchemaInput = z.infer<typeof projectSchema>;
