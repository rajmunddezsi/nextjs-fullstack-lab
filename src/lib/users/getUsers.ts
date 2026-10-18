import type { Role } from "@/generated/prisma/client";
import prisma from "../prisma";

export async function getUsers(
  query: string = "",
  role: Role | "" = "",
  active: boolean | undefined = undefined,
) {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
    where: {
      deletedAt: null,
      ...(active !== undefined && { active: { equals: active } }),
      ...(role && { role: { equals: role } }),
      ...(query && {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      }),
    },
  });
}
