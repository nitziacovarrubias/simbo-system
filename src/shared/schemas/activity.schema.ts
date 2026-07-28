import { z } from 'zod';
import { ActivityPriority } from '../constants/activity-priority';
import { ActivityStage } from '../constants/activity-stage';
import { ActivityStatus } from '../constants/activity-status';

const nullableText = z
  .string()
  .trim()
  .max(1000, 'El texto es demasiado largo.')
  .nullable()
  .optional();

const activityBaseSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio.').max(160),
  description: nullableText,
  stage: z.nativeEnum(ActivityStage),
  assignedUserId: z.string().trim().min(1).nullable().optional(),
  assignedPersonName: z.string().trim().max(160).nullable().optional(),
  startDate: z.string().datetime('La fecha de inicio no es válida.'),
  dueDate: z.string().datetime('La fecha límite no es válida.'),
  status: z.nativeEnum(ActivityStatus),
  priority: z.nativeEnum(ActivityPriority),
  progressPercent: z
    .number()
    .int('El avance debe ser un número entero.')
    .min(0, 'El avance mínimo es 0%.')
    .max(100, 'El avance máximo es 100%.'),
  notes: nullableText
});

function validateDates(
  value: { startDate?: string; dueDate?: string },
  context: z.RefinementCtx
): void {
  if (value.startDate && value.dueDate && new Date(value.dueDate) < new Date(value.startDate)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dueDate'],
      message: 'La fecha límite no puede ser menor que la fecha de inicio.'
    });
  }
}

export const activitySchema = activityBaseSchema.superRefine(validateDates);
export const activityUpdateSchema = activityBaseSchema.partial().superRefine(validateDates);

export type ActivitySchemaInput = z.infer<typeof activitySchema>;
export type ActivityUpdateSchemaInput = z.infer<typeof activityUpdateSchema>;
