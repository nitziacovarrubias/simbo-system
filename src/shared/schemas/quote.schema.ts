import { z } from 'zod';
import { QuoteItemSourceType } from '../constants/domain.enums';

const optionalIdSchema = z.string().min(1).optional().nullable();
const moneySchema = z.number().finite().min(0, 'El importe no puede ser negativo.');
const taxRateSchema = z.union([z.literal(0), z.literal(0.08), z.literal(0.16)]);

export const quoteItemInputSchema = z.object({
  materialId: optionalIdSchema,
  sourceType: z.nativeEnum(QuoteItemSourceType),
  sourcePieceId: optionalIdSchema,
  description: z.string().trim().min(1, 'La descripción es obligatoria.'),
  quantity: z.number().finite().positive('La cantidad debe ser mayor que cero.'),
  unit: z.string().trim().min(1, 'La unidad es obligatoria.'),
  unitPrice: moneySchema,
  comments: z.string().trim().max(500).optional().default(''),
  sortOrder: z.number().int().min(0).optional().default(0)
});

export const updateQuoteItemSchema = quoteItemInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debes enviar al menos un campo para actualizar.'
);

export const quoteAdjustmentsSchema = z.object({
  taxRate: taxRateSchema,
  laborCost: moneySchema,
  extraCost: moneySchema,
  discountAmount: moneySchema,
  advancePayment: moneySchema,
  notes: z.string().trim().max(2000).optional().default('')
});

export const approveQuoteSchema = z.object({
  notes: z.string().trim().max(1000).optional().default('')
});

export const rejectQuoteSchema = z.object({
  reason: z.string().trim().min(1, 'El motivo de rechazo es obligatorio.').max(1000)
});

export type QuoteItemInputSchema = z.infer<typeof quoteItemInputSchema>;
export type QuoteAdjustmentsSchema = z.infer<typeof quoteAdjustmentsSchema>;
