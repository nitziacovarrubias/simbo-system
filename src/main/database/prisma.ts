import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import type { DatabaseStatus } from '../../shared/types';

const globalForPrisma = globalThis as typeof globalThis & {
  simboPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.simboPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.simboPrisma = prisma;
}

function maskDatabaseUrl(databaseUrl: string | undefined): string {
  if (!databaseUrl) {
    return 'DATABASE_URL no configurada';
  }

  return databaseUrl.replace(/file:(.*)/, 'file:***');
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      isConnected: true,
      provider: 'sqlite',
      message: 'Base de datos conectada correctamente.',
      checkedAt: new Date().toISOString(),
      databaseUrlMasked: maskDatabaseUrl(process.env.DATABASE_URL),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return {
      isConnected: false,
      provider: 'sqlite',
      message: `No se pudo conectar a la base de datos: ${message}`,
      checkedAt: new Date().toISOString(),
      databaseUrlMasked: maskDatabaseUrl(process.env.DATABASE_URL),
    };
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
