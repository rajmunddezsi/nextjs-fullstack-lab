import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { getUserByEmail } from "@/lib/users/userRepository";

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
      if (!user.email) {
        return false;
      }

      const existingUser = await getUserByEmail(user.email);

      if (!existingUser) {
        return true;
      }

      if (!existingUser.active) {
        return "/login?error=inactive";
      }

      return true;
    },
  },
});
