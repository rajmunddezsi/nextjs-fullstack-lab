import type { Role } from "@/generated/prisma/enums";
import prisma from "../prisma";

export async function updateUserRoleRecord(id: string, role: Role) {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
}

export async function updateUserStatusRecord(id: string, active: boolean) {
  return prisma.user.update({
    where: { id },
    data: { active },
  });
}
