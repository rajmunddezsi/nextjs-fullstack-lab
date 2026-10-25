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
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
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

export async function revokeInvitationRecord(
  email: string
) {
  return await prisma.invitation.update({
    where: { email },
    data: {
      status: InvitationStatus.REVOKED
    },
  });
}
