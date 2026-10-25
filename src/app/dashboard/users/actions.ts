"use server";

import { auth } from "@/auth";
import {
  InvitationStatus,
  Role,
  type Role as RoleType,
} from "@/generated/prisma/enums";
import z from "zod";
import {
  getUserByEmail,
  restoreUserRecord,
  softDeleteUserRecord,
  updateUserRoleRecord,
  updateUserStatusRecord,
} from "@/lib/users/userRepository";
import { revalidatePath } from "next/cache";
import {
  createInvitationRecord,
  getInvitationByEmail,
  renewInvitationRecord,
} from "@/lib/invitations/invitationRepository";
import type { InvitationFormState } from "@/lib/users/types";

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

  let message = "";
  const { email, role } = validatedFields.data;
  const normalizedEmail = email.toLowerCase();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 7);

  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    return {
      success: false,
      message: "A user with this email already exists!",
    };
  }

  const existingInvitation = await getInvitationByEmail(normalizedEmail);

  if (!existingInvitation) {
    await createInvitationRecord(
      normalizedEmail,
      role,
      expiresAt,
      session.user.id,
    );

    message = "Invitation created successfully!";
  } else {
    if (existingInvitation.status === InvitationStatus.ACCEPTED) {
      return {
        success: false,
        message: "This invitation has already been accepted.",
      };
    }

    if (
      existingInvitation.status === InvitationStatus.PENDING &&
      existingInvitation.expiresAt > now
    ) {
      return {
        success: false,
        message: "An active invitation already exists for this email.",
      };
    }

    if (
      existingInvitation.status === InvitationStatus.REVOKED ||
      (existingInvitation.status === InvitationStatus.PENDING &&
        existingInvitation.expiresAt <= now)
    ) {
      await renewInvitationRecord(
        normalizedEmail,
        role,
        expiresAt,
        session.user.id,
      );

      message = "Invitation has been renewed successfully!";
    }
  }

  revalidatePath("/dashboard/users");

  return {
    success: true,
    message: message,
  };
}
