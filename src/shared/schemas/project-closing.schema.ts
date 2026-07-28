import { z } from 'zod';
import { UserRole } from '../constants/roles';

export const closeProjectSchema = z
  .object({
    actorRole: z.nativeEnum(UserRole),
    confirmOpenActivities: z.boolean(),
    reason: z.string().trim().max(2000).nullable().optional()
  })
  .superRefine((value, context) => {
    if (value.confirmOpenActivities && (!value.reason || value.reason.length < 5)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message: 'Escribe un motivo para cerrar el proyecto con actividades pendientes.'
      });
    }
  });

export const archiveProjectSchema = z.object({
  actorRole: z.nativeEnum(UserRole),
  notes: z.string().trim().max(2000).nullable().optional()
});
