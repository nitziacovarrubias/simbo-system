import { z } from 'zod';
import { AlertPriority } from '../constants/alert-priority';

export const incidentAlertSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio.').max(160),
  description: z.string().trim().min(1, 'La descripción es obligatoria.').max(2000),
  priority: z.nativeEnum(AlertPriority),
  dueDate: z.string().datetime('La fecha no es válida.').nullable().optional()
});

export const alertResolutionSchema = z.object({
  notes: z.string().trim().min(3, 'La nota de resolución es obligatoria.').max(2000)
});

export type IncidentAlertSchemaInput = z.infer<typeof incidentAlertSchema>;
export type AlertResolutionSchemaInput = z.infer<typeof alertResolutionSchema>;
