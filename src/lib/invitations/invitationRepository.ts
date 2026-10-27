import {
  InvitationStatus,
  type Role as RoleType,
} from "@/generated/prisma/enums";
import prisma from "../prisma";

export async function getInvitations() {
  return await prisma.invitation.findMany({
    select: {
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      invitedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getInvitationByEmail(email: string) {
  return await prisma.invitation.findUnique({
    where: { email },
  });
}

export async function createInvitationRecord(
  email: string,
  role: RoleType,
  expiresAt: Date,
  invitedById: string,
) {
  return await prisma.invitation.create({
    data: {
      email,
      role,
      expiresAt,
      invitedById,
    },
  });
}

export async function renewInvitationRecord(
  email: string,
  role: RoleType,
  expiresAt: Date,
  invitedById: string,
) {
  return await prisma.invitation.update({
    where: { email },
    data: {
      role,
      status: InvitationStatus.PENDING,
      expiresAt,
      acceptedAt: null,
      invitedById,
    },
  });
}

export async function revokeInvitationRecord(email: string) {
  return await prisma.invitation.update({
    where: { email },
    data: {
      status: InvitationStatus.REVOKED,
    },
  });
}

export async function acceptInvitationForUser(userId: string, email: string) {
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({ where: { email } });

    if (!invitation) {
      throw new Error("Invitation does not exist!");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error("Invalid invitation status!");
    }

    const now = new Date();

    if (invitation.expiresAt <= now) {
      throw new Error("Invitation has expired!");
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        role: invitation.role,
      },
    });

    await tx.invitation.update({
      where: {
        email,
      },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: now,
      },
    });

    return user;
  });
}
