import prisma from "../prisma";

export default async function getDeletedUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      deletedAt: true,
    },
    where: {
      deletedAt: {not: null},
    },
  });
}
