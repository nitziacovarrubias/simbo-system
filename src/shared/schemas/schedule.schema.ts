import { z } from 'zod';

export const scheduleProjectIdSchema = z.string().trim().min(1, 'El proyecto es obligatorio.');
export const scheduleActivityIdSchema = z.string().trim().min(1, 'La actividad es obligatoria.');
export const scheduleAlertIdSchema = z.string().trim().min(1, 'La alerta es obligatoria.');
