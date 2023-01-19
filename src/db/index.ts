import { PrismaClient } from "@prisma/client"

export const prismaClient = async (): Promise<PrismaClient> => {
  const prisma = new PrismaClient()
  return prisma;
};
