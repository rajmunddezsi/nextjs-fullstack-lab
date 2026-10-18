'use server';

import { auth } from "@/auth";
import { Role, type Role as RoleType } from "@/generated/prisma/enums";
import z from 'zod';
import { updateUserRoleRecord } from "@/lib/users/userRepository";
import { revalidatePath } from "next/cache";

const updateRoleSchema = z.object({
    id: z.string().min(1),
    role: z.enum(Role)
})

export async function updateUserRole(
  userId: string,
  newRole: RoleType,
) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized!");
  }

  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden!");
  }

  if (session.user.id === userId) {
    throw new Error("User cannot update their own role!");
  }

  const validatedFields = updateRoleSchema.safeParse({
    id: userId,
    role: newRole
  })

  if (!validatedFields.success) {
    throw new Error('Invalid fields!');
  }

  const {id, role} = validatedFields.data;

  await updateUserRoleRecord(id, role);

  revalidatePath('/dashboard/users')
}
