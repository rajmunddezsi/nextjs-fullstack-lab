import { InvitationStatus, Role } from "@/generated/prisma/enums";
import { getUserByEmail } from "../users/userRepository";
import {
  createInvitationRecord,
  getInvitationByEmail,
  renewInvitationRecord,
} from "./invitationRepository";

export async function createOrRenewInvitation(
  email: string,
  role: Role,
  invitedById: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
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
    await createInvitationRecord(normalizedEmail, role, expiresAt, invitedById);

    return {
      success: true,
      message: "Invitation created successfully!",
    };
  }
  
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

  await renewInvitationRecord(normalizedEmail, role, expiresAt, invitedById);

  return {
    success: true,
    message: "Invitation has been renewed successfully!",
  };
}
