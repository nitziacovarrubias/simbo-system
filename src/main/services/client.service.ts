import { ClientStatus as PrismaClientStatus } from '@prisma/client';
import { prisma } from '../database/prisma';
import { ClientRepository } from '../repositories/client.repository';
import { clientSchema } from '../../shared/schemas';
import { toClientDetail, toClientListItem } from './mappers';
import type { ClientDetail, ClientListItem, ClientMutationInput } from '../../shared/types';

export type ClientRepositoryPort = Pick<
  ClientRepository,
  'list' | 'findById' | 'findByEmail' | 'create' | 'update'
>;

function normalizeNullable(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export class ClientService {
  constructor(private readonly clients: ClientRepositoryPort = new ClientRepository(prisma)) {}

  async listClients(): Promise<ClientListItem[]> {
    const clients = await this.clients.list();
    return clients.map(toClientListItem);
  }

  async getClientById(clientId: string): Promise<ClientDetail> {
    const client = await this.clients.findById(clientId);
    if (!client) {
      throw new Error('El cliente solicitado no existe.');
    }

    return toClientDetail(client);
  }

  async createClient(input: ClientMutationInput): Promise<ClientDetail> {
    const validInput = clientSchema.parse(input);
    const email = normalizeNullable(validInput.email)?.toLowerCase() ?? null;

    if (email && (await this.clients.findByEmail(email))) {
      throw new Error('Ya existe un cliente registrado con ese correo.');
    }

    const client = await this.clients.create({
      firstName: validInput.firstName,
      lastName: validInput.lastName,
      phone: normalizeNullable(validInput.phone),
      email,
      address: normalizeNullable(validInput.address),
      rfc: normalizeNullable(validInput.rfc),
      projectAddress: normalizeNullable(validInput.projectAddress),
      initialContactDate: validInput.initialContactDate
        ? new Date(validInput.initialContactDate)
        : null,
      status: validInput.status as PrismaClientStatus,
      notes: normalizeNullable(validInput.notes)
    });

    return toClientDetail(client);
  }

  async updateClient(clientId: string, input: ClientMutationInput): Promise<ClientDetail> {
    const current = await this.clients.findById(clientId);
    if (!current) {
      throw new Error('El cliente solicitado no existe.');
    }

    const validInput = clientSchema.parse(input);
    const email = normalizeNullable(validInput.email)?.toLowerCase() ?? null;

    if (email && (await this.clients.findByEmail(email, clientId))) {
      throw new Error('Ya existe otro cliente registrado con ese correo.');
    }

    const client = await this.clients.update(clientId, {
      firstName: validInput.firstName,
      lastName: validInput.lastName,
      phone: normalizeNullable(validInput.phone),
      email,
      address: normalizeNullable(validInput.address),
      rfc: normalizeNullable(validInput.rfc),
      projectAddress: normalizeNullable(validInput.projectAddress),
      initialContactDate: validInput.initialContactDate
        ? new Date(validInput.initialContactDate)
        : null,
      status: validInput.status as PrismaClientStatus,
      notes: normalizeNullable(validInput.notes)
    });

    return toClientDetail(client);
  }
}
