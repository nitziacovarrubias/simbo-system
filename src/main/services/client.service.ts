import { prisma } from '../database/prisma';
import { ClientRepository } from '../repositories/client.repository';
import { toClientListItem } from './mappers';
import type { ClientListItem } from '../../shared/types';

export class ClientService {
  private readonly clients = new ClientRepository(prisma);

  async listClients(): Promise<ClientListItem[]> {
    const clients = await this.clients.list();
    return clients.map(toClientListItem);
  }
}
