import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Logging
prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma Warning:', e);
});

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Error:', e);
});

// Test connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
});

export default prisma;

