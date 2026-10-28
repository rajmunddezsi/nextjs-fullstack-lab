"use server";

import { auth } from "@/auth";
import {
  InvitationStatus,
  Role,
  type Role as RoleType,
} from "@/generated/prisma/enums";
import z from "zod";
import {
  restoreUserRecord,
  softDeleteUserRecord,
  updateUserRoleRecord,
  updateUserStatusRecord,
} from "@/lib/users/userRepository";
import { revalidatePath } from "next/cache";
import {
  getInvitationByEmail,
  revokeInvitationRecord,
} from "@/lib/invitations/invitationRepository";
import type { InvitationFormState } from "@/lib/users/types";
import { createOrRenewInvitation } from "@/lib/invitations/invitationService";

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

const createInvitationSchema = z.object({
  email: z.email().trim(),
  role: z.enum(Role),
});

export async function createInvitation(
  _: InvitationFormState,
  formData: FormData,
): Promise<InvitationFormState> {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthenticated!");
  }

  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden!");
  }

  const validatedFields = createInvitationSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid field(s)",
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const { email, role } = validatedFields.data;
  const result = await createOrRenewInvitation(email, role, session.user.id);

  revalidatePath("/dashboard/users");

  return result;
}

const revokeInvitationSchema = z.object({
  email: z.email().trim(),
});

export async function revokeInvitation(email: string) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthenticated!");
  }

  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden!");
  }

  const validatedFields = revokeInvitationSchema.safeParse({
    email,
  });

  if (!validatedFields.success) {
    throw new Error("Invalid field(s)");
  }

  const { email: validatedEmail } = validatedFields.data;
  const normalizedEmail = validatedEmail.toLowerCase();
  const now = new Date();

  const existedInvitation = await getInvitationByEmail(normalizedEmail);

  if (!existedInvitation) {
    throw new Error("Invitation not found!");
  }

  if (
    existedInvitation.status !== InvitationStatus.PENDING ||
    existedInvitation.expiresAt <= now
  ) {
    throw new Error("Only active pending invitations can be revoked.");
  }

  await revokeInvitationRecord(normalizedEmail);

  revalidatePath("/dashboard/users/invitations");
}
