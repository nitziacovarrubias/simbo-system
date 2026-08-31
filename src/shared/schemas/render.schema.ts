import { z } from 'zod';
import {
  RENDER_IMAGE_FORMATS,
  RENDER_QUALITY_LEVELS,
  RENDER_RESOLUTION_KEYS,
  RENDER_VIEW_TYPES
} from '../constants/render-options';

export const renderSettingsSchema = z.object({
  title: z.string().trim().min(3, 'Escribe un título de al menos 3 caracteres.').max(160),
  resolution: z.enum(RENDER_RESOLUTION_KEYS),
  imageFormat: z.enum(RENDER_IMAGE_FORMATS),
  viewType: z.enum(RENDER_VIEW_TYPES),
  quality: z.enum(RENDER_QUALITY_LEVELS),
  notes: z.string().trim().max(2000, 'Las notas no pueden exceder 2000 caracteres.').optional(),
  createdByUserId: z.string().trim().min(1).optional()
});

export const renderImageDataUrlSchema = z
  .string()
  .min(30, 'La imagen del render está vacía.')
  .max(120_000_000, 'La imagen del render excede el tamaño permitido.')
  .refine(
    (value) => /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=\r\n]+$/.test(value),
    'La imagen del render no tiene un formato válido.'
  );

export const renderDecisionSchema = z.object({
  notes: z.string().trim().max(2000).optional().default('')
});

export const renderRejectSchema = z.object({
  reason: z.string().trim().min(5, 'Escribe el motivo del rechazo.').max(2000)
});
