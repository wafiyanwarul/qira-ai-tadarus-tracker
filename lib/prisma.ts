// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '@/src/config/env';

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
    pgPool: Pool | undefined;
};

const pool =
    globalForPrisma.pgPool ||
    new Pool({
        connectionString: env.DATABASE_URL,
    });

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter: new PrismaPg(pool),
        log: env.isProduction ? ['error'] : ['query', 'warn', 'error'],
    });

if (!env.isProduction) {
    globalForPrisma.pgPool = pool;
    globalForPrisma.prisma = prisma;
}

