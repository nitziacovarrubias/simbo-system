import { describe, expect, it, vi } from 'vitest';

vi.mock('@prisma/client', () => ({
  ClientStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVED: 'ARCHIVED'
  }
}));

vi.mock('../../../../src/main/database/prisma', () => ({
  prisma: {}
}));

import { ClientService } from '../../../../src/main/services/client.service';
import type { ClientRepositoryPort } from '../../../../src/main/services/client.service';
import { ClientStatus } from '../../../../src/shared/constants/domain.enums';

describe('ClientService', () => {
  it('rejects an obvious duplicate email', async () => {
    const clients = {
      list: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue({ id: 'existing-client' }),
      create: vi.fn(),
      update: vi.fn()
    } as unknown as ClientRepositoryPort;
    const service = new ClientService(clients);

    await expect(
      service.createClient({
        firstName: 'Laura',
        lastName: 'Méndez',
        email: 'LAURA@EXAMPLE.COM',
        status: ClientStatus.ACTIVE
      })
    ).rejects.toThrow('Ya existe un cliente');

    expect(clients.findByEmail).toHaveBeenCalledWith('laura@example.com');
    expect(clients.create).not.toHaveBeenCalled();
  });
});
