import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Explicitly pass connection URL to support Prisma 7 / Schema-less config
export const db =
  globalThis.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
