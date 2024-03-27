import "server-only";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import type { NextAuthOptions, SessionOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsLoginProvider from "./providers/CredentialsLoginProvider";
import CredentialsSignupProvider from "./providers/CredentialsSignupProvider";
import { successVerificationCode } from "./utils/emailVerification";
import prisma from "@/services/db";

const session: SessionOptions = {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
  generateSessionToken: async () => randomUUID(),
};

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  session,
  events: {
    signIn: async (message) => {
      if (
        message.isNewUser &&
        (message.account?.provider === "github" ||
          message.account?.provider === "google") &&
        !message.user?.emailVerified
      ) {
        await successVerificationCode(message.user.id);
      }
    },
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        session.user.emailVerified = user.emailVerified;
      }

      return session;
    },
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsSignupProvider,
    CredentialsLoginProvider,
  ],
  // debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
