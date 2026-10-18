"use server";

import { auth } from "@/auth";
import { Role, type Role as RoleType } from "@/generated/prisma/enums";
import z from "zod";
import {
  restoreUserRecord,
  softDeleteUserRecord,
  updateUserRoleRecord,
  updateUserStatusRecord,
} from "@/lib/users/userRepository";
import { revalidatePath } from "next/cache";

const updateRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum(Role),
});

export async function updateUserRole(userId: string, newRole: RoleType) {
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
    role: newRole,
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { id, role } = validatedFields.data;

  await updateUserRoleRecord(id, role);

  revalidatePath("/dashboard/users");
}

const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  active: z.boolean(),
});

export async function updateUserStatus(userId: string, active: boolean) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized!");
  }

  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden!");
  }

  if (session.user.id === userId) {
    throw new Error("User cannot update their own status!");
  }

  const validatedFields = updateUserStatusSchema.safeParse({
    userId,
    active,
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { userId: validatedUserId, active: validatedActive } =
    validatedFields.data;

  await updateUserStatusRecord(validatedUserId, validatedActive);

  revalidatePath("/dashboard/users");
}

const userIdSchema = z.object({
  userId: z.string().min(1),
});

export async function softDeleteUser(userId: string) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized!");
  }

  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden!");
  }

  if (session.user.id === userId) {
    throw new Error("Users cannot delete their own account!");
  }

  const validatedFields = userIdSchema.safeParse({
    userId,
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { userId: validatedUserId } = validatedFields.data;

  await softDeleteUserRecord(validatedUserId);

  revalidatePath("/dashboard/users");
}

export async function restoreUser(id: string) {

  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized!");
  }

  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden!");
  }

  const validatedFields = userIdSchema.safeParse({
    userId: id,
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields!");
  }

  const { userId } = validatedFields.data;

  await restoreUserRecord(userId);

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/users/archived");
}