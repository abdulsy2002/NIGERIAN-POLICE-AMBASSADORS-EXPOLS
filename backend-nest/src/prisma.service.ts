import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function getPrismaClientOptions() {
  const configuredLimit = process.env.PRISMA_CONNECTION_LIMIT;
  if (configuredLimit === undefined) return {};

  if (!/^\d+$/.test(configuredLimit) || Number(configuredLimit) < 1 || Number(configuredLimit) > 100) {
    throw new Error('PRISMA_CONNECTION_LIMIT must be an integer between 1 and 100');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when PRISMA_CONNECTION_LIMIT is configured');
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL');
  }
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error('DATABASE_URL must use PostgreSQL');
  }
  databaseUrl.searchParams.set('connection_limit', configuredLimit);
  return { datasources: { db: { url: databaseUrl.toString() } } };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super(getPrismaClientOptions());
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}