import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton
 * 
 * In development, the instance is stored in a global variable to prevent
 * multiple instances during hot reloading.
 * 
 * In production, a new instance is created for each request.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Note: Prisma Client connects automatically on first query
// No need to call $connect() explicitly, especially for Edge runtime compatibility

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

