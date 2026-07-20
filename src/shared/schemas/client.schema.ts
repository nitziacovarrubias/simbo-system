import { z } from 'zod';
import { ClientStatus } from '../constants/domain.enums';

function optionalTrimmedString(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(maxLength).optional()
  );
}

const optionalDateSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'La fecha de contacto no es válida.')
    .optional()
);

const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().email('El correo no es válido.').max(160).optional()
);

const optionalPhoneSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .string()
    .trim()
    .min(7, 'El teléfono debe tener al menos 7 caracteres.')
    .max(25, 'El teléfono no puede exceder 25 caracteres.')
    .regex(/^[+()\d\s.-]+$/, 'El teléfono contiene caracteres no válidos.')
    .optional()
);

const optionalRfcSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .string()
    .trim()
    .toUpperCase()
    .min(12, 'El RFC debe tener 12 o 13 caracteres.')
    .max(13, 'El RFC debe tener 12 o 13 caracteres.')
    .regex(/^[A-ZÑ&0-9]+$/, 'El RFC contiene caracteres no válidos.')
    .optional()
);

export const clientSchema = z.object({
  firstName: z.string().trim().min(2, 'El nombre es obligatorio.').max(80),
  lastName: z.string().trim().min(2, 'El apellido es obligatorio.').max(100),
  phone: optionalPhoneSchema,
  email: optionalEmailSchema,
  address: optionalTrimmedString(250),
  rfc: optionalRfcSchema,
  projectAddress: optionalTrimmedString(250),
  initialContactDate: optionalDateSchema,
  status: z.nativeEnum(ClientStatus).default(ClientStatus.ACTIVE),
  notes: optionalTrimmedString(2_000)
});

export type ClientSchemaInput = z.infer<typeof clientSchema>;
