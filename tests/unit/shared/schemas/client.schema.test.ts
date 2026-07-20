import { describe, expect, it } from 'vitest';
import { clientSchema } from '../../../../src/shared/schemas/client.schema';
import { ClientStatus } from '../../../../src/shared/constants/domain.enums';

describe('clientSchema', () => {
  it('validates a complete client', () => {
    const result = clientSchema.safeParse({
      firstName: 'Laura',
      lastName: 'Méndez',
      phone: '+52 662 123 4567',
      email: 'laura@example.com',
      address: 'Hermosillo, Sonora',
      rfc: 'MEML900101ABC',
      projectAddress: 'Colonia Centro',
      initialContactDate: '2026-07-19',
      status: ClientStatus.ACTIVE,
      notes: ''
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email and short name', () => {
    const result = clientSchema.safeParse({
      firstName: 'L',
      lastName: 'M',
      email: 'correo-invalido',
      status: ClientStatus.ACTIVE
    });

    expect(result.success).toBe(false);
  });
});
