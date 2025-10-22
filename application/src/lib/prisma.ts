// Prisma client import
import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * We use a global variable to ensure we only have one instance
 * of PrismaClient in development mode to prevent too many connections
 */
const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

/**
 * Export the Prisma client instance
 * In development, we reuse the same instance
 * In production, we create a new instance each time
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In development, save the Prisma client to the global object
// This prevents multiple instances from being created during hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}