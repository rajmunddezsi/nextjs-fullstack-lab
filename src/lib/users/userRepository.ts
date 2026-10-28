import type { Role } from "@/generated/prisma/enums";
import prisma from "../prisma";

export async function updateUserRoleRecord(id: string, role: Role) {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
}

export async function updateUserStatusRecord(id: string, active: boolean) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: { active },
    });

    if (!active) {
      await tx.session.deleteMany({ where: { userId: id } });
    }

    return user;
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      active: true,
    },
  });
}

export async function softDeleteUserRecord(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });

    await tx.session.deleteMany({
      where: { userId },
    });

    return user;
  });
}

export async function restoreUserRecord(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: null },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
}

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
      deletedAt: { not: null },
    },
  });
}
