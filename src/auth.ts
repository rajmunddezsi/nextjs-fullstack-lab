import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { getUserByEmail } from "@/lib/users/userRepository";
import { getInvitationByEmail } from "./lib/invitations/invitationRepository";
import { InvitationStatus } from "./generated/prisma/enums";
import { Invitation } from "./generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, GitHub],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;

      return session;
    },
    async signIn({ user }) {
      const normalizedEmail = user.email?.toLowerCase();

      if (!normalizedEmail) {
        return false;
      }

      const existingUser = await getUserByEmail(normalizedEmail);

      if (existingUser) {
        if (!existingUser.active) {
          return "/login?error=inactive";
        }

        return true;
      }

      const existingInvitation = await getInvitationByEmail(normalizedEmail);

      if (!existingInvitation) {
        return "/login?error=no-invitation";
      }

      const { status, expiresAt } = existingInvitation;
      const now = new Date();

      if (status !== InvitationStatus.PENDING) {
        return "/login?error=invitation-invalid";
      }

      if (expiresAt <= now) {
        return "/login?error=invitation-expired";
      }

      return true;
    },
  },
});
