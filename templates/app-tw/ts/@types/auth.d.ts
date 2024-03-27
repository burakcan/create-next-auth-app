import { type DefaultSession, type DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    emailVerified: Date | null;
  }

  interface Session extends DefaultSession {
    user: User & {
      id: string;
    };
  }
}
