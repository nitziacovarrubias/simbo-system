import type { ClientStatus, Prisma, PrismaClient } from '@prisma/client';

const clientListInclude = {
  person: true,
  _count: { select: { projects: true } }
} satisfies Prisma.ClientInclude;

const clientDetailInclude = {
  person: true,
  projects: {
    select: {
      id: true,
      name: true,
      status: true,
      location: true,
      startDate: true,
      deliveryDate: true
    },
    orderBy: { updatedAt: 'desc' as const }
  }
} satisfies Prisma.ClientInclude;

export type ClientListRecord = Prisma.ClientGetPayload<{ include: typeof clientListInclude }>;
export type ClientDetailRecord = Prisma.ClientGetPayload<{ include: typeof clientDetailInclude }>;

export interface ClientPersistenceInput {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  rfc: string | null;
  projectAddress: string | null;
  initialContactDate: Date | null;
  status: ClientStatus;
  notes: string | null;
}

export class ClientRepository {
  constructor(private readonly db: PrismaClient) {}

  list(): Promise<ClientListRecord[]> {
    return this.db.client.findMany({
      include: clientListInclude,
      orderBy: { updatedAt: 'desc' }
    });
  }

  findById(id: string): Promise<ClientDetailRecord | null> {
    return this.db.client.findUnique({
      where: { id },
      include: clientDetailInclude
    });
  }

  findByEmail(email: string, excludeClientId?: string) {
    return this.db.client.findFirst({
      where: {
        id: excludeClientId ? { not: excludeClientId } : undefined,
        person: { is: { email } }
      },
      select: { id: true }
    });
  }

  create(input: ClientPersistenceInput): Promise<ClientDetailRecord> {
    return this.db.client.create({
      data: {
        projectAddress: input.projectAddress,
        initialContactDate: input.initialContactDate,
        status: input.status,
        notes: input.notes,
        person: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            email: input.email,
            address: input.address,
            rfc: input.rfc
          }
        }
      },
      include: clientDetailInclude
    });
  }

  update(id: string, input: ClientPersistenceInput): Promise<ClientDetailRecord> {
    return this.db.client.update({
      where: { id },
      data: {
        projectAddress: input.projectAddress,
        initialContactDate: input.initialContactDate,
        status: input.status,
        notes: input.notes,
        person: {
          update: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            email: input.email,
            address: input.address,
            rfc: input.rfc
          }
        }
      },
      include: clientDetailInclude
    });
  }

  countActive(): Promise<number> {
    return this.db.client.count({
      where: { status: 'ACTIVE' }
    });
  }
}
